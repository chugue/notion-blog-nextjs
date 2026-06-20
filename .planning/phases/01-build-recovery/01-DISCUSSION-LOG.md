# Phase 1: Build Recovery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-20
**Phase:** 1-build-recovery
**Areas discussed:** (delegated to Claude — see below)

---

## Gray-area selection

Claude presented 4 grounded gray areas (SKIP_SSG_IDS handling, normalization entry
point, build verification depth, stale cache handling). The normalization approach
itself (method A) was already locked in PROJECT.md / STATE.md and was explicitly not
re-asked.

| Option presented | Description | Selected |
|------------------|-------------|----------|
| SKIP_SSG_IDS 처리 | Remove in Phase 1 vs leave for Phase 3 — boundary ambiguity | |
| 정규화 진입점 설계 | Explicit getNotionPage helper vs client-boundary wrap | |
| 빌드 검증 깊이 | exit-0 only vs render previously-broken posts | |
| 오래된 캐시 처리 | normalize-on-return only vs also purge caches | |

**User's choice:** "Other" → *"굳이 논의할 필요가 없으면 plan으로가자"* (if there's no
real need to discuss, let's go to plan).

**Notes:** The user trusts the diagnostic report (`docs/빌드실패-replaceAll-진단-보고서.md`),
which already specifies method A with exact file changes and idempotency guarantees, and
delegated the remaining boundary/rigor calls to Claude. Claude resolved all four from the
report + ROADMAP rather than leaving them open.

---

## Claude's Discretion

All four gray areas were resolved by Claude (user delegated):

- **SKIP_SSG_IDS:** Phase 1 empties the set (all posts in SSG, build green); Phase 3
  deletes the dead constant/filter (RENDER-01). → CONTEXT D-06
- **Normalization entry point:** Explicit `getNotionPage(id)` helper (report's
  recommendation); client-boundary wrapping deferred as higher-risk. → CONTEXT D-03
- **Build verification depth:** Beyond exit-0 — confirm the 3 previously-crashing/skipped
  posts prerender + spot-check the two API routes' shape. → CONTEXT D-07
- **Stale cache handling:** normalize-on-return value in post.query.ts; no extra cache
  purging. → CONTEXT D-04, D-05

Plus: TS cast strategy, helper naming, and manual-vs-scripted build verification left
open for the planner.

## Deferred Ideas

- Defensive client-boundary wrapping of `notionAPI.getPage` — revisit in Phase 2.
- Cache purge / revalidation tooling — only if a stale-cache issue surfaces.
- RES-01 / RES-02 (smoke test, snapshot regression fixtures) — v2 backlog.
