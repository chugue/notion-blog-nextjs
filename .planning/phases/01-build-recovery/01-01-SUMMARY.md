---
phase: 01-build-recovery
plan: 01
subsystem: infra
tags: [notion-client, notion-types, recordMap, normalization, hotfix]

requires: []

provides:
  - normalizeRecordMap pure idempotent transform (infrastructure/database/external-api/normalize-record-map.ts)
  - getNotionPage single entry point composing notionAPI.getPage + normalizeRecordMap (infrastructure/database/external-api/notion-client.ts)

affects:
  - 01-02 (consumers wire getNotionPage — post.query.ts, api routes, SKIP_SSG_IDS)

tech-stack:
  added: []
  patterns:
    - "normalizeRecordMap: pure infra transform, no Result wrapper, idempotent ('value' in nested guard)"
    - "getNotionPage: single unofficial-API entry point; all 3 consumers route through it"

key-files:
  created:
    - infrastructure/database/external-api/normalize-record-map.ts
  modified:
    - infrastructure/database/external-api/notion-client.ts

key-decisions:
  - "D-01 locked: idempotent 'value' in nested guard leaves already-flat records untouched"
  - "D-02 locked: RECORD_TABLES = block, collection, collection_view, notion_user; discussion excluded"
  - "D-03 locked: getNotionPage helper beside notionAPI, not shadowing it; defensive shadowing deferred"

patterns-established:
  - "Pure infra transform: no Result<T>, no try/catch, no I/O — Result lives one layer out in post.query.ts"
  - "SCREAMING_SNAKE module-scope constant (RECORD_TABLES) with as const"
  - "Relative import within external-api/ directory (./normalize-record-map)"

requirements-completed: [BUILD-01]

duration: 2min
completed: 2026-06-20
---

# Phase 01 Plan 01: Normalization Foundation Summary

**Pure idempotent `normalizeRecordMap()` unwrapping double-wrapped Notion records (`{value:{value,role}}` → `{role,value}`) plus `getNotionPage(id)` single infra entry point composing `notionAPI.getPage` + normalize**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-06-20T04:17:10Z
- **Completed:** 2026-06-20T04:19:10Z
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 extended)

## Accomplishments

- Created `normalize-record-map.ts` — pure idempotent transform over `RECORD_TABLES` (block, collection, collection_view, notion_user); `discussion` excluded per D-02; unwraps only when `'value' in nested` (D-01 idempotency)
- Extended `notion-client.ts` with `getNotionPage(id)` — the single infra entry point all 3 unofficial-API consumers will route through in Plan 02
- Both files typecheck clean; existing `notion`, `notionAPI`, `n2m` exports untouched

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the idempotent normalizeRecordMap transform** - `9e4f44b` (feat)
2. **Task 2: Add getNotionPage single entry point to notion-client.ts** - `305b2fc` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `infrastructure/database/external-api/normalize-record-map.ts` — new pure transform; imports `ExtendedRecordMap` from `notion-types`; exports `normalizeRecordMap`
- `infrastructure/database/external-api/notion-client.ts` — extended with `getNotionPage` async helper; imports `ExtendedRecordMap` and `normalizeRecordMap` via relative path `./normalize-record-map`

## Decisions Made

Followed locked decisions D-01/D-02/D-03 from CONTEXT.md exactly:
- Idempotent guard: `'value' in nested` — only unwrap when double-wrapped (D-01)
- Table list: block, collection, collection_view, notion_user only; discussion excluded (D-02)
- Helper lives beside `notionAPI`, not shadowing it; defensive shadowing deferred (D-03)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Pre-existing TypeScript errors in `__tests__/` files (unrelated to this plan) appeared in `npx tsc --noEmit` output. Confirmed these are pre-existing (not introduced by this plan) and are out of scope per deviation rules. New files `normalize-record-map.ts` and `notion-client.ts` produced zero TypeScript errors.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `normalizeRecordMap` and `getNotionPage` are ready for consumer wiring in Plan 02
- Plan 02 tasks: wire `getNotionPage` into `post.query.ts` (normalize-on-return, D-04), `api/notion-block-image/route.ts`, `api/notion/page/route.ts`, and empty `SKIP_SSG_IDS` (D-06)
- No blockers from this plan

## Self-Check: PASSED

- `infrastructure/database/external-api/normalize-record-map.ts` — FOUND
- `infrastructure/database/external-api/notion-client.ts` — modified (FOUND)
- Commit `9e4f44b` — FOUND (Task 1)
- Commit `305b2fc` — FOUND (Task 2)

---
*Phase: 01-build-recovery*
*Completed: 2026-06-20*
