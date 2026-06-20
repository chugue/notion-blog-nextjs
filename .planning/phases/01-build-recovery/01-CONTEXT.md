# Phase 1: Build Recovery - Context

**Gathered:** 2026-06-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Make `next build` pass green on the **current 7.4.3** stack by normalizing the
double-wrapped Notion recordMap (`{ value: { value, role } }` → `{ role, value }`)
at the data-fetch boundary, applied across **all 3** `notionAPI.getPage` call sites.

**In scope:** the normalization adapter (method A), wiring it into the 3 fetch
paths, and proving the build is green for every published post — including the
posts that previously crashed or were skipped.

**Out of scope (other phases):**
- Bumping notion packages to 7.10.0 + fixing the 404 regression → Phase 2 (UPG-*)
- Deleting the `SKIP_SSG_IDS` constant/filter as dead code + full block-type render
  audit → Phase 3 (RENDER-*)
- Public-API migration, smoke tests / CI guards (RES-01/02), UI changes → out of milestone

</domain>

<decisions>
## Implementation Decisions

The user reviewed the gray areas and delegated them ("정규화 방식 A는 확정 —
논의 불필요하면 plan으로"). The approach (method A) was already locked in
PROJECT.md / STATE.md. The four boundary/rigor calls below were resolved by
Claude from the diagnostic report + ROADMAP, and are noted as discretion items
the planner may refine.

### Normalization approach (locked — pre-decided, not re-litigated)
- **D-01:** Method A — a small, **idempotent** `normalizeRecordMap()` adapter that
  unwraps records only when a nested `value` exists (`'value' in nested`), so flat
  data and recovered formats are left untouched. Chosen over SKIP_SSG_IDS expansion
  (method B) and version change (method C). See diagnostic report §2.
- **D-02:** Tables normalized: `block`, `collection`, `collection_view`,
  `notion_user`. **Exclude `discussion`** — its `value` is `{ role }` only (no nested
  value) and it's not used in rendering; touching it would corrupt shape. (Report §4)

### Normalization entry point
- **D-03:** Single explicit entry point `getNotionPage(id)` in
  `infrastructure/database/external-api/notion-client.ts` = `notionAPI.getPage(id)`
  + `normalizeRecordMap()`. All 3 call sites switch to it. This is the report's
  recommendation (report §3). Wrapping/shadowing `notionAPI.getPage` itself at the
  client boundary (so callers *can't* forget to normalize) was considered as extra
  defense but **deferred** — higher risk for a hotfix; the explicit helper is enough
  for Phase 1. The "정규화 어댑터를 우리 코드에 둔다" constraint is satisfied by D-01+D-03.

### Cache handling (stale double-wrapped data)
- **D-04:** In `post.query.ts`, apply `normalizeRecordMap()` to the **return value of
  the cache wrapper** (`cachedFn()` result), not inside the cached function — so a
  cache HIT on old double-wrapped data is also normalized. Idempotency makes the
  double application harmless. (Report §4 "캐시 정합성")
- **D-05:** Do **not** add cache purging / `revalidateTag` / key-bumping to Phase 1.
  Normalize-on-return (D-04) covers stale caches; extra busting is unnecessary scope.

### SKIP_SSG_IDS handling (phase boundary 1 ↔ 3)
- **D-06:** Phase 1 **empties** the `SKIP_SSG_IDS` set (remove the 2 hardcoded IDs)
  so every published post flows through `generateStaticParams` and proves the build
  is green with no post excluded — this is what satisfies ROADMAP Phase 1 criterion #2
  ("no post ID needs to be added to SKIP_SSG_IDS"). The constant + filter logic are
  left structurally in place; **deleting the dead constant/filter is Phase 3's job
  (RENDER-01)**. This keeps the 1↔3 boundary clean: Phase 1 = functionally unneeded,
  Phase 3 = code removed + render audit.

### Build verification depth
- **D-07:** "Green build" proof goes beyond `next build` exit 0. The planner must
  verify the three previously-crashing/skipped posts — `843b3d78-...`,
  `2c39c76c-6cb4-80f0-a79e-e935e2bed857`, `2c59c76c-6cb4-803e-95eb-f0fe5d659685` —
  are included in SSG and prerender without the `replaceAll` TypeError. Also spot-check
  that `/api/notion-block-image` (`block.type` no longer undefined) and `/api/notion/page`
  (returns flat `{ role, value }` records) return correctly shaped data — directly maps
  to ROADMAP Phase 1 criteria #3 and #4.

### Claude's Discretion
- TypeScript cast strategy inside the normalizer (report uses `as never`), exact helper
  naming, and whether `getNotionPage` lives beside or replaces the existing `notionAPI`
  export are left to the planner/executor — keep consistent with existing conventions.
- Whether build verification is a manual `npm run build` inspection vs a scripted check
  is the planner's call (note: RES-01/02 test infra is explicitly deferred to v2).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Root-cause diagnosis & chosen fix (most important)
- `docs/빌드실패-replaceAll-진단-보고서.md` — full diagnosis of the double-wrapping
  build crash, method A/B/C trade-off (method A chosen), the exact `normalizeRecordMap`
  implementation sketch (§2 방안 A), the 6-file change table (§3), risks/idempotency
  notes (§4), Appendix A (why public-API migration is deferred), Appendix B
  (react-notion-x maintenance status). **Read this first.**

### Milestone scope & criteria
- `.planning/ROADMAP.md` §"Phase 1: Build Recovery" — goal + 4 success criteria
- `.planning/REQUIREMENTS.md` §"Build Recovery" — BUILD-01, BUILD-02, BUILD-03
- `.planning/PROJECT.md` §Context / §Key Decisions — locked decisions, known failures

### Codebase maps (for grounding)
- `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/INTEGRATIONS.md` — Notion
  client wiring, two-client split, cache layers

</canonical_refs>

<code_context>
## Existing Code Insights

### Files that change (confirmed present, per report §3 — verified during scout)
- `infrastructure/database/external-api/notion-client.ts` — currently exports
  `notion`, `notionAPI`, `n2m`. Add `getNotionPage(id)` helper here. (now 13 lines)
- `infrastructure/database/external-api/normalize-record-map.ts` — **new** file for
  `normalizeRecordMap()`.
- `infrastructure/queries/post.query.ts:48-60` — `getPostByIdQuery` wraps
  `notionAPI.getPage(id)` in `unstable_cache` (keys `post-${id}`, tags `post-${id}`/
  `all-posts`). Apply normalize to the `cachedFn()` result (D-04).
- `app/api/notion-block-image/route.ts:20` — reads `recordMap.block[blockId]?.value`
  then `block.type`/`block.format` (breaks today because type is undefined). Switch to
  `getNotionPage`.
- `app/api/notion/page/route.ts:26` — returns recordMap straight to client. Switch to
  `getNotionPage`.
- `app/(blog)/blog/[id]/page.tsx:20-33` — `SKIP_SSG_IDS` Set with 2 IDs, filtered out
  in `generateStaticParams`. Empty the set in Phase 1 (D-06).

### Established Patterns
- Result<T> + Result-unwrapping at use-case boundary (`shared/types/result.ts`) — the
  normalizer is a pure transform inside the infra layer, no Result wrapping needed.
- Two Notion clients: `notion` (official @notionhq/client) is untouched; only the
  unofficial `notionAPI` (NotionAPI → ExtendedRecordMap) path needs normalization.

### Integration Points
- `getNotionPage` becomes the single infra-layer entry for unofficial-API page fetches;
  all 3 current `notionAPI.getPage` consumers route through it.

</code_context>

<specifics>
## Specific Ideas

- Idempotency is non-negotiable: the normalizer must only unwrap when `value.value`
  exists, never touch already-flat blocks (report §4 "멱등성 보장 필수").
- The fix must stay a ~20-line, low-risk, single-entry, easily-reversible hotfix —
  rollback = bypass the one helper (report §4 "롤백 용이").

</specifics>

<deferred>
## Deferred Ideas

- **Defensive client-boundary wrapping** (shadow `notionAPI.getPage` so it can't be
  called un-normalized) — considered, deferred as higher-risk-than-needed for a hotfix.
  Worth revisiting in Phase 2 when packages move and the fetch surface is already churning.
- **Cache purge / revalidation tooling** — not needed given normalize-on-return; revisit
  only if a stale-cache issue actually surfaces.
- RES-01 (format-change smoke test / CI guard) and RES-02 (recordMap snapshot regression
  fixtures) — v2 backlog, already deferred at roadmap init.

None of these expand Phase 1 scope.

</deferred>

---

*Phase: 1-build-recovery*
*Context gathered: 2026-06-20*
