# Requirements: notion-blog-nextjs

**Defined:** 2026-06-20
**Core Value:** 블로그가 빌드되고 모든 published 포스트가 정상 렌더된다.

## v1 Requirements

react-notion-x 7.10 업그레이드 마일스톤의 요구사항. 각 항목은 로드맵 phase에 매핑된다.

### Build Recovery

- [x] **BUILD-01**: recordMap 이중 래핑(`{value:{value,role}}`)을 `{role,value}`로 푸는 멱등 정규화 어댑터를 데이터 페치 경로에 적용한다
- [ ] **BUILD-02**: `notionAPI.getPage` 3개 호출지점(블로그 상세, `api/notion-block-image`, `api/notion/page`)이 정규화된 recordMap을 사용한다
- [ ] **BUILD-03**: 정규화 적용 후 현행 7.4.3에서 `next build`가 그린으로 통과한다

### Upgrade

- [ ] **UPG-01**: `react-notion-x`/`notion-client`/`notion-utils`/`notion-types`를 7.10.0으로 업그레이드한다
- [ ] **UPG-02**: 7.10에서 과거 발생한 블로그 404 회귀의 근본 원인을 규명한다(릴리스 변경점·재현 경로 문서화)
- [ ] **UPG-03**: 404 회귀를 해결하여 모든 published 포스트 URL이 정상 응답한다

### Render Integrity

- [ ] **RENDER-01**: `SKIP_SSG_IDS` 우회 목록을 제거하고 전 포스트를 SSG로 생성한다
- [ ] **RENDER-02**: 주요 블록 타입(인라인 DB `collection_view_page`, 동기화 블록 `transclusion_container`, 컬럼, 코드, 이미지, 콜아웃)이 7.10에서 회귀 없이 렌더된다
- [ ] **RENDER-03**: 7.10 + 정규화 상태에서 `next build` 그린 + 과거 404 포스트 포함 전 포스트 렌더 정상 (마일스톤 DoD)

## v2 Requirements

향후 마일스톤. 추적하되 이번 로드맵에는 미포함.

### Resilience

- **RES-01**: Notion 비공개 API 응답 포맷 변경을 조기 감지하는 스모크 테스트/CI 가드
- **RES-02**: recordMap 스냅샷 기반 렌더 회귀 테스트 픽스처

## Out of Scope

| Feature | Reason |
|---------|--------|
| 공식 Notion API로 렌더링 이관 | react-notion-x는 비공개 recordMap에 묶여 있고 인라인 DB·동기화·컬럼 회귀 위험 큼(별도 마일스톤; 근거 `docs/빌드실패-replaceAll-진단-보고서.md` 부록 A) |
| 블로그 UI/디자인 개편 | 이번 목표(빌드·렌더 정상화)와 무관 |
| 신규 기능(검색·태그 개편 등) | 안정화 우선 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUILD-01 | Phase 1 | Complete |
| BUILD-02 | Phase 1 | Pending |
| BUILD-03 | Phase 1 | Pending |
| UPG-01 | Phase 2 | Pending |
| UPG-02 | Phase 2 | Pending |
| UPG-03 | Phase 2 | Pending |
| RENDER-01 | Phase 3 | Pending |
| RENDER-02 | Phase 3 | Pending |
| RENDER-03 | Phase 3 | Pending |
