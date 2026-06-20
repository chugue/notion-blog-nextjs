---
phase: 01-build-recovery
verified: 2026-06-20T06:30:00Z
status: human_needed
score: 4/4
overrides_applied: 0
gaps:
human_verification:
  - test: "Confirm /api/notion-block-image does not 500 on a real post's image block due to block.type being undefined"
    expected: "HTTP 200 with image content; route reads block.type successfully after normalization"
    why_human: "Automated spot-check (SC #3) was performed in this session and returned HTTP 200 image/webp for block 2c39c76c-6cb4-809b-bc74-c77a9937f7a5. However, the verifier cannot start the server in a clean reproducible environment; this result came from a pre-running server. Human should confirm the image proxy does NOT 500 in a fresh server start, particularly to validate the block.type-undefined fix holds for the unauthenticated notionAPI path."
  - test: "Confirm REQUIREMENTS.md BUILD-03 checkbox is updated from [ ] to [x]"
    expected: "REQUIREMENTS.md line 14 reads: - [x] **BUILD-03**: ... and Traceability table shows Build Recovery | Complete"
    why_human: "BUILD-03 is still marked [ ] Pending in REQUIREMENTS.md even though Plan 03 SUMMARY claims requirements-completed: [BUILD-03] and ROADMAP.md marks Phase 1 as [x] completed. This is an admin artifact inconsistency — not a code blocker, but it should be corrected for traceability."
---

# Phase 1: Build Recovery — Verification Report

**Phase Goal:** The blog builds cleanly on react-notion-x 7.4.3 with no per-post workarounds; every published post renders.
**Verified:** 2026-06-20T06:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `next build` completes green with zero prerender errors | VERIFIED | `.next` build output exists. Prerender manifest shows 20 posts prebuilt. `00000000...` catch-all 404 is the expected Next.js fallback page, not a real post. 0 published posts baked as 404 (confirmed via `.next/server/app/blog/*.meta` scan). |
| 2 | No post ID needs to be added to SKIP_SSG_IDS to allow the build to pass | VERIFIED | `SKIP_SSG_IDS = new Set<string>()` at line 21 of `app/(blog)/blog/[id]/page.tsx`. No hardcoded IDs present. grep for both formerly-skipped IDs returns 0. |
| 3 | The image proxy route returns a valid image URL — `block.type` is no longer undefined | VERIFIED | `app/api/notion-block-image/route.ts` imports and calls `getNotionPage(blockId)` which composes `getNotionPageWithRetry` + `normalizeRecordMap`. After normalization `block.type` is defined. Runtime spot-check: `GET /api/notion-block-image?blockId=2c39c76c-6cb4-809b-bc74-c77a9937f7a5` returned HTTP 200 `image/webp`. |
| 4 | The `/api/notion/page` route returns flat `{ role, value }` records | VERIFIED | `app/api/notion/page/route.ts` calls `getNotionPage(pageId)`. Runtime spot-check against post `2c39c76c-...` confirmed: `data.block[id]` keys are `['role', 'value']`, `value.id` exists, `value` has no nested `value` key — correctly flat. |

**Score:** 4/4 truths verified

### Deviation from Original Plan Scope (Plan 03) — Authorized

Plan 01-03 was scoped as verification-only. During execution, the verification revealed that emptying `SKIP_SSG_IDS` (Plan 02) exposed a second root cause: prebuilding all ~121 posts under the unauthenticated `notion-client` burst Notion's rate limit, causing ~80 posts to bake as permanent static 404s while the build still exited 0.

The user authorized an inline hotfix (hybrid B) rather than a separate gap-closure plan:

- `getNotionPageWithRetry` added to `notion-client.ts` with process-level concurrency gate, request spacing, and exponential backoff retry
- `generateStaticParams` now prebuilds only the latest `PRESTATIC_POST_LIMIT` (default 20); remaining posts render on-demand via `dynamicParams=true` + ISR
- `getPostById` in `post.repository.adapter.ts` checks post existence via official API before recordMap fetch (fast 404 for genuinely missing posts)
- `getPostById` in `post-usecase.adapter.ts` throws on transient fetch errors (ISR self-heals); only genuine `'Post not found'` returns null

**Phase goal is met by the hybrid approach:** Every published post either renders via SSG (latest 20) or renders on-demand via ISR on first request — no post is permanently excluded or baked as a 404. The Core Value ("every published post renders") is satisfied.

Post `843b3d78-...` (the original crash post) is not in the top-20 prebuilt set. It falls to on-demand ISR. The Plan 01-03 acceptance criterion that listed it as needing to be "in SSG routes" was superseded by the authorized hybrid approach.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `infrastructure/database/external-api/normalize-record-map.ts` | Pure idempotent normalizeRecordMap transform | VERIFIED | Exists. Exports `normalizeRecordMap`. `RECORD_TABLES = ['block', 'collection', 'collection_view', 'notion_user']`. `'discussion'` excluded. Idempotency guard `'value' in nested` at line 16. No Result wrapper, no try/catch, no I/O. |
| `infrastructure/database/external-api/notion-client.ts` | `getNotionPage` and `getNotionPageWithRetry` entry points | VERIFIED | Both exported. `getNotionPageWithRetry` adds process-level concurrency gate (NOTION_PAGE_MAX_CONCURRENCY), request spacing, exponential backoff retry. `getNotionPage` composes `getNotionPageWithRetry` + `normalizeRecordMap`. Existing `notion`, `notionAPI`, `n2m` exports untouched. |
| `infrastructure/queries/post.query.ts` | normalize-on-cache-return | VERIFIED | Imports `normalizeRecordMap` and `getNotionPageWithRetry`. Cached function calls `getNotionPageWithRetry(id)`. Return value at line 72 applies `normalizeRecordMap(result)`. D-05 honored: no `revalidateTag` added. `Result<T>` envelope preserved. |
| `app/api/notion-block-image/route.ts` | Calls `getNotionPage`, not raw `notionAPI.getPage` | VERIFIED | Line 1 imports `getNotionPage`. Line 20 calls `getNotionPage(blockId)`. No `notionAPI.getPage` call present. Error handling and 404 guard unchanged. |
| `app/api/notion/page/route.ts` | Calls `getNotionPage`, not raw `notionAPI.getPage` | VERIFIED | Line 1 imports `getNotionPage`. Line 26 calls `getNotionPage(pageId)`. No `notionAPI.getPage` call present. CORS headers, Result envelope, error branches unchanged. |
| `app/(blog)/blog/[id]/page.tsx` | `SKIP_SSG_IDS` empty; hybrid ISR in place | VERIFIED | Line 21: `const SKIP_SSG_IDS = new Set<string>()`. Line 28: `PRESTATIC_POST_LIMIT = Number(process.env.PRESTATIC_POST_LIMIT ?? 20)`. Line 1: `dynamicParams = true`. `generateStaticParams` slices to `PRESTATIC_POST_LIMIT` at line 36. No hardcoded post IDs. |
| `infrastructure/repositories/post.repository.adapter.ts` | Existence-first getPostById | VERIFIED | Lines 100-127: official API existence check before recordMap fetch. Transient fetch failure propagates error (not returns null). |
| `application/use-cases/post-usecase.adapter.ts` | Throws on transient errors, null only for 'Post not found' | VERIFIED | Lines 56-60: `if (result.error?.message === 'Post not found') return null; throw result.error;` — ISR self-heal pattern correctly implemented. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `notion-client.ts` | `normalize-record-map.ts` | relative import `./normalize-record-map` | WIRED | Line 6: `import { normalizeRecordMap } from './normalize-record-map'` |
| `post.query.ts` | `normalize-record-map.ts` | relative import | WIRED | Line 6: `import { normalizeRecordMap } from '../database/external-api/normalize-record-map'` |
| `post.query.ts` | `notion-client.ts` | `getNotionPageWithRetry` | WIRED | Line 7: imports `getNotionPageWithRetry`; used at line 53 inside cached function |
| `app/api/notion-block-image/route.ts` | `notion-client.ts` | `getNotionPage` via `@/` alias | WIRED | Line 1: `import { getNotionPage } from '@/infrastructure/database/external-api/notion-client'`; called at line 20 |
| `app/api/notion/page/route.ts` | `notion-client.ts` | `getNotionPage` via `@/` alias | WIRED | Line 1: `import { getNotionPage } from '@/infrastructure/database/external-api/notion-client'`; called at line 26 |
| `post.repository.adapter.ts` → use case | `postQuery.getPostByIdQuery` | via `postQuery` import | WIRED | Line 131 calls `postQuery.getPostByIdQuery(id)` after existence check |
| `post-usecase.adapter.ts` | `post.repository.adapter.ts` | via port interface | WIRED | `postRepositoryPort.getPostById` calls through to adapter; throw-on-transient wired at lines 56-60 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|---------------------|--------|
| `notion-block-image/route.ts` | `recordMap` | `getNotionPage(blockId)` → `getNotionPageWithRetry` → `notionAPI.getPage` | Yes — Notion API returns real block data; normalized by `normalizeRecordMap` | FLOWING |
| `notion/page/route.ts` | `result` | `getNotionPage(pageId)` → same chain | Yes — runtime confirmed flat `{role, value}` with real block content | FLOWING |
| `post.query.ts` `getPostByIdQuery` | `result` | `unstable_cache` wrapping `getNotionPageWithRetry(id)` + `normalizeRecordMap` on return | Yes — cache returns real page data; normalize is idempotent on re-hit | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `/api/notion/page` returns flat `{role, value}` records | `curl .../api/notion/page?pageId=2c39c76c-...` + Python inspection | `data.block[id]` keys = `['role', 'value']`; `value.id` exists; no nested `value` | PASS |
| Image proxy returns a real image for a known image block | `curl .../api/notion-block-image?blockId=2c39c76c-6cb4-809b-bc74-c77a9937f7a5` | HTTP 200 `image/webp` | PASS |
| Formerly-skipped post 2c39c76c renders | `curl -o/dev/null -w "%{http_code}" .../blog/2c39c76c-...` | HTTP 200 | PASS |
| Formerly-skipped post 2c59c76c renders | `curl -o/dev/null -w "%{http_code}" .../blog/2c59c76c-...` | HTTP 200 | PASS |
| 0 published posts baked as static 404 | Python scan of `.next/server/app/blog/*.meta` for `"status":404` | Only `00000000...` (expected catch-all) has status 404 | PASS |
| 20 posts prebuilt in SSG | Prerender manifest count | 20 blog routes in manifest | PASS |
| Both formerly-skipped posts in prerender manifest | Prerender manifest lookup | `/blog/2c39c76c-...` and `/blog/2c59c76c-...` both present | PASS |

### Probe Execution

Step 7c: No `scripts/*/tests/probe-*.sh` files found. No probes declared in PLAN files. SKIPPED.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|------------|------------|-------------|--------|---------|
| BUILD-01 | 01-01-PLAN.md | idempotent normalizeRecordMap + getNotionPage entry point | SATISFIED | `normalize-record-map.ts` exists, exports `normalizeRecordMap` with `RECORD_TABLES` and `'value' in nested` idempotency guard. `notion-client.ts` exports `getNotionPage`. |
| BUILD-02 | 01-02-PLAN.md | all 3 unofficial-API consumers use normalized recordMap | SATISFIED | `post.query.ts` uses `getNotionPageWithRetry` + `normalizeRecordMap` on return. Both API routes call `getNotionPage`. No `notionAPI.getPage` calls remain in `app/api/`. |
| BUILD-03 | 01-03-PLAN.md | `next build` green on 7.4.3 | SATISFIED (with caveat) | Build artifacts present. 20 posts prebuilt; 0 real posts baked as 404. Runtime checks confirm posts render. **REQUIREMENTS.md still shows `[ ]` Pending for BUILD-03** — this is a documentation artifact inconsistency, not a code deficiency. ROADMAP.md correctly marks Phase 1 as `[x]`. |

**Note on BUILD-03 in REQUIREMENTS.md:** The `[ ]` checkbox on BUILD-03 was not updated when the phase completed. This does not affect the code; the ROADMAP.md phase-level `[x]` is the authoritative completion marker. Flagged in human verification to close the inconsistency.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/(blog)/blog/[id]/page.tsx` | 125 | `{/* 추후 컨텐츠 추가 */}` in aside | Info | Empty aside placeholder — pre-existing, not introduced by this phase |

No `TBD`, `FIXME`, `XXX`, or `TODO` markers found in any phase-modified file. No stub functions. No hardcoded empty data flowing to rendering.

### Human Verification Required

#### 1. Confirm image proxy health after clean server restart

**Test:** Start the server fresh (`npm run start` or `npm run dev`) and request `GET /api/notion-block-image?blockId=<any image block id from a published post>`.
**Expected:** HTTP 200 with image content; no 500 error from undefined `block.type`.
**Why human:** The verifier ran this check against a pre-existing server. Confirming it holds on a cold start removes any doubt about stale request-level cache effects. The code path is correctly wired (verified), but a fresh-server runtime confirm removes all doubt.

#### 2. Update REQUIREMENTS.md BUILD-03 checkbox

**Test:** Open `.planning/REQUIREMENTS.md` and change line 14 from `- [ ] **BUILD-03**` to `- [x] **BUILD-03**` and change the Traceability table row from `Pending` to `Complete`.
**Expected:** REQUIREMENTS.md is consistent with ROADMAP.md Phase 1 `[x]` and Plan 03 SUMMARY `requirements-completed: [BUILD-03]`.
**Why human:** This is an admin document update, not a code change. Automated verification cannot make editorial decisions about which planning documents to update.

---

## Gaps Summary

No code gaps. All four ROADMAP Phase 1 Success Criteria are satisfied by the codebase:

1. Build is green (20 posts prebuilt, 0 baked 404s for real posts, catch-all 404 page expected)
2. `SKIP_SSG_IDS` is empty — no post ID was hardcoded to bypass the build
3. Image proxy uses `getNotionPage` which normalizes; runtime confirmed HTTP 200 image response
4. Page route uses `getNotionPage`; runtime confirmed flat `{role, value}` record shape

The two human verification items are: (1) a clean-server image proxy confirmation, and (2) a documentation fix for the BUILD-03 checkbox in REQUIREMENTS.md.

---

_Verified: 2026-06-20T06:30:00Z_
_Verifier: Claude (gsd-verifier)_
