---
quick_id: 260621-eso
type: quick-task
branch: hotfix/data-error
files_modified:
  - app/api/notion-block-image/route.ts
  - infrastructure/queries/notion-image-cache.query.ts   # deleted (orphaned)
autonomous: false   # one human-verify checkpoint (curl + build)
---

<objective>
Make `GET /api/notion-block-image?blockId=...&gif=...` fully **on-demand**: every
request resolves a *loadable* image URL and returns a **302 redirect** to it. The
browser / Next image optimizer then loads the bytes directly from S3 (or the public
host). Remove the Supabase storage byte-cache and the byte-proxy download entirely.

Purpose: Fix the 502 on `blockId=2429c76c-6cb4-815b-9e9a-c42d17201aac`. Root cause
(established fact): the unofficial recordMap path yields a **bare unsigned** S3 URL
(`prod-files-secure.s3...` with no `X-Amz-` params) → 403 on fetch → route returns
502. The official API `notion.blocks.retrieve` returns a fresh **signed** URL that
loads 200. By always redirecting to a freshly-resolved loadable URL we stop proxying
bytes and the unsigned-S3 case is fixed structurally.

Output:
- Rewritten `route.ts` (resolve loadable URL → 302 redirect, conservative Cache-Control).
- Deleted `infrastructure/queries/notion-image-cache.query.ts` (now orphaned).
- `next build` green + curl proof that the failing blockId returns 302 → signed S3.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@app/api/notion-block-image/route.ts
@infrastructure/database/external-api/notion-client.ts
@shared/utils/notion-image-utils.ts
@next.config.ts
@app/(blog)/_components/NotionPageContent.tsx
</context>

<orphan_decisions>
Grep results (importers outside this route):

| Symbol / file | Other importers | Decision |
|---------------|-----------------|----------|
| `infrastructure/queries/notion-image-cache.query.ts` | NONE (only this route) | **DELETE the file** — fully orphaned after rewrite. |
| `fetchImageWithRetry` (notion-image-utils.ts) | `app/api/og-image/[postId]/route.ts`, `app/api/notion-image/route.ts` | **KEEP** — still used elsewhere. |
| `isGif` (notion-image-utils.ts) | `app/api/notion-image/route.ts` | **KEEP** — still used elsewhere. |
| `convertToNotionImageUrl` (notion-image-utils.ts) | NONE other than this route | **KEEP function in place** — the file stays for the two helpers above; removing one function from a kept file is a needless edit. Just stop importing it here. |

Net: only `notion-image-cache.query.ts` gets deleted. `shared/utils/notion-image-utils.ts` is untouched.
</orphan_decisions>

<remote_patterns_check>
Redirect targets vs `next.config.ts` `images.remotePatterns`:

- Official-API `image.file.url` → host `prod-files-secure.s3.us-west-2.amazonaws.com` → **allowlisted** ✓
- `bookmark_cover` / `display_source` / `image.external.url` → arbitrary public host.
  - The image optimizer (`/_next/image`) only fetches **non-GIF** `image`-type blocks
    through this route → those resolve to S3 (allowed). GIFs render `unoptimized`
    (frontend `gif=1`) so they bypass the optimizer.
  - External/public covers are the only case whose redirect host may not be
    allowlisted. Pre-change they flowed through the *same* endpoint, so this is not a
    regression. FLAG (no action required): if a bookmark cover on a public host ever
    needs `/_next/image` optimization, add that host to `remotePatterns`. For now the
    302 still works for direct `<img>`/unoptimized loads.

Conclusion: no `next.config.ts` change required. S3 + `www.notion.so` already allowlisted.
</remote_patterns_check>

<tasks>

<task type="auto">
  <name>Task 1: Rewrite route as on-demand 302 redirect resolver</name>
  <files>app/api/notion-block-image/route.ts</files>
  <action>
Replace the entire file body with an on-demand resolver that returns a 302 redirect
to a loadable URL — never downloads/proxies bytes, never touches Supabase storage.

Imports: keep `getNotionPage, notion` from
`@/infrastructure/database/external-api/notion-client` and `NextRequest, NextResponse`
from `next/server`. REMOVE the `notionImageCache` import and the
`convertToNotionImageUrl, fetchImageWithRetry, isGif` import (no longer used here).

`GET` flow:

1. Read `blockId` from searchParams. Missing → `NextResponse.json({ error: 'blockId is required' }, { status: 400 })`. The `gif` param is now read-by-frontend-only; the route no longer branches on it (note this in a comment; do NOT change the frontend URL construction).

2. Wrap the resolution in a single try/catch. On thrown error → `NextResponse.json({ error: 'Internal server error' }, { status: 500 })`. Preserve `[notion-block-image]` console.log / console.error logging style.

3. Define a single helper `redirectTo(url)` that returns `NextResponse.redirect(url, 302)` with header `Cache-Control: public, max-age=1800`. Add a comment explaining: signed S3 URLs expire in 1h (`X-Amz-Expires=3600`); 30-min cache leaves ≥30-min signature validity margin so a cached redirect never outlives its signature.

4. **Primary — official API.** `await notion.blocks.retrieve({ block_id: blockId })`. If `'type' in block && block.type === 'image'`: pick `image.type === 'file' ? image.file.url : image.external.url` (fresh + signed) and `return redirectTo(url)`. This covers the broken unsigned-S3 image-block case. If `blocks.retrieve` throws OR the block is not an image type, do NOT return yet — log and fall through to step 5 (official API does not resolve bookmark covers / page covers).

5. **Fallback — unofficial recordMap.** `const recordMap = await getNotionPage(blockId); const block = recordMap.block[blockId]?.value`. If no block → `NextResponse.json({ error: 'Block not found' }, { status: 404 })`. Resolve a *loadable* URL in this priority, redirect on first hit:
   - a) `recordMap.signed_urls?.[blockId]` (already signed) → redirect.
   - b) For `block.type === 'image'`: candidate = `block.format?.display_source` ?? `block.properties?.source?.[0]?.[0]`. Redirect ONLY IF the candidate is a *loadable* URL — define an inline predicate `isLoadable(u)`: must be absolute `http(s)`, AND NOT a bare-unsigned Notion S3 URL. Treat as bare-unsigned (NOT loadable) when the host contains `prod-files-secure.s3` or `secure.notion-static.com` AND the URL has no `X-Amz-` signature (i.e. `!u.includes('X-Amz-')`). Public external hosts (no Notion S3 host) are loadable. If candidate is `attachment:` or bare-unsigned → not loadable, skip (step 1 already tried the official API for image blocks).
   - c) `block.type === 'bookmark'` → `block.format?.bookmark_cover` if present → redirect.
   - d) Nothing loadable resolved → `NextResponse.json({ error: 'Image URL not found' }, { status: 404 })`.

Do NOT introduce fenced code; keep this as the implementation contract. No byte
download, no `new NextResponse(buffer)`, no `arrayBuffer()`, no storage calls anywhere.
  </action>
  <verify>
    <automated>grep -vE '^\s*(//|\*|/\*)' app/api/notion-block-image/route.ts | grep -Eqc 'notionImageCache|fetchImageWithRetry|arrayBuffer|new NextResponse\(' && echo FAIL || echo OK</automated>
  </verify>
  <done>
Route imports only `getNotionPage, notion` + `NextRequest, NextResponse`. No
`notionImageCache`, no `arrayBuffer`, no byte `new NextResponse(...)`. Official-API
image path returns `NextResponse.redirect(url, 302)` with
`Cache-Control: public, max-age=1800`; recordMap fallback follows the a→d priority;
404 on no loadable URL, 500 on thrown error.
  </done>
</task>

<task type="auto">
  <name>Task 2: Delete orphaned notion-image-cache.query.ts and confirm no dangling imports</name>
  <files>infrastructure/queries/notion-image-cache.query.ts</files>
  <action>
Delete `infrastructure/queries/notion-image-cache.query.ts` (orphaned after Task 1 —
grep confirmed this route was its only importer). Do NOT touch
`shared/utils/notion-image-utils.ts` (its `fetchImageWithRetry`/`isGif` are still used
by `app/api/og-image/[postId]/route.ts` and `app/api/notion-image/route.ts`). Do NOT
touch `infrastructure/database/supabase/storage.ts` unless grep shows it is now
orphaned too — verify with a grep of `NOTION_IMAGE_BUCKET` / `storageClient` importers
and leave it if anything else uses it.
  </action>
  <verify>
    <automated>test ! -f infrastructure/queries/notion-image-cache.query.ts && ! grep -rn "notion-image-cache.query" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -q . && echo OK || echo FAIL</automated>
  </verify>
  <done>
File deleted. No remaining imports of `notion-image-cache.query` anywhere.
`notion-image-utils.ts` left intact.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
On-demand 302 redirect route + deletion of the orphaned storage byte-cache.
Build must stay green and the previously-502 blockId must now 302 to a signed S3 URL.
  </what-built>
  <how-to-verify>
1. Build green:
   `npm run build`
   → expect a successful build with no type error from the removed imports / deleted file.

2. Start dev (needs `NOTION_TOKEN` for `notion.blocks.retrieve`):
   `npm run dev`

3. Curl the previously-failing block, following nothing, inspect status + Location:
   `curl -sS -o /dev/null -D - "http://localhost:3000/api/notion-block-image?blockId=2429c76c-6cb4-815b-9e9a-c42d17201aac"`
   → expect `HTTP/1.1 302`, a `location:` header pointing at
     `https://prod-files-secure.s3.us-west-2.amazonaws.com/...?X-Amz-...` (signed),
     and `cache-control: public, max-age=1800`. NOT 502.

4. (Optional) Sanity-check a normal image block and a bookmark-cover block render in
   the running blog with no broken images.
  </how-to-verify>
  <resume-signal>Type "approved" once build is green and the curl returns 302 → signed S3, or describe the failure.</resume-signal>
</task>

</tasks>

<verification>
- `npm run build` succeeds (no dangling import / deleted-file type errors).
- Failing blockId returns `302` with signed-S3 `location` (was `502`).
- `grep -rn "notion-image-cache.query"` (excluding node_modules) returns nothing.
- `shared/utils/notion-image-utils.ts` untouched; `og-image` and `notion-image` routes still compile.
</verification>

<success_criteria>
- Route always resolves a loadable URL and 302-redirects; no byte proxy, no Supabase storage in this route.
- Official-API image path fixes the unsigned-S3 502 case.
- recordMap fallback still serves `signed_urls`, loadable `display_source`/`source`, and `bookmark_cover`.
- `Cache-Control: public, max-age=1800` on the redirect (signature-safe).
- `notion-image-cache.query.ts` deleted; no orphaned imports; shared utils preserved.
- Frontend `mapImageUrl` contract (`?blockId=...&gif=...`) unchanged.
</success_criteria>

<output>
Quick task — no SUMMARY file required. Report build + curl result on completion.
</output>
