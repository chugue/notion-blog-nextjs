---
quick_id: 260825-wqy
status: complete
date: 2026-08-25
---

# Summary: __tests__ 타입 에러 정리

## 결과
- `tsc --noEmit`: 100 → **0** 에러. 소스/tsconfig/jest.config 무변경.
- jest: 17 실패 / 4 통과 (기준선) → **4 실패 / 16 통과**, 테스트 27 → 151 통과.

## 변경 (14 파일, 테스트만)
- ESM 모드(`--experimental-vm-modules`)에서는 `jest.mock`이 hoist되지 않아 사실상 무효 → `jest.unstable_mockModule` + top-level `await import`로 전환.
- 픽스처를 실제 타입에 맞춤(`CodeBlock.version`, `Role` 리터럴, 포트 mock 누락 메서드 등). `as any`/`@ts-ignore` 미사용.
- 소스에서 사라진 기능의 테스트는 제거·대체: `searchPosts`(스토어), `resetTagInfoList`, `NotionPost/toPost`, `react-notion-x-code-block` 위임, ld+json.
- `__tests__/app/api/tag-into/reset/route.test.ts` 삭제 — 대상 라우트가 `55b93df`에서 제거됨.

## 남은 기존 실패 (범위 밖, 기준선과 동일)
- `NotionPageContent.test.tsx`, `ThemeToggle.test.tsx`: gsap ESM 파싱 실패. `next/jest`가 `transformIgnorePatterns`를 덮어써서 gsap 허용 목록이 무효 → `moduleNameMapper`/`__mocks__/gsap` 필요.
- `tag-info.utils.test.ts`: 단정 1건 불일치.
- `__tests__/shared/di-mock.ts`: 테스트 파일이 아닌데 jest가 수집(“no tests”). `testMatch` 조정 또는 이동 필요. 사용처 없음(api-integration이 더 이상 참조 안 함).
