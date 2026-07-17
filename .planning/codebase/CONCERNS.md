# Codebase Concerns

**Analysis Date:** 2026-06-20

---

## 1. Active Build Failure — recordMap Double-Nesting (CRITICAL)

**Area:** Notion unofficial API response format change

**Issue:** Notion's private API now wraps each record as `{ value: { value, role } }` instead of the flat `{ role, value }` structure that `react-notion-x` expects. This causes `block.value.id` to be `undefined`, and `uuidToId(undefined)` in `notion-utils` crashes with `TypeError: Cannot read properties of undefined (reading 'replaceAll')`. All 52+ blocks in every tested post are double-nested — this is not a per-post issue.

**Files affected:**
- `infrastructure/queries/post.query.ts:52` — `notionAPI.getPage(id)` call inside `unstable_cache`, return value is not normalized
- `app/api/notion-block-image/route.ts:20` — `notionAPI.getPage(blockId)` then reads `block.type` and `block.format` which are `undefined` under double-nesting
- `app/api/notion/page/route.ts:26` — returns raw `notionAPI.getPage(pageId)` to client; client-side `react-notion-x` crashes on consumption
- `infrastructure/database/external-api/notion-client.ts:10` — `notionAPI = new NotionAPI()` is the single source, but no normalization wrapper exists

**Impact:**
- `next build` fails during SSG for any post not in `SKIP_SSG_IDS`
- Image proxy route (`notion-block-image`) silently returns wrong data (`block.type === undefined`, URL extraction fails)
- `api/notion/page` route delivers broken `recordMap` to any external consumer

**Fix (not yet applied):** Create `normalizeRecordMap()` in `infrastructure/database/external-api/normalize-record-map.ts` as a idempotent unwrap function (`if ('value' in nested) records[id] = { role: nested.role, value: nested.value }`), then apply it at all three `getPage` call sites. Apply to `cachedFn()` return value in `post.query.ts` (outside the cached function) to handle stale cache hits. Full spec in `docs/빌드실패-replaceAll-진단-보고서.md`.

---

## 2. `SKIP_SSG_IDS` Hardcoded Allowlist Masking Build Crashes

**Area:** `app/(blog)/blog/[id]/page.tsx`

**Issue:** Lines 21–32 define a hardcoded `Set` of post IDs excluded from `generateStaticParams()`, routing them to dynamic rendering instead:

```ts
const SKIP_SSG_IDS = new Set([
    '2c39c76c-6cb4-80f0-a79e-e935e2bed857',
    '2c59c76c-6cb4-803e-95eb-f0fe5d659685',
]);
```

Because the double-nesting bug affects **all** posts, any new post published to Notion will break the next `next build` run until its ID is manually added here. This is a whack-a-mole workaround masking a systemic issue.

**Files:** `app/(blog)/blog/[id]/page.tsx:21–33`

**Impact:** Each new post is a potential build bomb. The list must grow forever until the root cause (concern #1) is resolved. Skipped posts also get worse SEO (no SSG, no prerendering).

**Fix:** Remove `SKIP_SSG_IDS` entirely after applying `normalizeRecordMap()` fix from concern #1.

---

## 3. `react-notion-x` / `notion-client` / `notion-utils` / `notion-types` Pinned to 7.4.3 (No `^`)

**Area:** `package.json` dependency management

**Issue:** All four notion packages are hard-pinned without the caret range operator:

```json
"notion-client": "7.4.3",
"notion-types": "7.4.3",
"notion-utils": "7.4.3",
"react-notion-x": "7.4.3"
```

This was an intentional rollback from v7.10.0, which caused blog 404 errors (root cause of 7.10 regression not investigated). The upstream library is actively maintained (7.10.0 released 2026-03-19) and ships fixes this project needs, but the 7.10 regression blocks upgrades.

**Files:** `package.json`, git history (commits `63dfe00`, `38a3921`)

**Impact:** The project cannot receive upstream bug fixes or security patches. The double-nesting format change (concern #1) may already be addressed in 7.10 — but upgrading requires first identifying what caused the 7.4.3 → 7.10 404 regression.

**Fix approach:** Investigate 7.10 regression in isolation (a separate branch). Once root cause of 7.10 404 is identified and fixed, upgrade all four packages together and remove the `patch-package` patches (which patch 7.4.3-specific compiled output).

---

## 4. Structural Fragility — Dependency on Notion Unofficial/Private API

**Area:** `infrastructure/database/external-api/notion-client.ts`

**Issue:** `new NotionAPI()` from `notion-client` calls Notion's undocumented internal API (`www.notion.so/api/v3/*`). Notion can change response formats, authentication requirements, or rate limits at any time without notice. The current double-nesting crisis (concern #1) is a direct example of this: Notion silently changed `recordMap` record structure and broke SSG globally.

The `notion-client.ts` patch (`patches/notion-client+7.4.3.patch`) also replaces the `ky` HTTP client with a raw `fetch` call, meaning the project carries a fork of the library's HTTP layer.

**Files:**
- `infrastructure/database/external-api/notion-client.ts:10`
- `patches/notion-client+7.4.3.patch`

**Impact:** Any Notion-side change to their private API can silently break page rendering, image loading, or cause build failures — with no advance warning.

**Mitigation in place:** Official Notion API (`@notionhq/client`) is used in parallel for metadata queries (`post.query.ts`, `infrastructure/queries/`). Full migration to the official API is blocked by `react-notion-x`'s hard dependency on the unofficial `ExtendedRecordMap` format; migrating would require replacing the entire rendering layer (see `docs/빌드실패-replaceAll-진단-보고서.md` Appendix A for trade-off analysis).

---

## 5. Three `patch-package` Patches on Compiled Build Artifacts

**Area:** `patches/` directory

**Issue:** Three patches modify compiled `node_modules/**/build/index.js` directly:

- `patches/notion-client+7.4.3.patch` — replaces `ky.post(...)` with `fetch(...)` to bypass `mode: 'no-cors'` server-side incompatibility
- `patches/notion-utils+7.4.3.patch` — adds a `.gif` URL early-return in `defaultMapImageUrl` to prevent GIF rewrites
- `patches/react-notion-x+7.4.3.patch` — guards image handling for GIFs and reorders import statements to fix a runtime crash

**Files:** `patches/notion-client+7.4.3.patch`, `patches/notion-utils+7.4.3.patch`, `patches/react-notion-x+7.4.3.patch`

**Impact:** Patches apply against minified compiled output, making them brittle. Any version bump to any of the three packages (even a patch version) will either silently fail to apply or break the `postinstall` hook. These patches bypass the official `ky`-based HTTP abstraction and could interfere with retry logic or auth headers. There is no test coverage of the patch behavior.

**Fix approach:** Upstream GIF handling and the `fetch` migration as contributions to `react-notion-x`/`notion-client`, or absorb into a local wrapper once the version is upgraded.

---

## 6. Unauthenticated Cache-Flush Endpoints

**Area:** `app/api/revalidate/`

**Issue:** The revalidation routes are completely unauthenticated GET endpoints:

- `app/api/revalidate/all/route.ts` — flushes all ISR caches for all posts, images, and metadata
- `app/api/revalidate/[id]/route.ts` — flushes cache for a specific post
- `app/api/revalidate/about/route.ts` — flushes the about page

Any external actor who discovers these URLs can trigger a full cache purge, forcing cold re-fetches from Notion's API and potentially DoS-ing the site or exceeding API rate limits.

**Files:**
- `app/api/revalidate/all/route.ts`
- `app/api/revalidate/[id]/route.ts`
- `app/api/revalidate/about/route.ts`

**Impact:** Cache-busting denial-of-service; potential Notion API rate limit exhaustion.

**Fix:** Add a `REVALIDATE_SECRET` env var check (compare `request.headers.get('x-revalidate-token')` or a query param against the env var using `timingSafeEqual`). The `sidebar/route.ts` already does this correctly with `NOTION_WEBHOOK_SECERT_TOKEN` as a reference pattern.

---

## 7. Incomplete Notion Webhook Handler

**Area:** `app/api/notion/webhook/route.ts`

**Issue:** The webhook handler body is a stub — it only logs the payload and returns `undefined` (no response):

```ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log(body);
}
```

No response is returned, meaning Next.js will return a 200 with an empty body (or error depending on framework version). No cache invalidation, no event routing, no error handling.

**Files:** `app/api/notion/webhook/route.ts:1–7`

**Impact:** Notion webhook events are silently swallowed. Auto-revalidation on content change is non-functional.

**Fix:** Implement the webhook body (parse event type, call `revalidateTag` as appropriate, return `NextResponse.json`). The `sidebar/route.ts` POST handler shows the correct HMAC-verified webhook pattern to follow.

---

## 8. `api/notion/page` Route — Unauthenticated with Wildcard CORS

**Area:** `app/api/notion/page/route.ts`

**Issue:** This route fetches a full `ExtendedRecordMap` for any Notion page ID and returns it publicly, with `Access-Control-Allow-Origin: *`. There is no authentication or rate limiting.

```ts
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  ...
};
```

Combined with concern #1, the returned `recordMap` is currently double-nested and broken, so any consumer will crash.

**Files:** `app/api/notion/page/route.ts:6–9`

**Impact:** Exposes full Notion page content (including any non-public properties that appear in `recordMap`) to any origin. Could be used to harvest content or exhaust Notion API rate limits.

**Fix:** Restrict CORS to known origins, or add bearer token authentication. Apply `normalizeRecordMap()` before returning (concern #1 fix).

---

## 9. Env Var Handling Inconsistencies

**Area:** Various infrastructure files

**Issues:**

1. **Typo in env var name:** `process.env.NOTION_WEBHOOK_SECERT_TOKEN` (`app/api/sidebar/route.ts:7`) — "SECERT" instead of "SECRET". If the actual env var is named correctly, this will always be `undefined` and the webhook HMAC check will always fail with 500.

2. **Silent undefined at module init:** `infrastructure/database/supabase/client.ts:3–6` reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` without guards, then passes them with `!` non-null assertion to `createBrowserClient`. If missing, this throws at import time.

3. **Ambiguous DB URL fallback:** `infrastructure/database/drizzle/drizzle.ts:8` — `process.env.DATABASE_URL ?? process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL`. The fallback key `SUPABASE_NEXT_PUBLIC_SUPABASE_URL` looks like a typo or remnant (not a standard Supabase env var name); if `DATABASE_URL` is unset and this key is also missing, `postgres(undefined!, ...)` throws a runtime error.

4. **No env validation schema:** There is no `env.mjs`, `env.ts`, or Zod-based env validation at startup. Missing env vars fail late and with cryptic errors.

**Files:**
- `app/api/sidebar/route.ts:7`
- `infrastructure/database/supabase/client.ts:3–6`
- `infrastructure/database/drizzle/drizzle.ts:8`

---

## 10. `console.log` as Error Logging in Infrastructure Layer

**Area:** Infrastructure query and repository files

**Issue:** Error catch blocks throughout the infrastructure layer use `console.log(error)` (not `console.error`) for errors that are then swallowed:

```ts
// infrastructure/queries/post.query.ts:73–74
} catch (error) {
  console.log(error);
  return { success: false, error: error as Error };
}
```

This pattern appears in `infrastructure/queries/post.query.ts`, `infrastructure/queries/site-metrics.query.ts` (4×), `infrastructure/queries/page-views.query.ts` (4×), `infrastructure/queries/visitor-info.query.ts`, `infrastructure/repositories/page-view-repository.adapter.ts` (3×), `infrastructure/repositories/tag-info-repository.adapter.ts`, `infrastructure/repositories/site-metrics-repository.adapter.ts`.

**Impact:** Infrastructure errors appear at log level `log` rather than `error`, making them invisible to error monitoring tools that filter by log level. There is no structured logging — no request context, no stack traces, no severity.

**Fix:** Replace `console.log(error)` with `console.error(error)` in all catch blocks. Long-term: add a logging abstraction (e.g., `pino`) to enable structured log output.

---

## 11. `dangerouslySetInnerHTML` for Shiki-Generated HTML

**Area:** `app/(blog)/_components/CustomCodeBlock.tsx:45`

**Issue:** Server-side Shiki output is injected directly via `dangerouslySetInnerHTML`:

```tsx
<div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
```

The `highlightedHtml` string originates from Notion block content (`block.properties?.language`, `getBlockTitle(block, recordMap)`) processed through `highlight-code-blocks.ts`. Code content comes from Notion and is user-controlled (post author).

**Files:** `app/(blog)/_components/CustomCodeBlock.tsx:45`, `presentation/utils/highlight-code-blocks.ts:93–96`

**Impact:** If Shiki ever outputs unexpected HTML (bug, injection via language tag), it renders unsanitized. The fallback path at line 102 uses `escapeHtml()` but the primary Shiki path does not. Low risk given Shiki's output model, but the pattern is worth monitoring.

---

## 12. `next.config.ts` — `dangerouslyAllowSVG: true`

**Area:** `next.config.ts:36`

**Issue:** The Next.js Image component is configured with `dangerouslyAllowSVG: true`. SVG files can contain `<script>` tags and JavaScript. The CSP companion setting (`contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"`) mitigates but does not fully eliminate risk when SVGs contain non-script active content.

**Files:** `next.config.ts:36–38`

**Impact:** Notion-hosted SVG images rendered through `<Image>` could be a vector for stored XSS if a malicious SVG is uploaded to Notion.

---

## 13. `as unknown as ExtendedRecordMap` Type Casting

**Area:** `infrastructure/queries/post.query.ts`, `infrastructure/repositories/post.repository.adapter.ts`

**Issue:** The return value of `notionAPI.getPage()` is cast to `notionType.ExtendedRecordMap` through double-casting:

```ts
data: result as unknown as notionType.ExtendedRecordMap,
```

This cast appears at `post.query.ts:71` and `post.repository.adapter.ts:138` and `:196`. The cast is what allows the double-nested structure (concern #1) to pass TypeScript's type system without error — the actual runtime shape does not match the declared type.

**Files:**
- `infrastructure/queries/post.query.ts:71`
- `infrastructure/repositories/post.repository.adapter.ts:138, 196`

**Impact:** TypeScript cannot catch type mismatches downstream. The double-nesting bug went undetected at compile time precisely because of this cast.

---

## 14. Test Coverage Gaps

**Area:** `__tests__/`

**Issues:**
- No tests cover `infrastructure/queries/post.query.ts` or the `notionAPI.getPage` code path — the most critical path for the build failure.
- No tests for `normalizeRecordMap` (the proposed fix) — the fix has no test harness defined.
- `app/api/revalidate/*` routes have no tests despite being security-sensitive endpoints.
- `app/api/notion-block-image/route.ts` has no tests; the double-nesting bug in this route is undiscovered by test suite.
- Tests in `__tests__/integration/simple-integration.test.tsx` pass `mockRecordMap as any`, which means they cannot catch the double-nesting runtime shape mismatch.
- `__tests__/infrastructure/queries/tag-filter-item.query.test.ts` uses `vi.fn()` (Vitest) in a Jest test file, suggesting a mixed test toolchain or leftover stale imports.

**Files:**
- `__tests__/infrastructure/queries/tag-filter-item.query.test.ts` — Vitest `vi.fn()` used in Jest context
- `infrastructure/queries/post.query.ts` — zero test coverage
- `app/api/revalidate/` — zero test coverage

**Priority:** High for the `post.query.ts` path; Medium for revalidate endpoints.

---

*Concerns audit: 2026-06-20*
