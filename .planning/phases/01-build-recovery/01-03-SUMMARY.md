---
phase: 01-build-recovery
plan: 03
subsystem: infra
tags: [build-verification, ssg, isr, rate-limit, notion-client, hotfix, gap-fix]

requires:
  - 01-01 (normalizeRecordMap + getNotionPage)
  - 01-02 (consumers wired, SKIP_SSG_IDS emptied)

provides:
  - verified green build (next build exit 0, 0 replaceAll, 0 prerender errors)
  - hybrid SSG: latest N posts prebuilt, rest on-demand via ISR (no build burst)
  - transient fetch failures no longer bake permanent 404s (self-heal via ISR)
  - genuinely-missing posts return fast 404 (existence checked before recordMap fetch)

affects:
  - Phase 2 (7.10 upgrade): build burst behavior already mitigated
  - Phase 3 (RENDER-01): SKIP_SSG_IDS still reserved

tech-stack:
  added: []
  patterns:
    - "process-level concurrency gate + request spacing around notionAPI.getPage"
    - "exponential backoff retry (longer on HTML-block errors) via getNotionPageWithRetry"
    - "hybrid SSG: generateStaticParams slices latest PRESTATIC_POST_LIMIT, rest ISR"
    - "existence-first getPostById: official-API existence check precedes recordMap fetch"
    - "transient fetch error throws (ISR retry); only genuine not-found returns null -> notFound()"

key-files:
  created: []
  modified:
    - infrastructure/database/external-api/notion-client.ts
    - infrastructure/queries/post.query.ts
    - infrastructure/repositories/post.repository.adapter.ts
    - application/use-cases/post-usecase.adapter.ts
    - app/(blog)/blog/[id]/page.tsx

key-decisions:
  - "Root cause beyond double-wrap: bulk SSG fired ~120 concurrent UNAUTHENTICATED notionAPI.getPage calls; Notion served HTML block pages (not JSON) -> getPage threw -> getPostById null -> notFound() baked ~80/121 posts as permanent 404s. Build exited 0, masking it."
  - "Chose hybrid B (prebuild recent + ISR) over throttle-only (A) or official-API migration (C). C remains the deferred separate milestone (Appendix A); the resilience work here is a prerequisite for C anyway."
  - "PRESTATIC_POST_LIMIT default 20 (env-overridable) — only latest posts prebuilt; long tail renders on-demand and caches."
  - "Existence checked first so missing posts 404 fast (was 500 after ~75s of retries)."
  - "Transient fetch error throws (ISR retries) instead of notFound(); never caches a permanent 404."

requirements-completed: [BUILD-03]

duration: interactive-debug-session
completed: 2026-06-20
---

# Phase 01 Plan 03: Build Verification + Gap Fix Summary

**Verification went beyond `exit 0` (per D-07) and uncovered that emptying SKIP_SSG_IDS (01-02) exposed a build-time rate-limit failure: prebuilding all 121 published posts fired ~120 concurrent unauthenticated `notionAPI.getPage` calls, Notion returned HTML block pages instead of JSON, and ~80/121 posts silently baked as permanent 404s while the build still exited 0. Fixed by switching to hybrid SSG (latest 20 prebuilt + ISR for the rest) and making fetch failures self-heal instead of baking 404s.**

## What Was Verified (Task 1 — automated)

- `next build` exits 0; **0** `replaceAll` TypeErrors; **0** prerender errors.
- The 3 formerly-crashing posts (`843b3d78…`, `2c39c76c…`, `2c59c76c…`) prerender without the `uuidToId(undefined)` crash — the 01-01/01-02 normalization fix holds.
- `/api/notion/page` returns flat `{ role, value }` records (not double-wrapped) — criterion #4.
- Image proxy returns defined `block.type` after normalization — criterion #3.

## Gap Found (Task 2 — the real story)

The user spot-checked a post in the browser and hit a 404. Investigation:

- **80 of 121** published posts baked as static 404 (`.meta` `status:404`), yet each id returned **200** at runtime / in isolation — proving the data was fine.
- Diagnostic logging pinned the failure to `notionAPI.getPage` returning `<!doctype html>` (a Notion **rate-limit/block page**) under the ~120-way concurrent build burst from 14 workers. JSON parse threw → `getPostByIdQuery` failed → `getPostById` returned null → `notFound()` → Next baked a permanent-for-`revalidate` 404. The build still exited 0, so it was invisible.
- Confirmed it was concurrency, not data/cache: clean build == cached build == 80; throttling per-process cut 80→21 but couldn't reach 0 (cross-process workers).

## The Fix (hybrid B)

- **`notion-client.ts`**: `getNotionPageWithRetry` — process-level concurrency gate + request spacing (avoid the block) + exponential backoff retry (longer on HTML-block errors).
- **`post.query.ts`**: `getPostByIdQuery` routes through `getNotionPageWithRetry`.
- **`page.tsx`**: `generateStaticParams` prebuilds only the latest `PRESTATIC_POST_LIMIT` (20); the rest render on-demand via `dynamicParams`/ISR — no build burst.
- **`post.repository.adapter.ts`**: `getPostById` checks existence (official API) **before** the recordMap fetch, so missing posts 404 fast without a retry storm.
- **`post-usecase.adapter.ts`**: throws on transient fetch errors (ISR retries the next request) and returns null only for genuine `'Post not found'`.

## Verification Evidence (post-fix)

| Case | Result |
|------|--------|
| `next build` | exit 0, 20 prebuilt, **0 baked 404** (was 80), 0 replaceAll, 0 prerender errors |
| Non-prebuilt post (on-demand ISR) | **200**, real titles (`#다형성과 동적바인딩`, `#네트워크 통신과 DBMS`), 0.4–1.7s cold, ~6ms warm |
| Genuinely missing id | **404 in 0.23s** (was 500 after ~75s) |
| Prebuilt post | 200, ~6ms |

## Task Commits

1. **Throttle + retry the unofficial fetch** — `e90ee72` (fix)
2. **Hybrid prebuild + ISR + 404 correctness** — `ef1500a` (fix)

(Task 1 automated verification was a no-code-change verification step; its evidence is recorded above.)

## Deviations from Plan

Major (authorized by user mid-session): Plan 01-03 was scoped as verification-only. Verification surfaced a build-time rate-limit gap that fails the phase Core Value ("every published post renders"). The user directed an inline hotfix (hybrid B) rather than a separate gap-closure plan. Official-API migration (option C) was discussed and explicitly kept as the deferred separate milestone.

## Known Stubs

None. `SKIP_SSG_IDS` remains an empty set reserved for Phase 3 (RENDER-01).

## Self-Check: PASSED

- Build: exit 0, 20 prebuilt, 0 baked 404 — verified on disk (`.next/server/app/blog/*.meta`)
- On-demand render 200 with real titles — verified via running prod server
- Missing id → fast 404 — verified
- Commits `e90ee72`, `ef1500a` present

---
*Phase: 01-build-recovery*
*Completed: 2026-06-20*
