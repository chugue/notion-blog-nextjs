---
phase: 01-build-recovery
plan: 02
subsystem: infra
tags: [notion-client, recordMap, normalization, api-routes, ssg, hotfix]

requires:
  - 01-01 (normalizeRecordMap pure transform + getNotionPage entry point)

provides:
  - normalize-on-cache-return in post.query.ts (D-04: stale cache HITs normalized)
  - both API routes call getNotionPage (D-03: all 3 consumers use normalized path)
  - SKIP_SSG_IDS emptied (D-06: every published post flows through generateStaticParams)

affects:
  - Phase 3 (RENDER-01: delete dead SKIP_SSG_IDS constant/filter)
  - next build: all posts now included in SSG (no SKIP_SSG_IDS exclusions)

tech-stack:
  added: []
  patterns:
    - "normalize-on-cache-return: apply normalizeRecordMap() to cachedFn() result (D-04)"
    - "getNotionPage single entry point: all 3 unofficial-API callers use it (D-03)"
    - "SKIP_SSG_IDS empty set: constant + filter retained structurally for Phase 3 (D-06)"

key-files:
  created: []
  modified:
    - infrastructure/queries/post.query.ts
    - app/api/notion-block-image/route.ts
    - app/api/notion/page/route.ts
    - app/(blog)/blog/[id]/page.tsx

key-decisions:
  - "D-04 applied: normalize on cachedFn() return value so stale cache HITs are also fixed; idempotency makes double-apply harmless"
  - "D-05 honored: no revalidateTag / key-bumping added; normalize-on-return is sufficient"
  - "D-03 applied: both API routes import getNotionPage from @/infrastructure/database/external-api/notion-client"
  - "D-06 applied: SKIP_SSG_IDS emptied to new Set<string>(); constant + filter left for Phase 3 deletion"

requirements-completed: [BUILD-02]

duration: 5min
completed: 2026-06-20
---

# Phase 01 Plan 02: Consumer Wiring Summary

**normalizeRecordMap applied to all 3 unofficial-API consumers: post.query.ts normalizes the `unstable_cache` return value (D-04); both API routes replaced `notionAPI.getPage` with `getNotionPage` (D-03); SKIP_SSG_IDS emptied so every published post flows through generateStaticParams (D-06)**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-20T04:22:00Z
- **Completed:** 2026-06-20T04:27:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- `infrastructure/queries/post.query.ts`: Added `normalizeRecordMap` import (relative path `../database/external-api/normalize-record-map`); applied to `result` after `!result` guard at the success return — D-04 normalize-on-return so stale `.next/cache` double-wrapped HITs are also fixed. `unstable_cache` keys/tags and `Result<T>` envelope preserved. No `revalidateTag` added (D-05).
- `app/api/notion-block-image/route.ts`: Replaced `notionAPI` import with `getNotionPage`; replaced `notionAPI.getPage(blockId)` with `getNotionPage(blockId)`. After normalization `block.type` and `block.format` are defined (ROADMAP criterion #3). Error handling, `if (!block)` 404 guard, and try/catch → 500 branch untouched. 4-space indent preserved.
- `app/api/notion/page/route.ts`: Replaced `notionAPI` import with `getNotionPage`; replaced `notionAPI.getPage(pageId)` with `getNotionPage(pageId)`. Client now receives flat `{ role, value }` records (ROADMAP criterion #4). CORS headers, `Result<ExtendedRecordMap>` envelope, `!result` 404 / catch 500 branches untouched. 2-space indent preserved.
- `app/(blog)/blog/[id]/page.tsx`: Emptied `SKIP_SSG_IDS` from `new Set([...two IDs...])` to `new Set<string>()`. Constant declaration and `.filter((post) => !SKIP_SSG_IDS.has(post.id))` call kept structurally in place for Phase 3 (RENDER-01). Every published post now flows through `generateStaticParams` (ROADMAP criterion #2).

## Task Commits

Each task committed atomically:

1. **Task 1: Normalize cache return in post.query.ts** — `4f73f5a` (feat)
2. **Task 2: Route both API routes through getNotionPage** — `34b9615` (feat)
3. **Task 3: Empty the SKIP_SSG_IDS set** — `18070b6` (feat)

## Files Created/Modified

- `infrastructure/queries/post.query.ts` — Added import for `normalizeRecordMap`; applied to cached result at success return
- `app/api/notion-block-image/route.ts` — Replaced `notionAPI.getPage` with `getNotionPage`
- `app/api/notion/page/route.ts` — Replaced `notionAPI.getPage` with `getNotionPage`
- `app/(blog)/blog/[id]/page.tsx` — Emptied `SKIP_SSG_IDS`; constant + filter retained

## Decisions Made

- D-04: normalize-on-return applied in `post.query.ts` (not inside cached fn) — covers stale cache HITs
- D-05: no `revalidateTag` / key-bumping added to Phase 1
- D-03: single entry point `getNotionPage` used by both API routes
- D-06: `SKIP_SSG_IDS` emptied; constant + filter structurally retained for Phase 3

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data paths are now wired to normalized Notion data. No placeholder values.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. Changes are internal data-shape fixes and a build-config edit (`SKIP_SSG_IDS`). Threat model in PLAN.md covers all modified files.

## Self-Check: PASSED

- `infrastructure/queries/post.query.ts` — FOUND; contains `normalizeRecordMap(result`
- `app/api/notion-block-image/route.ts` — FOUND; contains `getNotionPage(blockId)`
- `app/api/notion/page/route.ts` — FOUND; contains `getNotionPage(pageId)`
- `app/(blog)/blog/[id]/page.tsx` — FOUND; `SKIP_SSG_IDS` is empty, filter retained
- Commit `4f73f5a` — Task 1
- Commit `34b9615` — Task 2
- Commit `18070b6` — Task 3

---
*Phase: 01-build-recovery*
*Completed: 2026-06-20*
