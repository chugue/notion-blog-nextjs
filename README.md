# 🏗️ Clean Architecture Blog Platform

> **클린 아키텍처 기반 Next.js 블로그 플랫폼**  
> Notion API를 활용한 현대적인 블로그 시스템

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-green)](#-클린-아키텍처-구현)
[![Test Coverage](https://img.shields.io/badge/Test%20Coverage-90%2B%25-brightgreen)](#-테스트-전략)

## 🎯 프로젝트 개요

**면접관님께 어필하고 싶은 핵심 포인트:**

- ✅ **클린 아키텍처** 완전 구현 (UI, Domain, Application, Infrastructure, Presentation)
- ✅ **의존성 역전 원칙** (DIP) 적용으로 확장 가능한 설계
- ✅ **포트 & 어댑터 패턴**으로 외부 의존성 분리
- ✅ **종합적인 테스트 전략** (단위, 통합, 컴포넌트 테스트)
- ✅ **타입 안전성** (TypeScript strict mode)

## 🏗️ 클린 아키텍처 구현

### 📁 아키텍처 다이어그램

```text
┌───────────────────────────────────┐
│             UI Layer              │ 
│       책임: UI & 단순 UI 로직        │
│    (map, 조건부 렌더링, 삼항연산자)     │
└─────────────────┬─────────────────┘
                  │        
                  ▼        
┌───────────────────────────────────┐
│         Presentation Layer        │ 
│     책임: 상태 관리, UI 데이터 가공     │
│    (hooks, providers, stores)     │
└─────────────────┬─────────────────┘
                  │
                  ▼
               [ PORT ]      !! PORT/ADAPTER로 인해서 단방향 의존성이 유지가 됨 
             [ Adapter ]     !! Presentation이 Application을 의존
                  ▲          
                  │                            
┌───────────────────────────────────┐                               ┌─────────────────────────────────────┐
│            Application            │                               │         Infrastructure Layer        │
│      책임: 비즈니스 로직, 에러 처리      │────▶︎ [PORT] | [Adapter] ◀︎─────│       책임: 외부 API, 데이터 베이스      │
│            (Use Cases)            │          의존성 역전             │            (Repository)             │
└─────────────────┬─────────────────┘                               └─────────────────────────────────────┘
                  │        
                  ▼    
┌───────────────────────────────────┐
│               Domain              │ 
│     책임: 앱 데이터 정의, 매핑 로직      │ !! Domain은 어디도 의존하지 않고 독립적
│    (entities, business rules)     │
└───────────────────────────────────┘
            

```

### 🔄 계층별 책임 분리

#### 1️⃣ **Domain Layer** (`domain/`)

```typescript
// 순수한 비즈니스 엔티티 정의
export interface PostMetadata {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly date: string;
  readonly tag: string[];
}
```

- **책임**: 비즈니스 규칙과 엔티티 정의
- **의존성**: 없음 (가장 안정적인 계층)

#### 2️⃣ **Application Layer** (`application/`)

```typescript
// 포트 정의 (인터페이스)
export interface PostRepositoryPort {
  readonly getAllPublishedPosts: () => Promise<Result<PostMetadata[]>>;
  readonly getPostById: (id: string) => Promise<Result<Post>>;
}

// 유스케이스 구현
export const createPostUseCaseAdapter = (
  postRepositoryPort: PostRepositoryPort
): PostUseCasePort => ({
  getAllPublishedPostMetadatas: async () => {
    const result = await postRepositoryPort.getAllPublishedPosts();
    return result.success ? result.data : [];
  }
});
```

- **책임**: 비즈니스 로직 오케스트레이션
- **의존성**: Domain만 의존 (포트를 통한 추상화)

#### 3️⃣ **Infrastructure Layer** (`infrastructure/`)

```typescript
// 어댑터 구현 (외부 API 호출)
export const createPostRepositoryAdapter = (): PostRepositoryPort => ({
  getAllPublishedPosts: async () => {
    try {
      const response = await postQuery.getPublishedPosts({ pageSize: 100 });
      return { success: true, data: response.results.map(getPostMetadata) };
    } catch (error) {
      return { success: false, error };
    }
  }
});
```

- **책임**: 외부 시스템과의 통신 (Notion API, Database)
- **의존성**: Application 포트 구현

#### 4️⃣ **Presentation Layer** (`presentation/`, `app/`)

```typescript
// DI 컨테이너를 통한 의존성 주입
export default async function Home({ searchParams }: HomeProps) {
  const tagInfoUseCase = diContainer.tagInfo.tagInfoUseCase;
  const postUseCase = diContainer.post.postUseCase;
  
  const tags = tagInfoUseCase.getAllTags();
  const postsPromise = postUseCase.getPostsWithParams({ tag, sort });
  
  return <PostListSuspense postsPromise={postsPromise} />;
}
```

- **책임**: 사용자 인터페이스 및 사용자 상호작용
- **의존성**: Application 유스케이스만 사용

### 🔧 의존성 주입 컨테이너

```typescript
// DI Container로 의존성 관리
export const createDiContainer = (): DiContainer => {
  const postRepository = createPostRepositoryAdapter();
  const postUseCase = createPostUseCaseAdapter(postRepository);
  
  return {
    post: { postRepository, postUseCase },
    tagInfo: { tagInfoRepository, tagInfoUseCase }
  };
};
```

## 🚀 주요 기술 스택

### Frontend

- **Next.js 15** (App Router) - 최신 React 프레임워크
- **TypeScript 5** (strict mode) - 타입 안전성 보장
- **Tailwind CSS + Radix UI** - 현대적 UI 구성
- **Zustand + TanStack Query** - 상태 관리 및 서버 상태

### Backend & Infrastructure

- **Notion API** - 헤드리스 CMS로 활용
- **Supabase + Drizzle ORM** - 타입 안전한 데이터베이스 관리
- **MDX** - 마크다운 기반 콘텐츠 렌더링

### DevOps & Quality

- **Jest + Testing Library** - 종합적인 테스트 환경
- **ESLint + Prettier** - 코드 품질 관리

## 🧪 테스트 전략

### 📊 테스트 커버리지 90%+ 달성

```bash
# 테스트 실행
npm run test              # 전체 테스트
npm run test:watch        # 감시 모드
npm run test:coverage     # 커버리지 리포트
```

### 🎯 계층별 테스트 구조

```
__tests__/
├── domain/           # 도메인 로직 테스트
├── application/      # 유스케이스 테스트
├── infrastructure/   # 리포지토리 테스트
└── presentation/     # UI 컴포넌트 테스트
```

#### 예시: 유스케이스 테스트

```typescript
describe('Application Use Cases - TagInfo UseCase', () => {
  it('저장소에서 모든 태그를 가져와야 한다', async () => {
    // Given
    const mockTags = [{ id: 'react', name: 'React', count: 5 }];
    mockTagInfoRepository.getAllTags.mockResolvedValue(mockTags);
    
    // When
    const result = await tagInfoUseCase.getAllTags();
    
    // Then
    expect(result).toEqual(mockTags);
  });
});
```

## 🌟 핵심 기능

### 🔍 **실시간 검색 시스템**

- Debounced 검색으로 성능 최적화
- Fuzzy matching 알고리즘 적용
- 키보드 단축키 지원 (⌘+K)

### 🏷️ **지능형 태그 필터링**

- 태그별 게시물 수 자동 계산
- URL 쿼리 파라미터 기반 상태 관리
- 서버 사이드 필터링으로 성능 최적화

### 📊 **방문 통계 대시보드**

- 실시간 방문자 수 트래킹
- 일별/월별 통계 시각화
- Supabase를 활용한 효율적인 데이터 집계

### 🎨 **인터랙티브 기술 스택 시각화**

- GSAP 기반 애니메이션
- 허니콤 레이아웃으로 기술 스택 표현
- 반응형 디자인 구현

## 🔧 개발 경험 최적화

### ⚡ 성능 최적화

- **Next.js 15** App Router로 최신 RSC 활용
- **Suspense**와 **Streaming**으로 점진적 렌더링
- **unstable_cache**로 서버 사이드 캐싱
- **Code Splitting**으로 번들 크기 최적화

### 🎯 개발자 경험

- **TypeScript strict mode**로 런타임 에러 방지
- **ESLint + Prettier** 자동화로 일관된 코드 스타일
- **Hot Reload**와 **Fast Refresh**로 빠른 개발 사이클
- **컴포넌트 기반 설계**로 재사용성 극대화

## 📈 확장성 고려사항

### 🔄 **설계 원칙 준수**

- **SOLID 원칙** 완전 적용
- **의존성 역전 원칙**으로 테스트 용이성 확보
- **인터페이스 분리**로 모듈 간 결합도 최소화

### 🚀 **향후 확장 계획**

## 🛠️ 로컬 개발 환경 설정

### 📋 사전 요구사항

- Node.js 18+
- pnpm/npm/yarn
- Notion API 키
- Supabase 프로젝트

### ⚡ 빠른 시작

```bash
# 1. 저장소 클론
git clone [repository-url]
cd notion-blog-nextjs

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local에 API 키 설정

# 4. 데이터베이스 설정
npm run db:push

# 5. 개발 서버 실행
npm run dev
```

### 🗄️ 환경 변수

```env
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_database_id
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 기술적 의사결정

### 🤔 **왜 클린 아키텍처를 선택했나?**

1. **테스트 용이성**: 각 계층을 독립적으로 테스트 가능
2. **유지보수성**: 비즈니스 로직과 기술적 세부사항 분리
3. **확장성**: 새로운 요구사항에 유연하게 대응
4. **팀 협업**: 명확한 책임 분리로 병렬 개발 가능

### 🎯 **타입 안전성 극대화**

- `strict: true` TypeScript 설정
- 런타임 타입 검증 (Zod)
- API 응답 타입 자동 생성
- 컴파일 타임 에러 방지

## 👨‍💻 개발자 소개

**"클린 코드와 확장 가능한 아키텍처를 추구하는 개발자"**

이 프로젝트를 통해 다음과 같은 역량을 보여드리고자 합니다:

✅ **아키텍처 설계 능력** - 클린 아키텍처 완전 구현  
✅ **코드 품질 관리** - 90%+ 테스트 커버리지  
✅ **최신 기술 활용** - Next.js 15, React 19  
✅ **성능 최적화** - 서버 사이드 캐싱, 코드 스플리팅  
✅ **개발 경험 개선** - 타입 안전성, 자동화된 품질 관리  

---

## 📞 연락처

프로젝트에 대한 질문이나 기술적 토론을 환영합니다!

- 📧 Email: [your-email@example.com]
- 💼 LinkedIn: [your-linkedin]
- 🐙 GitHub: [your-github]

---

*"코드는 컴퓨터가 이해할 수 있도록 작성하는 것이 아니라, 사람이 이해할 수 있도록 작성하는 것이다."* - Martin Fowler
