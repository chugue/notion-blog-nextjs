<!-- refreshed: 2026-06-20 -->
# Architecture

**Analysis Date:** 2026-06-20

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                  app/ (Next.js 16 App Router)                        │
│  (main)/page.tsx  │  (blog)/blog/[id]/page.tsx  │  api/ route.ts    │
└────────┬──────────┴──────────────┬──────────────┴────────┬──────────┘
         │                         │                        │
         ▼                         ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│              presentation/ (orchestration utilities)                 │
│  utils/get-main-page-data.ts  │  utils/get-post-detail-page.ts      │
│  utils/highlight-code-blocks.ts                                      │
│  hooks/  │  stores/  │  ports/ (use-case interfaces)                │
└────────┬─────────────────────────┬───────────────────────────────────┘
         │                         │
         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     shared/di/di-container.ts                        │
│  getDiContainer() → PostDependencies, TagInfoDependencies, …         │
└────────┬─────────────────────────────────────────────────────────────┘
         │ wires together
         ▼
┌────────────────────┐    ┌────────────────────────────────────────────┐
│  application/      │    │  domain/                                    │
│  use-cases/        │    │  entities/ (PostMetadata, Post, …)          │
│  port/ (repo ifaces│    │  utils/ (getPostMetadata, sortByDate, …)    │
│  data-cache/       │    └────────────────────────────────────────────┘
└────────┬───────────┘
         │ calls
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│               infrastructure/repositories/                           │
│  post.repository.adapter.ts  │  tag-info-repository.adapter.ts      │
└────────┬──────────────────────┬──────────────────────────────────────┘
         │                      │
         ▼                      ▼
┌───────────────────┐  ┌──────────────────────────────────────────────┐
│ infrastructure/   │  │ infrastructure/database/                      │
│ queries/          │  │  external-api/notion-client.ts (notion + notionAPI)│
│ post.query.ts     │  │  drizzle/drizzle.ts (Supabase/postgres via Drizzle)│
│ tag-filter-item…  │  │  supabase/client.ts                           │
└───────────────────┘  └──────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| DI Container | Singleton factory; wires repo→usecase pairs | `shared/di/di-container.ts` |
| PostDependencies | Wires `PostRepositoryAdapter` → `PostUseCaseAdapter` | `shared/di/post-dependencies.ts` |
| PostUseCaseAdapter | Business logic; unwraps `Result<T>`; delegates to repo | `application/use-cases/post-usecase.adapter.ts` |
| PostRepositoryAdapter | Data access; calls `postQuery` or `notion.pages.retrieve` | `infrastructure/repositories/post.repository.adapter.ts` |
| postQuery | Raw Notion API calls; wraps in `unstable_cache` | `infrastructure/queries/post.query.ts` |
| notion-client | Instantiates `@notionhq/client` Client + `notion-client` NotionAPI | `infrastructure/database/external-api/notion-client.ts` |
| get-post-detail-page | Thin page utility; resolves DI, calls useCase, calls notFound() | `presentation/utils/get-post-detail-page.ts` |
| highlight-code-blocks | Server-side Shiki highlighter; returns `HighlightedCodeMap` | `presentation/utils/highlight-code-blocks.ts` |
| NotionPageContent | Client component; wraps `react-notion-x` NotionRenderer | `app/(blog)/_components/NotionPageContent.tsx` |
| CustomCodeBlock | Client component; reads from `HighlightedCodeContext`, renders shiki HTML | `app/(blog)/_components/CustomCodeBlock.tsx` |
| HighlightedCodeContext | React Context; passes server-highlighted HTML map to client tree | `app/(blog)/_components/HighlightedCodeContext.tsx` |
| allPostMetadatasDataCache | Application-layer Next.js cache wrapper for `getAllPublishedPosts` | `application/data-cache/post.data-cache.ts` |
| drizzle.ts | Postgres client (Drizzle ORM) for Supabase analytics tables | `infrastructure/database/drizzle/drizzle.ts` |

## Pattern Overview

**Overall:** Hexagonal / Ports-and-Adapters (Clean Architecture)

**Key Characteristics:**
- Every cross-layer boundary is defined by a TypeScript interface (port)
- Adapters implement ports; they are never imported directly across layer boundaries — only through the DI container
- Domain entities (`domain/entities/`) are plain TypeScript interfaces with no framework dependencies
- All infra calls return `Result<T>` (discriminated union `{ success: true; data }` | `{ success: false; error }`)
- The DI container is a module-level singleton stored on `global.__diContainer` to survive hot-reload

## Layers

**domain/ — Core Domain:**
- Purpose: Entities and pure business logic utilities
- Location: `domain/`
- Contains: TypeScript interfaces (`post.entity.ts`, `page-view.entity.ts`, …), pure functions (`post.utils.ts`, `tag-info.utils.ts`, …)
- Depends on: Nothing (no imports from other layers)
- Used by: `application/`, `infrastructure/`, `presentation/`

**application/ — Use Cases:**
- Purpose: Orchestrates domain logic; owns caching strategy for aggregate data
- Location: `application/`
- Contains: Port interfaces (`application/port/*.ts`), use-case adapters (`application/use-cases/*.adapter.ts`), Next.js `unstable_cache` wrappers (`application/data-cache/`)
- Depends on: `domain/`, `presentation/ports/` (use-case port interfaces live in `presentation/ports/`)
- Used by: `infrastructure/` (indirect via DI), `presentation/`, `app/`

**infrastructure/ — Data Access:**
- Purpose: All I/O — Notion API, Supabase/Postgres via Drizzle
- Location: `infrastructure/`
- Contains:
  - `repositories/*.adapter.ts` — implement `application/port/*-repository.port.ts`
  - `queries/*.query.ts` — raw SDK calls; apply per-query `unstable_cache`
  - `database/external-api/notion-client.ts` — exports `notion` (`@notionhq/client`) and `notionAPI` (`notion-client`)
  - `database/drizzle/drizzle.ts` — Drizzle ORM client for Supabase Postgres
  - `database/supabase/schema/` — Drizzle schema definitions
- Depends on: `domain/`, `application/port/`, `shared/`
- Used by: `shared/di/` (injected into use cases)

**presentation/ — Presentation Utilities:**
- Purpose: Server-side page orchestration utilities, client hooks, Zustand stores, provider wrappers
- Location: `presentation/`
- Contains:
  - `utils/get-post-detail-page.ts` — calls use case, invokes `notFound()`
  - `utils/get-main-page-data.ts` — calls use cases, returns promises for Suspense
  - `utils/highlight-code-blocks.ts` — Shiki server highlighter
  - `hooks/` — React hooks (TanStack Query for client data fetching)
  - `stores/` — Zustand stores (`use-search.store.ts`, `use-selected-tag.store.ts`)
  - `ports/` — Use-case port interfaces (consumed by `application/use-cases/`)
  - `providers/` — ThemeProvider, TanstackProvider, SmoothScrollProvider
- Depends on: `domain/`, `application/`, `shared/di/`
- Used by: `app/`

**shared/ — Cross-Cutting:**
- Purpose: DI container, shared types, utility functions, shadcn/ui components
- Location: `shared/`
- Contains:
  - `di/di-container.ts` — singleton `getDiContainer()` / `diContainer`
  - `di/*-dependencies.ts` — per-domain dependency factories
  - `types/result.ts` — `Result<T>` discriminated union
  - `components/ui/` — shadcn/ui component library
  - `utils/` — `format-date.ts`, `tailwind-cn.ts`, `notion-image-utils.ts`
- Depends on: `domain/`, `application/`, `infrastructure/`, `presentation/ports/`
- Used by: All layers

**app/ — Next.js Route Layer:**
- Purpose: Route handlers, page components, API endpoints
- Location: `app/`
- Contains: Route groups `(main)`, `(blog)`, `(about)`, `api/`
- Depends on: `presentation/`, `shared/di/`
- Used by: Next.js runtime only

## Data Flow

### Blog Post Detail Page (Primary Notion Read Path)

1. **Request hits** `app/(blog)/blog/[id]/page.tsx` — async Server Component
2. **Calls** `getPostDetailPage(id)` in `presentation/utils/get-post-detail-page.ts`
3. **Resolves DI** via `getDiContainer().post.postUseCase` (`shared/di/di-container.ts` → `shared/di/post-dependencies.ts`)
4. **Use case** `createPostUseCaseAdapter.getPostById(id)` in `application/use-cases/post-usecase.adapter.ts`
5. **Repository** `createPostRepositoryAdapter.getPostById(id)` in `infrastructure/repositories/post.repository.adapter.ts`
6. **Query** `postQuery.getPostByIdQuery(id)` in `infrastructure/queries/post.query.ts` — wraps `notionAPI.getPage(id)` with `unstable_cache` (tags: `post-${id}`, `all-posts`)
7. **notionAPI.getPage(id)** — `NotionAPI` from `notion-client` package (unofficial Notion API), instantiated in `infrastructure/database/external-api/notion-client.ts`; returns `ExtendedRecordMap`
8. **Metadata lookup** — repository also calls `postQuery.getAllPostMetadataCache()` which queries `notion.databases.query` (official `@notionhq/client`) to find `PostMetadata` for the post; falls back to `notion.pages.retrieve` if not in cache
9. **Result unwrapped** at use-case layer; `PostMetadata` + `ExtendedRecordMap` returned as `Post`
10. **Server highlights code blocks** via `highlightCodeBlocks(recordMap)` in `presentation/utils/highlight-code-blocks.ts` — uses Shiki with `globalThis` singleton; returns `HighlightedCodeMap`
11. **Page renders** `NotionPageContent` (`app/(blog)/_components/NotionPageContent.tsx`) — a `'use client'` component that renders `react-notion-x`'s `NotionRenderer` with:
    - Custom `mapImageUrl` routing all Notion images through `/api/notion-block-image?blockId=…`
    - `Code` component overridden by `CustomCodeBlock`
12. **`CustomCodeBlock`** reads pre-highlighted HTML from `HighlightedCodeContext` (injected by `HighlightedCodeProvider` at the `NotionPageContent` level) and renders via `dangerouslySetInnerHTML`

### Main Page Post List Flow

1. `app/(main)/page.tsx` calls `getMainPageData()` (`presentation/utils/get-main-page-data.ts`)
2. `getMainPageData` calls `diContainer.post.postUseCase.getPostsWithParams({ tag, sort, pageSize: 12 })`
3. Use case delegates to `postRepositoryPort.getPostsWithParams` → `postQuery.getPublishedPosts` → `notion.databases.query`
4. Returns `PostMetadataResp` as a `Promise` — passed to `<PostListSuspense postsPromise={promise} />`
5. `PostListSuspense` (client) unwraps via React `use()`, hydrates TanStack Query `useInfiniteQuery` with `initialData`
6. Infinite scroll pagination fetches `/api/notion?tag=…&sort=…&startCursor=…` which calls the same use case path

### Image Proxy Flow

All Notion block images are served through the image proxy:
1. `NotionPageContent.mapImageUrl` returns `/api/notion-block-image?blockId=<id>` for any Notion-hosted image
2. `app/api/notion-block-image/route.ts` calls `notionAPI.getPage(blockId)` to get a fresh signed URL from `signed_urls`
3. Server proxies the image bytes, applying `Cache-Control: public, max-age=3600`

### Cache Invalidation Flow

1. Notion webhook POST → `app/api/notion/webhook/route.ts` (currently stub — body is only logged)
2. Manual revalidation: `GET /api/revalidate/[id]` calls `revalidateTag('post-${id}')` to purge Next.js cache for a specific post
3. `GET /api/revalidate/all` purges `all-posts` tag
4. Cron job `GET /api/cron` creates daily site metrics in Supabase via `batchUseCase.createTodayMetrics()`

**State Management:**
- Server state: Next.js `unstable_cache` with tag-based invalidation (applied at query and data-cache layers)
- Client state: TanStack Query `useInfiniteQuery` for paginated post lists (`presentation/hooks/blog/use-fetch-post.ts`)
- UI state: Zustand stores for search query and selected tag filter (`presentation/stores/`)

## Key Abstractions

**Result\<T\>:**
- Purpose: Discriminated union for all infrastructure return values — eliminates `try/catch` at use-case boundary
- Location: `shared/types/result.ts`
- Pattern: `{ success: true; data: T } | { success: false; error: Error; statusCode?: number }`

**Port Interfaces (dual set):**
- Repository ports (`application/port/`) — implemented by infrastructure adapters
- Use-case ports (`presentation/ports/`) — implemented by application adapters, consumed by page utilities and hooks
- Pattern: `interface PostRepositoryPort` / `interface PostUseCasePort` with `readonly` methods

**DI Container Singleton:**
- Location: `shared/di/di-container.ts`
- Pattern: `getDiContainer()` checks `global.__diContainer`; returns or creates. Module-level `diContainer` constant for synchronous imports. Per-domain factories in `shared/di/*-dependencies.ts`

**HighlightedCodeMap:**
- Purpose: Bridges server-side Shiki highlighting and client-side rendering
- Pattern: Server computes `{ [blockId]: string }` (HTML), passes as prop to `NotionPageContent`, distributed via `HighlightedCodeContext` to `CustomCodeBlock` components

## Entry Points

**Blog Detail Page:**
- Location: `app/(blog)/blog/[id]/page.tsx`
- Triggers: Next.js RSC render (SSG pre-built by `generateStaticParams`, or ISR with `revalidate = 3600`)
- `SKIP_SSG_IDS` set exempts known problematic posts from static generation

**Main Page:**
- Location: `app/(main)/page.tsx`
- Triggers: Next.js RSC render; reads `tag` and `sort` from searchParams

**Root Layout:**
- Location: `app/layout.tsx`
- Wraps all pages with: `TanstackProvider`, `ThemeProvider`, `SmoothScrollProvider`, `Toaster`

**API Routes:**
- `/api/notion` — GET: paginated post list (delegated to `postUseCase`)
- `/api/notion/page` — GET: single page (delegated to `postUseCase`)
- `/api/notion-block-image` — GET: image proxy (calls `notionAPI.getPage`)
- `/api/og-image/[postId]` — GET: cover image proxy for OG tags (calls `notion.pages.retrieve`)
- `/api/revalidate/[id]` — GET: purge single post cache
- `/api/revalidate/all` — GET: purge all-posts cache
- `/api/cron` — GET: Vercel cron; creates daily site metrics
- `/api/page-view/blog/[id]` — POST: record blog page view
- `/api/search` — GET: all published post metadata for client-side search

## Architectural Constraints

- **Threading:** Node.js single-threaded event loop. Shiki highlighter uses a `globalThis` singleton (`globalForShiki.shikiHighlighter`) to avoid re-instantiation across requests.
- **Global state:** `global.__diContainer` in `shared/di/di-container.ts` — intentional singleton pattern for Next.js server environment.
- **Two Notion clients:** `notion` (`@notionhq/client` — official REST API) and `notionAPI` (`notion-client` — unofficial, returns `ExtendedRecordMap` for `react-notion-x`). Both exported from `infrastructure/database/external-api/notion-client.ts`. Upgrading either package requires understanding which data shape each one returns.
- **`unstable_cache` at two levels:** Query-level cache in `infrastructure/queries/post.query.ts` AND data-cache level in `application/data-cache/post.data-cache.ts`. Duplicate cache keys (`post-${id}`, `all-posts`) exist between these two levels — revalidation of one should cover both.
- **SSG exclusion list:** `SKIP_SSG_IDS` in `app/(blog)/blog/[id]/page.tsx` forces certain posts to dynamic rendering. This must be manually maintained.

## Anti-Patterns

### Stale PostList.client.tsx

**What happens:** `app/(main)/_components/post-list/PostList.client.tsx` fetches `/api/notion` with a bare `fetch()` in `useEffect` with no pagination, no error handling, no TanStack Query integration.
**Why it's wrong:** It duplicates logic already handled properly by `PostListSuspense.tsx` and `useFetchPost.ts`, and its data is thrown away because the page actually renders `PostListSuspense`.
**Do this instead:** Delete `PostList.client.tsx` — `PostListSuspense.tsx` (`app/(main)/_components/post-list/PostListSuspense.tsx`) is the active implementation.

### Direct DB Call in Use-Case Adapter

**What happens:** `createBatchUsecaseAdapter` in `application/use-cases/batch-usecase.adapter.ts` imports `db` (Drizzle client) directly and calls `db.transaction(...)`, bypassing the repository adapter.
**Why it's wrong:** Violates the ports-and-adapters boundary — use cases should only depend on repository ports, not infrastructure clients.
**Do this instead:** Move the transaction logic into `infrastructure/repositories/batch-repository.adapter.ts` and expose it through `BatchRepositoryPort`.

### Webhook Stub

**What happens:** `app/api/notion/webhook/route.ts` only logs the request body and returns nothing.
**Why it's wrong:** Incoming Notion webhooks are silently dropped; no cache invalidation is triggered.
**Do this instead:** Parse the webhook payload and call `revalidateTag` for the affected post ID, matching the pattern in `app/api/revalidate/[id]/route.ts`.

## Error Handling

**Strategy:** Railway-oriented — infrastructure always returns `Result<T>`; use-case layer checks `result.success` and returns `null` / empty array on failure (no exceptions propagate to page layer).

**Patterns:**
- Infrastructure: `try/catch` → `{ success: false, error: error as Error }`
- Use case: `if (!result.success) return null` — no re-throw
- Page layer: `if (!result.properties) return` for metadata; top-level `try/catch` in `BlogPost` re-throws to trigger Next.js `error.tsx`
- `notFound()` is called from `presentation/utils/get-post-detail-page.ts` when use case returns `null`

## Cross-Cutting Concerns

**Logging:** `console.log` / `console.error` inline at infrastructure layer. No structured logging framework.
**Validation:** None beyond TypeScript types. Notion API responses are type-asserted with `as PageObjectResponse`.
**Authentication:** None for public blog pages. API routes have no authentication guards (revalidate routes are open).
**Caching:** Next.js `unstable_cache` with tag-based invalidation. Cache tags: `post-${id}`, `all-posts`, `allPostMetadatas`, `getAllPublishedPostMetadatas`, `getAllTagInfosViaSupabase`.

---

*Architecture analysis: 2026-06-20*
