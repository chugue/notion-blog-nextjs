# Roadmap: notion-blog-nextjs

## Overview

This milestone introduces GSD planning to the repo and focuses on a single objective: get the blog onto react-notion-x 7.10.0 with a healthy build and every published post rendering correctly. Work proceeds in dependency order — the broken build must be green before the upgrade can be validated, and the upgrade must pass before SKIP_SSG_IDS can be safely removed.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Build Recovery** - Apply recordMap normalization hotfix so next build passes green on 7.4.3
- [ ] **Phase 2: Upgrade to 7.10** - Bump all four notion packages to 7.10.0, investigate and fix the 404 regression, and confirm every published post URL responds correctly
- [ ] **Phase 3: Render Integrity & DoD** - Remove SKIP_SSG_IDS, verify all key block types render without regression, confirm the milestone Definition of Done

## Phase Details

### Phase 1: Build Recovery

**Goal**: The blog builds cleanly on 7.4.3 with no per-post workarounds needed
**Depends on**: Nothing (first phase)
**Requirements**: BUILD-01, BUILD-02, BUILD-03
**Success Criteria** (what must be TRUE):

  1. `next build` completes green on react-notion-x 7.4.3 with zero prerender errors
  2. No post ID needs to be added to SKIP_SSG_IDS to allow the build to pass
  3. The image proxy route (`/api/notion-block-image`) returns a valid image URL for any published post's image block — `block.type` is no longer undefined
  4. The `/api/notion/page` route returns a correctly shaped `ExtendedRecordMap` (flat `{ role, value }` records) for any page ID

**Plans**: 3 plansPlans:
**Wave 1**

- [ ] 01-01-PLAN.md — Build normalizer foundation: idempotent normalizeRecordMap + getNotionPage entry point (BUILD-01)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-02-PLAN.md — Wire 3 consumers to normalized path + empty SKIP_SSG_IDS (BUILD-02)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 01-03-PLAN.md — Verify green build, 3 named posts prerender, API route shapes (BUILD-03)

### Phase 2: Upgrade to 7.10

**Goal**: All four notion packages run at 7.10.0 and every published post URL returns HTTP 200
**Depends on**: Phase 1
**Requirements**: UPG-01, UPG-02, UPG-03
**Success Criteria** (what must be TRUE):

  1. `package.json` shows `react-notion-x`, `notion-client`, `notion-utils`, and `notion-types` all at `7.10.0`
  2. The root cause of the previous 7.4.3 → 7.10 404 regression is documented (release diff, reproduction path)
  3. Every published post URL (`/blog/<id>`) returns HTTP 200 on 7.10 — including URLs that previously 404'd on 7.10
  4. `next build` passes green on 7.10 after the normalization adapter and the 404 fix are both applied

**Plans**: TBD

### Phase 3: Render Integrity & DoD

**Goal**: The SKIP_SSG_IDS workaround is gone, all posts generate via SSG, and all key block types render without regression
**Depends on**: Phase 2
**Requirements**: RENDER-01, RENDER-02, RENDER-03
**Success Criteria** (what must be TRUE):

  1. `SKIP_SSG_IDS` constant and its filter logic are deleted from `app/(blog)/blog/[id]/page.tsx`
  2. `generateStaticParams` produces a static route for every published post — no post falls back to dynamic rendering because of the exclusion list
  3. Inline database (`collection_view_page`), synced block (`transclusion_container`), column layout, code block, image, and callout blocks all render correctly in browser for representative posts on 7.10
  4. `next build` passes green on 7.10 with SKIP_SSG_IDS removed and all posts included in SSG — this is the milestone DoD

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Build Recovery | 0/3 | Not started | - |
| 2. Upgrade to 7.10 | 0/TBD | Not started | - |
| 3. Render Integrity & DoD | 0/TBD | Not started | - |
