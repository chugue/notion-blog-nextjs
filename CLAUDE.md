<!-- GSD:project-start source:PROJECT.md -->
## Project

**notion-blog-nextjs**

Stephen's personal tech blog — a Next.js 16 (App Router, Turbopack) site that renders posts authored in Notion. Content is fetched from Notion (both the official `@notionhq/client` for database queries and the unofficial `notion-client` for full page recordMaps) and rendered with `react-notion-x`, with server-side code highlighting via Shiki, image proxying, page-view analytics (Supabase), and Giscus comments.

This milestone introduces GSD planning to the existing repo and focuses on a single goal: get the blog onto the latest `react-notion-x` (7.10.0) with a healthy build and all posts rendering.

**Core Value:** The blog builds and every published post renders correctly. If anything else fails, this must hold.

### Constraints

- **Tech stack**: Next.js 16 + Turbopack, TypeScript, App Router — 기존 스택 유지.
- **Dependency**: 렌더링은 Notion **비공개 API**(`notion-client`)에 구조적으로 의존 — 포맷 변경에 취약. 정규화 어댑터를 우리 코드에 두어 방어.
- **Compatibility**: 업그레이드 후 기존에 정상 렌더되던 포스트가 회귀하면 안 됨(특히 인라인 DB `collection_view_page`, 동기화 블록 `transclusion_container`, 컬럼).
- **Build**: 완료 기준은 7.10에서 `next build` 그린 + 전 포스트(과거 404 포함) 렌더 정상 + `SKIP_SSG_IDS` 제거.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.x (strict mode) - All application code in `app/`, `infrastructure/`, `domain/`, `shared/`, `presentation/`, `components/`
- MDX - `app/mdx-page/page.mdx` (page extension declared in `next.config.ts`)
## Runtime
- Node.js 22.22.3 (detected via `node --version`)
- npm
- Lockfile: `package-lock.json` present
## Frameworks
- Next.js `^16.0.7` - App Router, SSR/SSG, API Routes, ISR via `unstable_cache` + `revalidateTag`
- React `^19.0.0` - UI rendering
- React DOM `^19.0.0` - DOM binding
- Tailwind CSS `^4.0.0` - Utility-first CSS (PostCSS plugin via `@tailwindcss/postcss ^4.0.0`)
- `@tailwindcss/typography ^0.5.16` - Prose styling for blog content
- `tw-animate-css ^1.3.5` - Animation utilities
- `class-variance-authority ^0.7.1` - Component variant system
- `clsx ^2.1.1` - Conditional classnames
- `tailwind-merge ^3.3.1` - Tailwind class merging
- Radix UI (full primitive set: accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, navigation-menu, popover, select, tabs, tooltip, etc.) - Accessible unstyled primitives
- `cmdk ^1.1.1` - Command palette
- `sonner ^2.0.6` - Toast notifications
- `vaul ^1.1.2` - Drawer component
- `lucide-react ^0.525.0` - Icon set
- `recharts ^2.15.4` - Charts (site metrics dashboard)
- `embla-carousel-react ^8.6.0` - Carousel
- `react-resizable-panels ^3.0.3` - Resizable panel layouts
- `react-day-picker ^9.8.0` - Date picker
- `framer-motion ^12.23.26` - UI animations
- `gsap ^3.13.0` + `@gsap/react ^2.1.2` - GSAP animations (used in `CustomCodeBlock.tsx`, `ScrollTrigger`)
- `lenis ^1.3.15` - Smooth scroll
- `locomotive-scroll ^4.1.4` - Scroll engine
- `zustand ^5.0.6` - Global client state
- `@tanstack/react-query ^5.83.0` - Server state / async data fetching
- `@tanstack/react-query-devtools ^5.83.0` - Dev tooling
- `react-hook-form ^7.60.0` - Form management
- `@hookform/resolvers ^5.1.1` - Form validation resolvers
- `zod ^4.0.5` - Schema validation
- `jest ^30.0.5` - Test runner (ESM mode via `NODE_OPTIONS='--experimental-vm-modules'`)
- `jest-environment-jsdom ^30.0.5` - JSDOM environment
- `@testing-library/react ^14.3.1` - React component testing
- `@testing-library/jest-dom ^6.6.4` - DOM matchers
- `@testing-library/user-event ^14.6.1` - User interaction simulation
- `msw ^2.10.4` - Mock Service Worker for API mocking
- `supertest ^7.1.4` - HTTP integration testing
- `@playwright/test ^1.54.1` - E2E testing
- Config: `jest.config.js`, `jest.setup.cjs`, `jest.setup.js`
- Turbopack - Available via `npm run dev:turbopack` (`next dev --turbopack`); `turbopack: {}` declared in `next.config.ts`
- `eslint ^9` + `eslint-config-next 15.2.5` + `eslint-config-prettier ^10.1.5` - Linting
- `prettier ^3.6.2` + `prettier-plugin-tailwindcss ^0.6.14` - Formatting
- `patch-package ^8.0.0` - Applied via `postinstall` hook to patch pinned notion packages
- `drizzle-kit ^0.31.4` - Database schema migrations CLI
## Key Dependencies
- `react-notion-x 7.4.3` - Notion page renderer (exact pin); patched via `patches/react-notion-x+7.4.3.patch`
- `notion-client 7.4.3` - Unofficial Notion private API client (exact pin); patched via `patches/notion-client+7.4.3.patch` to replace `ky` with native `fetch`
- `notion-utils 7.4.3` - Notion block utility functions (exact pin); patched via `patches/notion-utils+7.4.3.patch`
- `notion-types 7.4.3` - TypeScript types for Notion blocks (exact pin)
- `notion-to-md ^3.1.9` - Convert Notion blocks to Markdown
- `@notionhq/client ^4.0.1` - Official Notion SDK for `databases.query` and `pages.retrieve`
- `shiki ^3.10.0` - Server-side code highlighting (theme: `catppuccin-mocha`; singleton via `globalThis` in `presentation/utils/highlight-code-blocks.ts`)
- `react-shiki ^0.7.3` - React wrapper for shiki
- `react-notion-x-code-block ^0.4.1` - Code block component for react-notion-x
- `react-syntax-highlighter ^15.6.1` - Fallback highlighter
- `prismjs ^1.30.0` - Prism highlighter
- `@rehype-pretty/transformers ^0.13.2` - Rehype code transformers
- `katex ^0.16.22` - LaTeX math rendering
- `drizzle-orm ^0.44.5` - Type-safe ORM
- `postgres ^3.4.7` - PostgreSQL driver
- `@supabase/supabase-js ^2.55.0` - Supabase JS client
- `@supabase/ssr ^0.6.1` - Supabase SSR client (browser + server variants)
- `@vercel/analytics ^1.5.0` - Vercel Analytics (injected in `app/(main)/layout.tsx`)
- `@giscus/react ^3.1.0` - GitHub Discussions-based comments
- `open-graph-scraper ^6.10.0` - OG metadata scraping for bookmark embeds
- `date-fns ^4.1.0` - Date utilities
- `farmhash ^4.0.2` - Fast hashing
- `node-cron ^4.2.1` - Cron scheduling
- `@stefanprobst/rehype-extract-toc ^3.0.0` - TOC extraction from rehype
## Configuration
- Config: `tsconfig.json`
- Target: `ES2017`
- Strict mode enabled
- Path alias: `@/*` maps to project root `./*`
- Module resolution: `bundler`
- Config: `next.config.ts`
- `reactStrictMode: true`
- `poweredByHeader: false`
- `turbopack: {}` (Turbopack enabled)
- Image remote patterns: `picsum.photos`, `images.unsplash.com`, `prod-files-secure.s3.us-west-2.amazonaws.com`, `www.notion.so`, `notion-blog-nextjs-brown.vercel.app`
- `_next/image` assets cached `public, max-age=86400`
- Config: `drizzle.config.ts`
- Dialect: `postgresql`
- Schema: `./infrastructure/database/supabase/schema/*`
- Migrations output: `./infrastructure/database/supabase/migrations`
- Credentials from: `.env.local`
- `.env` present (never read; note existence only)
- `.env.local` used by drizzle-kit
- Config: `postcss.config.mjs` (Tailwind CSS v4 PostCSS plugin)
## Platform Requirements
- Node.js 22.x
- npm
- `npm run dev` (default Webpack) or `npm run dev:turbopack` (Turbopack)
- Deployment target: Vercel (`vercel.json` present with cron config)
- Hosted at: `notion-blog-nextjs-brown.vercel.app`
- Vercel cron: `GET /api/cron` runs daily at `0 15 * * *` (UTC 15:00)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase — `NotionPageContent.tsx`, `ThemeToggle.tsx`, `CustomCodeBlock.tsx`
- Hooks: `use-kebab-case.ts` — `use-fetch-post.ts`, `use-search-store.ts`, `use-scroll-direction.ts`
- Port interfaces: `kebab-case.port.ts` — `post-repository.port.ts`, `tag-info-usecase.port.ts`
- Adapter implementations: `kebab-case.adapter.ts` — `tag-info-repository.adapter.ts`, `post-usecase.adapter.ts`
- Queries: `kebab-case.query.ts` — `tag-filter-item.query.ts`, `post.query.ts`
- Entities: `kebab-case.entity.ts` — `post.entity.ts`, `site-metric.entity.ts`
- Stores (Zustand): `use-kebab-case.store.ts` — `use-search.store.ts`, `use-selected-tag.store.ts`
- Factory functions: `create` prefix returning an interface — `createTagInfoRepositoryAdapter()`, `createPostUseCaseAdapter()`
- Hooks: `use` prefix — `useFetchPost`, `useSearchStore`, `useActiveHeading`
- Domain utils: verb + noun — `toTagFilterItem`, `sortByDate`, `filterByTag`, `filterBySearch`, `getPostMetadata`
- Event handlers (where present): `handle` prefix
- camelCase throughout
- Boolean states: `is`/`has` prefix — `isOpen`, `isLoading`, `hasMore`
- Count values: `~Count` suffix — `count` field on `TagFilterItem`
- Result objects from queries: `result` (reused consistently)
- PascalCase for interfaces and types
- Interfaces preferred over `type` for object shapes — `PostMetadata`, `TagFilterItem`, `DiContainer`
- `type` used for discriminated unions — `Result<T, E>` in `shared/types/result.ts`
- Port interfaces always named `[Domain]RepositoryPort` or `[Domain]UsecasePort`
## Port/Adapter Architecture
- `presentation/ports/tag-info-usecase.port.ts` — `TagInfoUsecasePort`
- `presentation/ports/post-usecase.port.ts` — `PostUseCasePort`
## Result<T> Pattern
- Queries (`*.query.ts`) always wrap async DB calls in try/catch and return `Result<T>`
- Repository adapters check `result.success` before using `result.data`
- Use case adapters unwrap or propagate the `Result` — they never throw up to the caller
- Failed results at use-case level return safe defaults (`[]`, `null`, `{}`)
## Code Style
- Tool: Prettier (`/.prettierrc`)
- Single quotes: `true`
- Tab width: 4 spaces
- Trailing commas: `es5`
- Print width: 100 characters
- Bracket spacing: `true`
- Arrow parens: `always`
- Plugin: `prettier-plugin-tailwindcss` (auto-sorts Tailwind class names)
- Tool: ESLint flat config (`eslint.config.mjs`)
- Extends: `next/core-web-vitals`, `next/typescript`
- Disabled: `@typescript-eslint/no-unused-vars`, `react-hooks/exhaustive-deps`, `no-unused-vars`
- `eslint-config-prettier` included — Prettier rules win over ESLint formatting
- Strict mode enabled (`tsconfig.json`: `"strict": true`)
- Path alias `@/*` maps to repo root
- No `noUnusedLocals` enforcement (compensated by disabled eslint rule)
## Import Organization
- `@/` resolves to repo root (`tsconfig.json` paths)
- All cross-layer imports use `@/` — e.g., `import { Result } from '@/shared/types/result'`
- Integration test files use relative paths (e.g., `'../../../app/api/notion/route'`) — noted as an inconsistency
## Dependency Injection
- `shared/di/post-dependencies.ts`
- `shared/di/tag-info-dependencies.ts`
- `shared/di/page-view-dependencies.ts`
## Error Handling
- Query layer: `try/catch` → `{ success: false, error: error as Error }`
- Repository adapter: `if (!result.success) return []` (or `null`, `{}`)
- Use case adapter: propagate `Result` or return fallback
- React hooks: `catch (error) { console.error('검색 중 오류 발생:', error) }`
- Custom error class: `shared/utils/rollback-error.ts` → `RollbackError extends Error` for DB transaction rollback signalling
## Logging
- `console.log(error)` — used in query catch blocks (infrastructure layer)
- `console.error('한국어 메시지:', error)` — used in presentation hooks
## Comments
## Function Design
## Module Design
- Named exports preferred for utility functions and factory functions
- Default exports used for React components
- Defined with `create<StateShape>()` and exported as a named hook
- State shape splits `// 초기 상태` from `// 액션들` via comments
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
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
- Every cross-layer boundary is defined by a TypeScript interface (port)
- Adapters implement ports; they are never imported directly across layer boundaries — only through the DI container
- Domain entities (`domain/entities/`) are plain TypeScript interfaces with no framework dependencies
- All infra calls return `Result<T>` (discriminated union `{ success: true; data }` | `{ success: false; error }`)
- The DI container is a module-level singleton stored on `global.__diContainer` to survive hot-reload
## Layers
- Purpose: Entities and pure business logic utilities
- Location: `domain/`
- Contains: TypeScript interfaces (`post.entity.ts`, `page-view.entity.ts`, …), pure functions (`post.utils.ts`, `tag-info.utils.ts`, …)
- Depends on: Nothing (no imports from other layers)
- Used by: `application/`, `infrastructure/`, `presentation/`
- Purpose: Orchestrates domain logic; owns caching strategy for aggregate data
- Location: `application/`
- Contains: Port interfaces (`application/port/*.ts`), use-case adapters (`application/use-cases/*.adapter.ts`), Next.js `unstable_cache` wrappers (`application/data-cache/`)
- Depends on: `domain/`, `presentation/ports/` (use-case port interfaces live in `presentation/ports/`)
- Used by: `infrastructure/` (indirect via DI), `presentation/`, `app/`
- Purpose: All I/O — Notion API, Supabase/Postgres via Drizzle
- Location: `infrastructure/`
- Contains:
- Depends on: `domain/`, `application/port/`, `shared/`
- Used by: `shared/di/` (injected into use cases)
- Purpose: Server-side page orchestration utilities, client hooks, Zustand stores, provider wrappers
- Location: `presentation/`
- Contains:
- Depends on: `domain/`, `application/`, `shared/di/`
- Used by: `app/`
- Purpose: DI container, shared types, utility functions, shadcn/ui components
- Location: `shared/`
- Contains:
- Depends on: `domain/`, `application/`, `infrastructure/`, `presentation/ports/`
- Used by: All layers
- Purpose: Route handlers, page components, API endpoints
- Location: `app/`
- Contains: Route groups `(main)`, `(blog)`, `(about)`, `api/`
- Depends on: `presentation/`, `shared/di/`
- Used by: Next.js runtime only
## Data Flow
### Blog Post Detail Page (Primary Notion Read Path)
### Main Page Post List Flow
### Image Proxy Flow
### Cache Invalidation Flow
- Server state: Next.js `unstable_cache` with tag-based invalidation (applied at query and data-cache layers)
- Client state: TanStack Query `useInfiniteQuery` for paginated post lists (`presentation/hooks/blog/use-fetch-post.ts`)
- UI state: Zustand stores for search query and selected tag filter (`presentation/stores/`)
## Key Abstractions
- Purpose: Discriminated union for all infrastructure return values — eliminates `try/catch` at use-case boundary
- Location: `shared/types/result.ts`
- Pattern: `{ success: true; data: T } | { success: false; error: Error; statusCode?: number }`
- Repository ports (`application/port/`) — implemented by infrastructure adapters
- Use-case ports (`presentation/ports/`) — implemented by application adapters, consumed by page utilities and hooks
- Pattern: `interface PostRepositoryPort` / `interface PostUseCasePort` with `readonly` methods
- Location: `shared/di/di-container.ts`
- Pattern: `getDiContainer()` checks `global.__diContainer`; returns or creates. Module-level `diContainer` constant for synchronous imports. Per-domain factories in `shared/di/*-dependencies.ts`
- Purpose: Bridges server-side Shiki highlighting and client-side rendering
- Pattern: Server computes `{ [blockId]: string }` (HTML), passes as prop to `NotionPageContent`, distributed via `HighlightedCodeContext` to `CustomCodeBlock` components
## Entry Points
- Location: `app/(blog)/blog/[id]/page.tsx`
- Triggers: Next.js RSC render (SSG pre-built by `generateStaticParams`, or ISR with `revalidate = 3600`)
- `SKIP_SSG_IDS` set exempts known problematic posts from static generation
- Location: `app/(main)/page.tsx`
- Triggers: Next.js RSC render; reads `tag` and `sort` from searchParams
- Location: `app/layout.tsx`
- Wraps all pages with: `TanstackProvider`, `ThemeProvider`, `SmoothScrollProvider`, `Toaster`
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
### Direct DB Call in Use-Case Adapter
### Webhook Stub
## Error Handling
- Infrastructure: `try/catch` → `{ success: false, error: error as Error }`
- Use case: `if (!result.success) return null` — no re-throw
- Page layer: `if (!result.properties) return` for metadata; top-level `try/catch` in `BlogPost` re-throws to trigger Next.js `error.tsx`
- `notFound()` is called from `presentation/utils/get-post-detail-page.ts` when use case returns `null`
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
