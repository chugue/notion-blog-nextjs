# Codebase Structure

**Analysis Date:** 2026-06-20

## Directory Layout

```
notion-blog-nextjs/
├── app/                        # Next.js 16 App Router routes
│   ├── (main)/                 # Route group: homepage with post list
│   │   ├── page.tsx            # Main page RSC
│   │   ├── layout.tsx          # Main layout
│   │   └── _components/        # Post list, tag section, hex-tech, search, visit stats
│   ├── (blog)/                 # Route group: blog post detail
│   │   ├── blog/[id]/          # Dynamic blog post route
│   │   │   ├── page.tsx        # Blog detail RSC (entry point for Notion data flow)
│   │   │   ├── error.tsx       # Error boundary
│   │   │   └── not-found.tsx
│   │   ├── _components/        # NotionPageContent, CustomCodeBlock, TableOfContents, …
│   │   └── layout.tsx
│   ├── (about)/                # Route group: about page
│   │   └── about/
│   │       ├── page.tsx
│   │       ├── layout.tsx
│   │       ├── _components/    # AboutSideBar, CareerSection, TechStackSection, …
│   │       ├── _data/          # Static about-data.ts
│   │       └── _hooks/         # use-count-up.ts
│   ├── api/                    # API route handlers
│   │   ├── notion/             # GET: paginated post list + page data; POST: webhook (stub)
│   │   ├── notion-block-image/ # GET: Notion block image proxy
│   │   ├── notion-image/       # GET: external image proxy
│   │   ├── og-image/[postId]/  # GET: cover image proxy for OG
│   │   ├── page-view/          # POST: record page views (blog + main)
│   │   ├── revalidate/         # GET: manual cache purge (by ID / about / all)
│   │   ├── search/             # GET: all post metadata for client-side search
│   │   ├── site-metrics/       # GET: site analytics data
│   │   ├── sidebar/            # GET: sidebar data
│   │   ├── cron/               # GET: daily metrics cron job
│   │   └── open-graph/         # GET: open graph data
│   ├── layout.tsx              # Root layout (providers, fonts, GA script)
│   ├── globals.css             # Global Tailwind styles
│   ├── robots.ts               # robots.txt generator
│   └── sitemap.ts              # sitemap.xml generator
│
├── domain/                     # Core domain — no framework dependencies
│   ├── entities/               # TypeScript interfaces only
│   │   ├── post.entity.ts      # Post, PostMetadata, PostMetadataResp, GetPublishedPostParams
│   │   ├── notion.entity.ts    # NotionUser
│   │   ├── page-view.entity.ts
│   │   ├── tag-info.entity.ts
│   │   ├── site-metric.entity.ts
│   │   ├── visitor-info.entity.ts
│   │   └── hex-tech-stack.ts
│   └── utils/                  # Pure functions with no side effects
│       ├── post.utils.ts       # getPostMetadata, sortByDate, filterByTag, filterBySearch
│       ├── tag-info.utils.ts   # toTagFilterItem
│       ├── page-view.utils.ts
│       ├── hex-tech-stack.utils.ts
│       └── crypto.utils.ts
│
├── application/                # Use cases and ports
│   ├── port/                   # Repository port interfaces (implemented by infrastructure)
│   │   ├── post-repository.port.ts
│   │   ├── tag-info-repository.port.ts
│   │   ├── page-view-repository.port.ts
│   │   ├── site-metrics-repository.port.ts
│   │   ├── visitor-info-repository.port.ts
│   │   └── batch-repository.port.ts
│   ├── use-cases/              # Use-case adapters (implement presentation/ports/)
│   │   ├── post-usecase.adapter.ts
│   │   ├── tag-info-usecase.adapter.ts
│   │   ├── page-view-usecase.adapter.ts
│   │   ├── site-metric-usecase.adapter.ts
│   │   └── batch-usecase.adapter.ts
│   └── data-cache/             # Next.js unstable_cache wrappers at aggregate level
│       └── post.data-cache.ts
│
├── infrastructure/             # I/O adapters — Notion API, Supabase, Drizzle
│   ├── database/
│   │   ├── external-api/
│   │   │   └── notion-client.ts  # exports: notion (@notionhq/client), notionAPI (notion-client), n2m
│   │   ├── drizzle/
│   │   │   └── drizzle.ts        # Drizzle ORM postgres client (db, client exports)
│   │   └── supabase/
│   │       ├── client.ts         # Browser Supabase client
│   │       ├── server.ts         # Server Supabase client
│   │       ├── schema/           # Drizzle table definitions
│   │       └── migrations/       # SQL migration files
│   ├── queries/                # Raw query functions (per-entity, per-query caching)
│   │   ├── post.query.ts       # getPublishedPosts, getPostByIdQuery, getAllPostMetadataCache
│   │   ├── tag-filter-item.query.ts
│   │   ├── page-views.query.ts
│   │   ├── site-metrics.query.ts
│   │   └── visitor-info.query.ts
│   └── repositories/           # Repository adapters (implement application/port/)
│       ├── post.repository.adapter.ts
│       ├── tag-info-repository.adapter.ts
│       ├── page-view-repository.adapter.ts
│       ├── site-metrics-repository.adapter.ts
│       ├── visitor-info-repository.adapter.ts
│       └── batch-repository.adapter.ts
│
├── presentation/               # Presentation utilities, hooks, stores, providers
│   ├── utils/                  # Server-side page data orchestration
│   │   ├── get-post-detail-page.ts   # Resolves DI → use case → returns recordMap + properties
│   │   ├── get-main-page-data.ts     # Resolves DI → returns tag and post promises
│   │   ├── highlight-code-blocks.ts  # Shiki server highlighter → HighlightedCodeMap
│   │   ├── cookie-utils.ts
│   │   ├── covert-to-img-proxy.ts
│   │   ├── get-honecomb-positions.ts
│   │   ├── map-to-image-url.ts
│   │   └── to-tag-Info.ts
│   ├── ports/                  # Use-case port interfaces (implemented by application/use-cases/)
│   │   ├── post-usecase.port.ts
│   │   ├── tag-info-usecase.port.ts
│   │   ├── page-view-usecase.port.ts
│   │   ├── site-metrics-usecase.port.ts
│   │   └── batch-usecase-port.ts
│   ├── hooks/                  # React client hooks
│   │   ├── blog/               # use-active-heading, use-check-selected-tag, use-fetch-post, use-infinite-scroll, use-toc-list
│   │   ├── blog-detail/        # use-scroll-direction
│   │   ├── main/               # use-add-pageview, use-card-animation, use-debounce, use-is-mobile, …
│   │   ├── get-search-results.ts
│   │   ├── use-smooth-scroll.tsx
│   │   └── use-sync-selected-tag.ts
│   ├── stores/                 # Zustand stores
│   │   ├── use-search.store.ts
│   │   └── use-selected-tag.store.ts
│   └── providers/              # React provider wrappers
│       ├── TanstackProvider.tsx
│       ├── ThemeProvider.tsx
│       └── SmoothScrollProvider.tsx
│
├── shared/                     # Cross-cutting: DI, types, utilities, UI components
│   ├── di/                     # Dependency injection container and factories
│   │   ├── di-container.ts     # getDiContainer(), diContainer singleton
│   │   ├── post-dependencies.ts
│   │   ├── tag-info-dependencies.ts
│   │   ├── page-view-dependencies.ts
│   │   ├── site-metric-dependencies.ts
│   │   └── batch-dependencies.ts
│   ├── types/
│   │   ├── result.ts           # Result<T> discriminated union
│   │   ├── notion.ts           # Shared Notion type re-exports
│   │   ├── search.ts
│   │   └── main-page-chartdata.ts
│   ├── utils/
│   │   ├── format-date.ts      # formatDate, getKstDate, getADayBefore
│   │   ├── tailwind-cn.ts      # cn() utility (clsx + tailwind-merge)
│   │   ├── notion-image-utils.ts  # fetchImageWithRetry, convertToNotionImageUrl, isGif
│   │   └── rollback-error.ts
│   └── components/
│       ├── ui/                 # shadcn/ui components (accordion, button, badge, …)
│       ├── layouts/            # Header.tsx, Footer.tsx
│       ├── LoadingSpinner.tsx
│       ├── ThemeToggle.tsx
│       └── Threads.tsx
│
├── __tests__/                  # Test files mirroring source structure
│   ├── app/
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   ├── integration/
│   ├── presentation/
│   └── shared/
│
├── docs/                       # Project documentation and archived decisions
├── patches/                    # npm patch files for dependency overrides
├── public/                     # Static assets (font/, icons/, images/)
├── drizzle.config.ts           # Drizzle ORM configuration
├── next.config.ts              # Next.js config (image domains, turbopack, headers)
├── tsconfig.json               # TypeScript config; path alias @/* → ./*
├── jest.config.js              # Jest configuration
└── vercel.json                 # Vercel deployment config (cron schedule)
```

## Key File Locations

**Entry Points:**
- `app/(main)/page.tsx` — Homepage (post list, tag filter, hex-tech, visit stats)
- `app/(blog)/blog/[id]/page.tsx` — Blog detail (Notion content rendering)
- `app/(about)/about/page.tsx` — About page
- `app/layout.tsx` — Root layout (providers)

**Notion Data Flow:**
- `infrastructure/database/external-api/notion-client.ts` — `notion` and `notionAPI` client instances
- `infrastructure/queries/post.query.ts` — `getPostByIdQuery` (calls `notionAPI.getPage`), `getPublishedPosts` (calls `notion.databases.query`)
- `infrastructure/repositories/post.repository.adapter.ts` — Maps raw Notion responses to domain types
- `application/use-cases/post-usecase.adapter.ts` — Business logic layer
- `presentation/utils/get-post-detail-page.ts` — Page utility entry point
- `app/(blog)/_components/NotionPageContent.tsx` — Client renderer (`react-notion-x` + custom components)
- `presentation/utils/highlight-code-blocks.ts` — Server-side Shiki highlighting

**DI / Wiring:**
- `shared/di/di-container.ts` — Singleton accessor
- `shared/di/post-dependencies.ts` — Post domain wiring (repo → use case)

**Types / Contracts:**
- `domain/entities/post.entity.ts` — Core domain types (`Post`, `PostMetadata`, `PostMetadataResp`)
- `shared/types/result.ts` — `Result<T>` type
- `application/port/post-repository.port.ts` — Repository contract
- `presentation/ports/post-usecase.port.ts` — Use-case contract

**Database:**
- `infrastructure/database/drizzle/drizzle.ts` — Drizzle `db` client
- `infrastructure/database/supabase/schema/` — Table schemas (`page-views.ts`, `site-metircs.ts`, `tag-filter-item.ts`, `visitor-info.ts`)

**Configuration:**
- `next.config.ts` — Image remote patterns, turbopack, cache headers
- `drizzle.config.ts` — Drizzle migration config
- `vercel.json` — Cron job schedule
- `tsconfig.json` — Path alias `@/*` → project root

## Naming Conventions

**Files:**
- Adapters: `<domain>.<layer>.adapter.ts` (e.g., `post.repository.adapter.ts`, `post-usecase.adapter.ts`)
- Ports: `<domain>-<layer>.port.ts` (e.g., `post-repository.port.ts`, `post-usecase.port.ts`)
- Queries: `<domain>.query.ts` (e.g., `post.query.ts`, `page-views.query.ts`)
- Entities: `<domain>.entity.ts` (e.g., `post.entity.ts`)
- Hooks: `use-<description>.ts` (e.g., `use-fetch-post.ts`, `use-infinite-scroll.ts`)
- Stores: `use-<domain>.store.ts` (e.g., `use-search.store.ts`)
- Page utilities: `get-<description>.ts` (e.g., `get-post-detail-page.ts`)
- DI factories: `<domain>-dependencies.ts` (e.g., `post-dependencies.ts`)
- React components: `PascalCase.tsx` (e.g., `NotionPageContent.tsx`, `CustomCodeBlock.tsx`)

**Directories:**
- Route groups: `(<group-name>)` (e.g., `(main)`, `(blog)`, `(about)`)
- Private route components: `_components/` within route group
- Private route data: `_data/` within route group
- Private route hooks: `_hooks/` within route group

**TypeScript:**
- Factory functions (DI): `create<Domain><Layer>` (e.g., `createPostRepositoryAdapter`, `createPostUseCaseAdapter`)
- Port interfaces: `<Domain><Layer>Port` (e.g., `PostRepositoryPort`, `PostUseCasePort`)
- Domain entities: `PascalCase` interfaces (e.g., `PostMetadata`, `Post`, `AboutPost`)
- Zustand stores: exported as `useXxxStore` hooks

## Where to Add New Code

**New domain entity:**
- Interface: `domain/entities/<domain>.entity.ts`
- Pure utilities: `domain/utils/<domain>.utils.ts`
- Tests: `__tests__/domain/utils/<domain>.utils.test.ts`

**New repository (new data source):**
1. Add port interface: `application/port/<domain>-repository.port.ts`
2. Implement adapter: `infrastructure/repositories/<domain>-repository.adapter.ts`
3. Add query functions: `infrastructure/queries/<domain>.query.ts`
4. Add DB schema if Supabase: `infrastructure/database/supabase/schema/<domain>.ts` + migration
5. Wire in DI: create `shared/di/<domain>-dependencies.ts`, register in `shared/di/di-container.ts`

**New use case:**
1. Add use-case port to `presentation/ports/<domain>-usecase.port.ts`
2. Implement in `application/use-cases/<domain>-usecase.adapter.ts`
3. Wire in `shared/di/<domain>-dependencies.ts`

**New API route:**
- Create `app/api/<route-name>/route.ts`
- Use `getDiContainer()` or `diContainer` to access use cases
- Return `NextResponse.json({ success: true/false, data/error })`

**New page route:**
- Create directory under appropriate route group: `app/(main)/`, `app/(blog)/`, `app/(about)/`
- Server data fetching: add utility in `presentation/utils/get-<page>-data.ts`
- Local components: `app/(<group>)/_components/<ComponentName>.tsx`

**New client hook:**
- Add to `presentation/hooks/<domain>/use-<description>.ts`
- Use TanStack Query for server state, Zustand for UI state

**New shadcn/ui component:**
- Add to `shared/components/ui/<component>.tsx` (following shadcn/ui CLI output format)

**New shared utility:**
- Pure functions with no React/Next.js deps: `shared/utils/<name>.ts`

## Special Directories

**`patches/`:**
- Purpose: npm patch files for forked dependency fixes (e.g., `react-notion-x` patches)
- Generated: No (manually maintained)
- Committed: Yes

**`infrastructure/database/supabase/migrations/`:**
- Purpose: Drizzle-generated SQL migration files
- Generated: Yes (via `drizzle-kit generate`)
- Committed: Yes

**`.planning/codebase/`:**
- Purpose: Architecture documentation for GSD commands
- Generated: Yes (by gsd-map-codebase)
- Committed: Yes

**`__tests__/`:**
- Purpose: All test files, mirroring the source directory structure
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-06-20*
