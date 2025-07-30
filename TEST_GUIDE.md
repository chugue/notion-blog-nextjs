# 🧪 테스트 가이드

이 프로젝트는 Clean Architecture를 기반으로 한 계층별 유닛 테스트를 제공합니다.

## 📦 필요한 패키지 설치

```bash
# 기본 테스트 도구
npm install -D jest @types/jest jest-environment-jsdom

# React Testing Library
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# API 테스트 도구
npm install -D supertest @types/supertest msw

# E2E 테스트 (선택사항)
npm install -D @playwright/test
```

## 🎯 테스트 실행 명령어

```bash
# 모든 테스트 실행
npm test

# 워치 모드로 테스트 실행
npm run test:watch

# 커버리지 포함 테스트 실행
npm run test:coverage

# CI 환경용 테스트 실행
npm run test:ci
```

## 🏗️ 테스트 구조

### 계층별 테스트 디렉토리

```
__tests__/
├── domain/                    # 도메인 레이어 테스트
│   ├── entities/             # 엔티티 테스트
│   └── utils/                # 도메인 유틸리티 테스트
├── application/              # 애플리케이션 레이어 테스트
│   ├── use-cases/           # 유스케이스 테스트
│   └── ports/               # 포트 인터페이스 테스트
├── infrastructure/          # 인프라스트럭처 레이어 테스트
│   ├── repositories/        # 저장소 구현체 테스트
│   ├── queries/             # 쿼리 테스트
│   └── external-api/        # 외부 API 테스트
├── presentation/            # 프레젠테이션 레이어 테스트
│   ├── stores/             # 상태 관리 테스트
│   ├── hooks/              # 커스텀 훅 테스트
│   └── components/         # React 컴포넌트 테스트
├── app/                    # Next.js App Router 테스트
│   └── api/               # API 라우트 테스트
├── shared/                # 공유 유틸리티 테스트
│   └── utils/
└── utils/                 # 테스트 유틸리티
    └── test-utils.tsx
```

## 📋 테스트 범위

### ✅ Domain Layer

- **Entity 유효성 검사**: 도메인 엔티티의 비즈니스 규칙 검증
- **Utils 함수**: 순수 함수들의 입출력 검증
- **비즈니스 로직**: 핵심 도메인 로직 검증

### ✅ Application Layer

- **Use Case**: 비즈니스 플로우 및 조합 로직 검증
- **Port 인터페이스**: 의존성 추상화 검증
- **에러 핸들링**: 예외 상황 처리 검증

### ✅ Infrastructure Layer

- **Repository 구현체**: 데이터 액세스 로직 검증
- **External API**: 외부 서비스 통신 검증
- **Database Query**: 데이터베이스 쿼리 검증

### ✅ Presentation Layer

- **React Components**: UI 컴포넌트 렌더링 및 상호작용 검증
- **Custom Hooks**: 리액트 훅 로직 검증
- **State Management**: 상태 관리 로직 검증 (Zustand)

### ✅ API Routes

- **Next.js API Routes**: HTTP 요청/응답 검증
- **미들웨어**: 인증, 검증 로직 검증
- **에러 핸들링**: API 에러 응답 검증

## 🎨 테스트 작성 패턴

### Given-When-Then 패턴

```typescript
describe('toTagFilterItem', () => {
  it('포스트 배열이 주어졌을 때 태그별 개수를 계산해야 한다', () => {
    // Given - 테스트 데이터 준비
    const posts = [/* test data */]
    
    // When - 테스트 대상 실행
    const result = toTagFilterItem(posts)
    
    // Then - 결과 검증
    expect(result).toEqual(expectedResult)
  })
})
```

### 모킹 전략

```typescript
// 1. 의존성 모킹
jest.mock('@/infrastructure/queries/tag-info.query')

// 2. 함수 모킹
const mockFunction = jest.fn()

// 3. 모듈 모킹
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))
```

### 비동기 테스트

```typescript
it('비동기 함수 테스트', async () => {
  // Given
  const mockData = { /* test data */ }
  mockAsyncFunction.mockResolvedValue(mockData)
  
  // When
  const result = await asyncFunction()
  
  // Then
  expect(result).toEqual(mockData)
})
```

## 📊 커버리지 목표

| 계층 | 목표 커버리지 |
|------|---------------|
| Domain | 95%+ |
| Application | 90%+ |
| Infrastructure | 85%+ |
| Presentation | 80%+ |
| API Routes | 90%+ |

## 🔧 테스트 설정 파일

### jest.config.js

- Next.js와 통합된 Jest 설정
- TypeScript 지원
- 모듈 경로 매핑 (@/ 별칭)
- 커버리지 설정

### jest.setup.js

- Testing Library 설정
- 글로벌 모킹
- 테스트 환경 초기화

### test-utils.tsx

- React Testing Library 확장
- 프로바이더 래퍼
- 테스트 헬퍼 함수

## 🚀 실행 예시

```bash
# 특정 파일 테스트
npm test tag.utils.test.ts

# 특정 디렉토리 테스트
npm test __tests__/domain/

# 변경된 파일만 테스트
npm test --onlyChanged

# 패턴 매칭으로 테스트
npm test --testNamePattern="getAllTags"
```

## 📈 지속적 개선

1. **테스트 커버리지 모니터링**: 정기적으로 커버리지 확인
2. **플레이크 테스트 제거**: 불안정한 테스트 개선
3. **테스트 성능 최적화**: 실행 시간 단축
4. **문서화 업데이트**: 테스트 가이드 지속 업데이트

---

## 💡 팁

- **단위 테스트 우선**: 작은 단위부터 테스트 작성
- **모킹 최소화**: 가능한 한 실제 구현체 사용
- **의미 있는 테스트명**: 테스트의 의도가 명확하게 드러나도록
- **엣지 케이스 고려**: 경계값, 예외 상황 테스트 포함
