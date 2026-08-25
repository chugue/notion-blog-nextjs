---
quick_id: 260825-wqy
description: 기존 __tests__ 타입 에러 정리 (소스 불변, tsc 0 에러)
status: complete
date: 2026-08-25
---

# Quick Task 260825-wqy: __tests__ 타입 에러 정리

## 배경
`tsc --noEmit` 에러 100개, 전부 `__tests__/` 14개 파일. 소스가 진화하면서 테스트가 따라오지 못한 상태
(깨진 상대경로 import, notion-types 7.4.3 픽스처 shape, 제거된 `searchPosts`, 포트 mock 누락 메서드 등).

## 제약
- 소스 코드(`app/ application/ domain/ infrastructure/ presentation/ shared/`) 변경 금지 — 테스트만 갱신
- `tsconfig`/`jest.config` 로 에러를 숨기지 않음
- 각 테스트는 수정 후 `jest <file>`로 실행해 통과 확인

## Tasks (파일 그룹별 병렬)
1. integration: api-integration, blog-post-integration, simple-integration, user-scenario-integration
2. application/use-cases: tag-info, page-view, site-metric adapter tests
3. infrastructure: tag-filter-item.query, tag-info-repository.adapter tests
4. app/api routes, domain/utils/post.utils, presentation/stores/use-search-store tests

done: `npx tsc --noEmit` 에러 0, 수정한 테스트 jest 통과
