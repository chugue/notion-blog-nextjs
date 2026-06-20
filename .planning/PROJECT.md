# notion-blog-nextjs

## What This Is

Stephen's personal tech blog — a Next.js 16 (App Router, Turbopack) site that renders posts authored in Notion. Content is fetched from Notion (both the official `@notionhq/client` for database queries and the unofficial `notion-client` for full page recordMaps) and rendered with `react-notion-x`, with server-side code highlighting via Shiki, image proxying, page-view analytics (Supabase), and Giscus comments.

This milestone introduces GSD planning to the existing repo and focuses on a single goal: get the blog onto the latest `react-notion-x` (7.10.0) with a healthy build and all posts rendering.

## Core Value

The blog builds and every published post renders correctly. If anything else fails, this must hold.

## Requirements

### Validated

<!-- Inferred from existing code via .planning/codebase/ map. Working and relied upon. -->

- ✓ Notion 포스트를 recordMap으로 가져와 `react-notion-x`로 렌더링 — existing
- ✓ 서버사이드 코드 하이라이팅(Shiki, `highlight-code-blocks.ts`) — existing
- ✓ Notion 이미지 fresh-URL 프록시 라우트(`app/api/notion-block-image`, `notion-image`) — existing
- ✓ 레이어드 아키텍처(domain/application/infrastructure/presentation) + DI 컨테이너 — existing
- ✓ 페이지뷰 분석(Supabase) 및 Giscus 댓글 — existing
- ✓ 블로그 상세 ISR/SSG(`revalidate=3600`, `generateStaticParams`) — existing

### Active

<!-- This milestone. Hypotheses until shipped and validated. -->

- [ ] 빌드를 깨뜨리는 recordMap 이중 래핑(`{value:{value,role}}`) 정규화 핫픽스 적용 → `next build` 복구
- [ ] `react-notion-x`/`notion-client`/`notion-utils`/`notion-types`를 7.4.3 → 7.10.0으로 업그레이드
- [ ] 7.10에서 과거 발생한 블로그 404 회귀의 원인 규명 및 해결
- [ ] `SKIP_SSG_IDS` 우회 목록 제거 — 전 포스트 SSG 복원
- [ ] 인라인 DB·동기화 블록·컬럼·코드·이미지 등 주요 블록 타입 렌더 정상 확인

### Out of Scope

- 공식 Notion API로 렌더링 이관 — `react-notion-x`는 비공개 recordMap에 묶여 있고, 인라인 DB·동기화·컬럼 회귀 위험이 큼(별도 마일스톤). 근거: `docs/빌드실패-replaceAll-진단-보고서.md` 부록 A
- 블로그 UI/디자인 개편 — 이번 목표(빌드·렌더 정상화)와 무관
- 새 기능 추가(검색, 태그 개편 등) — 안정화 우선

## Context

- **알려진 장애 1 (빌드 실패)**: Notion 비공개 API 응답이 각 레코드를 `{value:{value,role}}`로 **이중 래핑**해 반환 → `react-notion-x`가 `block.value.id=undefined`로 `uuidToId(undefined).replaceAll()`에서 크래시(`Cannot read properties of undefined (reading 'replaceAll')`). 전 포스트 공통, SSG 빌드 전체 중단. 정규화 핫픽스(미적용)가 `docs/빌드실패-replaceAll-진단-보고서.md`에 정리됨.
- **알려진 장애 2 (버전 고정)**: `react-notion-x` 외 notion 패키지 4종이 의도적으로 7.4.3에 고정(`^` 제거). git 이력상 7.10에서 블로그 404가 발생해 7.4.3으로 롤백한 바 있음 — 업그레이드를 막는 미해결 부채.
- **우회책**: `app/(blog)/blog/[id]/page.tsx`의 `SKIP_SSG_IDS` 하드코딩 목록이 빌드를 깨는 포스트를 SSG에서 제외하는 두더지잡기 상태.
- 코드베이스 상세 분석: `.planning/codebase/`(STACK/ARCHITECTURE/STRUCTURE/CONVENTIONS/TESTING/INTEGRATIONS/CONCERNS).

## Constraints

- **Tech stack**: Next.js 16 + Turbopack, TypeScript, App Router — 기존 스택 유지.
- **Dependency**: 렌더링은 Notion **비공개 API**(`notion-client`)에 구조적으로 의존 — 포맷 변경에 취약. 정규화 어댑터를 우리 코드에 두어 방어.
- **Compatibility**: 업그레이드 후 기존에 정상 렌더되던 포스트가 회귀하면 안 됨(특히 인라인 DB `collection_view_page`, 동기화 블록 `transclusion_container`, 컬럼).
- **Build**: 완료 기준은 7.10에서 `next build` 그린 + 전 포스트(과거 404 포함) 렌더 정상 + `SKIP_SSG_IDS` 제거.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 이번 마일스톤에 빌드 핫픽스(정규화) 포함 | 현재 빌드를 실제로 깨는 건 이중 래핑이라, 업그레이드 전 빌드부터 복구해야 검증 가능 | — Pending |
| 완료 기준 = 전 포스트 빌드+렌더 정상(+SKIP 제거) | 두더지잡기 종료가 본 마일스톤의 실질 가치 | — Pending |
| 공식 API 이관은 별도 마일스톤 | 기능 회귀 위험 대비 효용 낮음(부록 A 판단) | — Pending |
| `react-notion-x`는 유지(폐기 아님) | 업스트림 7.10까지 정기 릴리스 중, 활발히 유지보수(부록 B) | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-20 after initialization*
