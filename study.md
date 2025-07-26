# Next.js 15 서버 컴포넌트 캐시 관리 및 폴더 구조 베스트 프랙티스 (2025)

## 목차
1. [Next.js 15 캐싱 주요 변경사항](#nextjs-15-캐싱-주요-변경사항)
2. [캐시 관리 베스트 프랙티스](#캐시-관리-베스트-프랙티스)
3. [추천 폴더 구조](#추천-폴더-구조)
4. [실전 예제](#실전-예제)

## Next.js 15 캐싱 주요 변경사항

### 🚨 중요: 기본 캐싱 동작이 완전히 바뀌었습니다!

Next.js 15부터는 **아무것도 기본적으로 캐시되지 않습니다**. 이전 버전과 달리:

- ❌ fetch 요청은 기본적으로 캐시되지 않음 (`no-store`가 기본값)
- ❌ GET 라우트 핸들러는 기본적으로 캐시되지 않음
- ❌ 클라이언트 사이드 라우팅 시 페이지 컴포넌트가 캐시되지 않음
- ❌ 페이지 세그먼트의 `staleTime`이 0으로 기본 설정됨

## 캐시 관리 베스트 프랙티스

### 1. 'use cache' 디렉티브 사용하기

Next.js 15의 가장 중요한 기능 중 하나입니다. 명시적으로 캐싱을 원하는 함수나 컴포넌트를 지정할 수 있습니다.

#### 기본 설정 (next.config.ts)
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,  // use cache 디렉티브 활성화
    dynamicIO: true, // 고급 캐싱 기능 활성화
  },
}

export default nextConfig
```

#### 사용 방법
```typescript
// 파일 레벨 캐싱
'use cache'

export default async function Page() {
  // 이 파일의 모든 export가 캐시됨
}

// 컴포넌트 레벨 캐싱
export async function ProductComponent() {
  'use cache'
  const data = await fetch('/api/products')
  return <ProductList data={data} />
}

// 함수 레벨 캐싱
export async function getData() {
  'use cache'
  const response = await fetch('https://api.example.com/data')
  return response.json()
}
```

### 2. 캐시 수명 관리 (cacheLife)

기본 캐시 수명은 15분이지만, `cacheLife`로 커스터마이징 가능합니다:

```typescript
'use cache'
import { unstable_cacheLife as cacheLife } from 'next/cache'

export default async function Page() {
  cacheLife('hours')  // 시간 단위 캐싱
  // cacheLife('days')   // 일 단위 캐싱
  // cacheLife('weeks')  // 주 단위 캐싱
  // cacheLife('max')    // 최대 기간 캐싱
  
  return <div>캐시된 페이지</div>
}
```

### 3. 캐시 무효화 전략

#### revalidatePath 사용
```typescript
'use server'
import { revalidatePath } from 'next/cache'

export async function updatePost(postId: string) {
  // 데이터 업데이트 로직
  await db.post.update({ ... })
  
  // 특정 경로의 캐시 무효화
  revalidatePath('/posts')  // 전체 posts 경로
  revalidatePath(`/posts/${postId}`)  // 특정 post
}
```

#### revalidateTag 사용 (더 세밀한 제어)
```typescript
// 데이터 fetch 시 태그 지정
const posts = await fetch('/api/posts', {
  next: { tags: ['posts'] }
})

// Server Action에서 태그로 캐시 무효화
'use server'
import { revalidateTag } from 'next/cache'

export async function createPost() {
  // 새 포스트 생성
  await db.post.create({ ... })
  
  // 'posts' 태그가 지정된 모든 캐시 무효화
  revalidateTag('posts')
}
```

### 4. fetch 요청 캐싱 활성화

Next.js 15에서는 명시적으로 캐싱을 요청해야 합니다:

```typescript
// 캐싱 활성화
const data = await fetch('/api/data', {
  cache: 'force-cache'  // 또는 next: { revalidate: 3600 }
})

// 캐싱 비활성화 (기본값)
const data = await fetch('/api/data', {
  cache: 'no-store'
})
```

### 5. 서버 컴포넌트와 비직렬화 가능한 Props

비직렬화 가능한 데이터를 캐시된 컴포넌트에 전달할 때는 children으로 전달하세요:

```typescript
export default async function Page() {
  const uncachedData = await getRealtimeData()
  
  return (
    <CachedLayout>
      <DynamicContent data={uncachedData} />
    </CachedLayout>
  )
}

async function CachedLayout({ children }: { children: ReactNode }) {
  'use cache'
  const staticData = await getCachedData()
  
  return (
    <div>
      <Header data={staticData} />
      {children}
    </div>
  )
}
```

## 추천 폴더 구조

### 기본 구조
```
my-nextjs-project/
├── app/                    # App Router
│   ├── (auth)/            # 인증이 필요한 라우트 그룹
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   └── profile/
│   ├── (unauth)/          # 공개 라우트 그룹
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── products/
│   ├── api/               # API 라우트
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── src/                   # 소스 코드 (선택적이지만 권장)
│   ├── components/        # 컴포넌트
│   │   ├── ui/           # 기본 UI 컴포넌트
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   └── Modal/
│   │   ├── layout/       # 레이아웃 컴포넌트
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── Sidebar/
│   │   └── features/     # 기능별 컴포넌트
│   │       ├── auth/
│   │       └── dashboard/
│   ├── lib/              # 라이브러리 설정
│   │   ├── db.ts        # 데이터베이스 클라이언트
│   │   ├── auth.ts      # 인증 설정
│   │   └── api.ts       # API 클라이언트
│   ├── utils/            # 유틸리티 함수
│   ├── hooks/            # 커스텀 훅
│   ├── services/         # 비즈니스 로직
│   ├── stores/           # 상태 관리
│   └── types/            # TypeScript 타입
├── public/               # 정적 파일
├── .env                  # 환경 변수
├── next.config.ts        # Next.js 설정
├── package.json
└── tsconfig.json
```

### 모듈 기반 아키텍처 (대규모 프로젝트)

```
src/
├── modules/              # 기능별 모듈
│   ├── blog/
│   │   ├── components/   # 블로그 전용 컴포넌트
│   │   ├── hooks/        # 블로그 전용 훅
│   │   ├── services/     # 블로그 API 서비스
│   │   ├── types/        # 블로그 타입
│   │   └── utils/        # 블로그 유틸리티
│   ├── auth/
│   └── dashboard/
├── shared/               # 공유 리소스
│   ├── components/
│   ├── hooks/
│   └── utils/
```

### 폴더 구조 베스트 프랙티스

1. **src 디렉토리 사용**: 소스 코드와 설정 파일의 명확한 분리
2. **기능 기반 구성**: 관련 파일을 기능별로 그룹화
3. **라우트 그룹 활용**: `(auth)`, `(unauth)` 등으로 라우트 구조화
4. **컴포넌트 계층화**: ui → layout → features 순으로 구성
5. **Co-location 원칙**: 관련 파일은 가까이 배치
6. **일관성 유지**: 선택한 구조를 프로젝트 전체에 일관되게 적용

### 피해야 할 실수

- ❌ app 디렉토리에 모든 코드 넣기
- ❌ components 폴더에 200개 이상의 파일 두기
- ❌ utils.ts 파일 하나에 2000줄 작성하기
- ❌ 7단계 이상의 깊은 중첩 구조
- ❌ 비즈니스 로직을 컴포넌트에 직접 작성

## 실전 예제

### 1. 블로그 포스트 캐싱
```typescript
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { unstable_cacheLife as cacheLife } from 'next/cache'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  'use cache'
  cacheLife('days')  // 포스트는 일 단위로 캐싱
  
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }
  
  return <PostContent post={post} />
}

// 포스트 업데이트 시
export async function updatePost(slug: string, data: PostData) {
  await db.post.update({ where: { slug }, data })
  revalidatePath(`/blog/${slug}`)
}
```

### 2. 대시보드 실시간 데이터
```typescript
// 캐시된 레이아웃과 동적 데이터 분리
export default async function DashboardPage() {
  const realtimeStats = await getRealtimeStats()  // 캐시하지 않음
  
  return (
    <DashboardLayout>
      <RealtimeStats data={realtimeStats} />
    </DashboardLayout>
  )
}

async function DashboardLayout({ children }: { children: ReactNode }) {
  'use cache'
  cacheLife('hours')
  
  const userProfile = await getUserProfile()
  const navigationItems = await getNavigationItems()
  
  return (
    <div>
      <Navigation items={navigationItems} />
      <UserHeader profile={userProfile} />
      {children}
    </div>
  )
}
```

### 3. API 응답 태그 기반 캐싱
```typescript
// 카테고리별 상품 조회
export async function getProductsByCategory(categoryId: string) {
  const response = await fetch(`/api/products?category=${categoryId}`, {
    next: { 
      tags: ['products', `category-${categoryId}`],
      revalidate: 3600  // 1시간
    }
  })
  
  return response.json()
}

// 특정 카테고리만 캐시 무효화
export async function updateCategory(categoryId: string) {
  await db.category.update({ ... })
  
  // 해당 카테고리의 상품만 캐시 무효화
  revalidateTag(`category-${categoryId}`)
}
```

## 마무리

Next.js 15의 캐싱 시스템은 **명시적이고 예측 가능한** 방향으로 변경되었습니다. 기본적으로 아무것도 캐시되지 않으므로, 개발자가 직접 캐싱 전략을 결정해야 합니다. 이는 초기에는 더 많은 작업이 필요하지만, 장기적으로는 더 나은 성능 제어와 디버깅 경험을 제공합니다.

핵심은:
- 필요한 곳에만 캐싱 적용
- 적절한 캐시 수명 설정
- 효과적인 캐시 무효화 전략
- 명확한 폴더 구조로 유지보수성 향상

이러한 베스트 프랙티스를 따르면 Next.js 15에서 효율적이고 확장 가능한 애플리케이션을 구축할 수 있습니다.