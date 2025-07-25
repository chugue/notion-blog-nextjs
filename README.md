# 📚 Notion Blog - Next.js 15 기반 기술 블로그

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.4.3-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

## 🚀 프로젝트 개요

**Notion API를 활용한 최신 기술 스택 기반의 개인 기술 블로그**

이 프로젝트는 Notion을 CMS로 활용하여 콘텐츠 관리의 효율성을 극대화하고, Next.js 15의 최신 기능들을 적극 활용한 고성능 블로그 플랫폼입니다. 

### 🎯 핵심 특징
- **Notion as CMS**: Notion API를 통한 실시간 콘텐츠 동기화
- **최신 기술 스택**: Next.js 15, React 19, TypeScript 5 활용
- **뛰어난 사용자 경험**: Server Components, Streaming SSR, 최적화된 이미지 처리
- **실시간 방문자 통계**: Supabase + Drizzle ORM을 활용한 실시간 데이터 처리

## 🛠️ 기술 스택

### Frontend Framework & Core
- **Next.js 15.4.3** - App Router, Server Components, Streaming SSR
- **React 19.0.0** - 최신 React 기능 활용
- **TypeScript 5.0** - 타입 안정성 보장

### Styling & UI
- **Tailwind CSS 4.0** - 유틸리티 우선 CSS 프레임워크
- **Radix UI** - 접근성을 고려한 헤드리스 UI 컴포넌트
- **shadcn/ui** - 재사용 가능한 컴포넌트 라이브러리
- **Framer Motion (GSAP)** - 부드러운 애니메이션 효과

### Content Management & Rendering
- **Notion API (@notionhq/client)** - CMS 백엔드
- **notion-to-md** - Notion 블록을 Markdown으로 변환
- **MDX (@mdx-js/react, next-mdx-remote)** - 마크다운 내 React 컴포넌트 사용
- **rehype-pretty-code + Shiki** - 구문 강조 코드 블록

### State Management & Data Fetching
- **TanStack Query v5** - 서버 상태 관리 및 캐싱
- **Zustand** - 클라이언트 상태 관리

### Database & ORM
- **PostgreSQL** - 메인 데이터베이스
- **Drizzle ORM** - TypeScript 우선 ORM
- **Supabase** - 실시간 데이터베이스 및 인증

### Developer Experience
- **ESLint & Prettier** - 코드 품질 및 포맷팅
- **React Hook Form + Zod** - 폼 관리 및 유효성 검증

## 💡 주요 기능 구현

### 1. Notion CMS 통합
```typescript
// Notion API를 활용한 포스트 조회
export const getPublishedPosts = async ({
  tag = '전체',
  sort = 'latest',
  pageSize = 10,
}: GetPublishedPostParams): Promise<GetPublishedPostResponse>
```
- Notion 데이터베이스를 블로그 CMS로 활용
- 실시간 콘텐츠 동기화
- 태그 필터링 및 정렬 기능

### 2. 실시간 방문자 통계
- Supabase Realtime을 활용한 실시간 조회수 업데이트
- Drizzle ORM을 통한 타입 안전한 데이터베이스 쿼리
- 페이지별 방문자 추적 및 통계

### 3. 고급 검색 기능
- 실시간 검색 with 디바운싱
- 검색어 하이라이팅
- Command (⌘K) 단축키 지원

### 4. MDX 기반 콘텐츠 렌더링
- 코드 블록 구문 강조 (Shiki)
- 목차(TOC) 자동 생성 및 현재 위치 추적
- GitHub Flavored Markdown 지원
- 댓글 시스템 (Giscus)

### 5. 성능 최적화
- Next.js Image 컴포넌트를 활용한 이미지 최적화
- React Server Components로 초기 로딩 속도 개선
- Suspense를 활용한 점진적 렌더링
- TanStack Query로 효율적인 데이터 캐싱

## 🏗️ 프로젝트 구조

```
notion-blog-nextjs/
├── app/                    # Next.js 15 App Router
│   ├── (main)/            # 메인 레이아웃 그룹
│   ├── (blog)/            # 블로그 레이아웃 그룹
│   ├── (about)/           # About 페이지
│   └── api/               # API 라우트
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   └── layouts/          # 레이아웃 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── services/         # 비즈니스 로직
│   ├── stores/           # Zustand 스토어
│   ├── supabase/         # DB 스키마 및 쿼리
│   └── types/            # TypeScript 타입 정의
└── public/               # 정적 파일
```

## 🔧 환경 설정

```bash
# 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 데이터베이스 마이그레이션
npm run db:migrate

# 코드 포맷팅
npm run format
```

### 필수 환경 변수
```env
NOTION_API_KEY=          # Notion Integration Token
NOTION_DATABASE_ID=      # Notion Database ID
DATABASE_URL=            # PostgreSQL 연결 URL
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 📈 성능 지표

- **Lighthouse 점수**: 95+ (Performance)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Core Web Vitals**: 모든 지표 통과

## 🎨 주요 기술적 결정사항

1. **Next.js 15 App Router 채택**
   - Server Components로 초기 번들 사이즈 감소
   - Streaming SSR로 사용자 경험 개선

2. **Notion as CMS**
   - 개발자 친화적인 콘텐츠 관리
   - 실시간 동기화로 배포 없이 콘텐츠 업데이트

3. **Drizzle ORM 선택**
   - TypeScript 우선 설계로 타입 안정성 확보
   - SQL-like 구문으로 학습 곡선 완화

4. **TanStack Query 도입**
   - 서버 상태와 클라이언트 상태 명확한 분리
   - 자동 리페칭 및 캐싱으로 UX 개선

## 🚀 향후 개발 계획

- [ ] 다크 모드 토글 기능
- [ ] i18n 다국어 지원
- [ ] RSS 피드 생성
- [ ] 소셜 공유 기능 강화
- [ ] PWA 지원

## 📞 연락처

프로젝트에 대한 문의사항이나 제안사항이 있으시다면 언제든지 연락 주세요!

---

<div align="center">
  Made with ❤️ using Next.js 15
</div>
