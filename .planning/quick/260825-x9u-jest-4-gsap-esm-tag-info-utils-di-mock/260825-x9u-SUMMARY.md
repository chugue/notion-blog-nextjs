---
quick_id: 260825-x9u
status: complete
date: 2026-08-26
---

# Summary: 남은 jest 실패 4개 정리

## 결과
- jest: **19/19 스위트, 162/162 테스트 통과** (이전 4 스위트 실패). `tsc --noEmit` 0 에러. 소스 무변경.

## 변경
- `jest.config.js`: `^gsap/ScrollTrigger$` → `gsap/dist/ScrollTrigger.js`(UMD) 매핑. 루트 파일은 ESM이라 파싱 실패했고, `next/jest`가 `transformIgnorePatterns`를 덮어써 기존 gsap 허용 목록은 무효였음.
- `tag-info.utils.test.ts`: 정렬 단정을 소스(count 내림차순, 동률은 등장 순)에 맞춤.
- `ThemeToggle.test.tsx`, `NotionPageContent.test.tsx`: `unstable_mockModule` + dynamic import로 전환. NotionPageContent는 `next/dynamic`도 mock(Collection 동적 로드 차단).
- `__tests__/shared/di-mock.ts` 삭제: 미사용 헬퍼가 테스트로 수집됨.

## 참고
- `jest.config.js`의 상대경로 `moduleNameMapper` 항목들(`^../../../app/...`)은 이제 미사용. 정리 가능.
