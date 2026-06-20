# Technology Stack

**Analysis Date:** 2026-06-20

## Languages

**Primary:**
- TypeScript 5.x (strict mode) - All application code in `app/`, `infrastructure/`, `domain/`, `shared/`, `presentation/`, `components/`

**Secondary:**
- MDX - `app/mdx-page/page.mdx` (page extension declared in `next.config.ts`)

## Runtime

**Environment:**
- Node.js 22.22.3 (detected via `node --version`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js `^16.0.7` - App Router, SSR/SSG, API Routes, ISR via `unstable_cache` + `revalidateTag`
- React `^19.0.0` - UI rendering
- React DOM `^19.0.0` - DOM binding

**Styling:**
- Tailwind CSS `^4.0.0` - Utility-first CSS (PostCSS plugin via `@tailwindcss/postcss ^4.0.0`)
- `@tailwindcss/typography ^0.5.16` - Prose styling for blog content
- `tw-animate-css ^1.3.5` - Animation utilities
- `class-variance-authority ^0.7.1` - Component variant system
- `clsx ^2.1.1` - Conditional classnames
- `tailwind-merge ^3.3.1` - Tailwind class merging

**UI Component Library:**
- Radix UI (full primitive set: accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, navigation-menu, popover, select, tabs, tooltip, etc.) - Accessible unstyled primitives
- `cmdk ^1.1.1` - Command palette
- `sonner ^2.0.6` - Toast notifications
- `vaul ^1.1.2` - Drawer component
- `lucide-react ^0.525.0` - Icon set
- `recharts ^2.15.4` - Charts (site metrics dashboard)
- `embla-carousel-react ^8.6.0` - Carousel
- `react-resizable-panels ^3.0.3` - Resizable panel layouts
- `react-day-picker ^9.8.0` - Date picker

**Animation:**
- `framer-motion ^12.23.26` - UI animations
- `gsap ^3.13.0` + `@gsap/react ^2.1.2` - GSAP animations (used in `CustomCodeBlock.tsx`, `ScrollTrigger`)
- `lenis ^1.3.15` - Smooth scroll
- `locomotive-scroll ^4.1.4` - Scroll engine

**State Management:**
- `zustand ^5.0.6` - Global client state
- `@tanstack/react-query ^5.83.0` - Server state / async data fetching
- `@tanstack/react-query-devtools ^5.83.0` - Dev tooling

**Forms:**
- `react-hook-form ^7.60.0` - Form management
- `@hookform/resolvers ^5.1.1` - Form validation resolvers
- `zod ^4.0.5` - Schema validation

**Testing:**
- `jest ^30.0.5` - Test runner (ESM mode via `NODE_OPTIONS='--experimental-vm-modules'`)
- `jest-environment-jsdom ^30.0.5` - JSDOM environment
- `@testing-library/react ^14.3.1` - React component testing
- `@testing-library/jest-dom ^6.6.4` - DOM matchers
- `@testing-library/user-event ^14.6.1` - User interaction simulation
- `msw ^2.10.4` - Mock Service Worker for API mocking
- `supertest ^7.1.4` - HTTP integration testing
- `@playwright/test ^1.54.1` - E2E testing
- Config: `jest.config.js`, `jest.setup.cjs`, `jest.setup.js`

**Build/Dev:**
- Turbopack - Available via `npm run dev:turbopack` (`next dev --turbopack`); `turbopack: {}` declared in `next.config.ts`
- `eslint ^9` + `eslint-config-next 15.2.5` + `eslint-config-prettier ^10.1.5` - Linting
- `prettier ^3.6.2` + `prettier-plugin-tailwindcss ^0.6.14` - Formatting
- `patch-package ^8.0.0` - Applied via `postinstall` hook to patch pinned notion packages
- `drizzle-kit ^0.31.4` - Database schema migrations CLI

## Key Dependencies

**Notion Rendering (pinned, no `^`):**
- `react-notion-x 7.4.3` - Notion page renderer (exact pin); patched via `patches/react-notion-x+7.4.3.patch`
- `notion-client 7.4.3` - Unofficial Notion private API client (exact pin); patched via `patches/notion-client+7.4.3.patch` to replace `ky` with native `fetch`
- `notion-utils 7.4.3` - Notion block utility functions (exact pin); patched via `patches/notion-utils+7.4.3.patch`
- `notion-types 7.4.3` - TypeScript types for Notion blocks (exact pin)
- `notion-to-md ^3.1.9` - Convert Notion blocks to Markdown

**Notion Official API:**
- `@notionhq/client ^4.0.1` - Official Notion SDK for `databases.query` and `pages.retrieve`

**Syntax Highlighting:**
- `shiki ^3.10.0` - Server-side code highlighting (theme: `catppuccin-mocha`; singleton via `globalThis` in `presentation/utils/highlight-code-blocks.ts`)
- `react-shiki ^0.7.3` - React wrapper for shiki
- `react-notion-x-code-block ^0.4.1` - Code block component for react-notion-x
- `react-syntax-highlighter ^15.6.1` - Fallback highlighter
- `prismjs ^1.30.0` - Prism highlighter
- `@rehype-pretty/transformers ^0.13.2` - Rehype code transformers
- `katex ^0.16.22` - LaTeX math rendering

**Database / ORM:**
- `drizzle-orm ^0.44.5` - Type-safe ORM
- `postgres ^3.4.7` - PostgreSQL driver
- `@supabase/supabase-js ^2.55.0` - Supabase JS client
- `@supabase/ssr ^0.6.1` - Supabase SSR client (browser + server variants)

**Infrastructure:**
- `@vercel/analytics ^1.5.0` - Vercel Analytics (injected in `app/(main)/layout.tsx`)
- `@giscus/react ^3.1.0` - GitHub Discussions-based comments
- `open-graph-scraper ^6.10.0` - OG metadata scraping for bookmark embeds
- `date-fns ^4.1.0` - Date utilities
- `farmhash ^4.0.2` - Fast hashing
- `node-cron ^4.2.1` - Cron scheduling
- `@stefanprobst/rehype-extract-toc ^3.0.0` - TOC extraction from rehype

## Configuration

**TypeScript:**
- Config: `tsconfig.json`
- Target: `ES2017`
- Strict mode enabled
- Path alias: `@/*` maps to project root `./*`
- Module resolution: `bundler`

**Next.js:**
- Config: `next.config.ts`
- `reactStrictMode: true`
- `poweredByHeader: false`
- `turbopack: {}` (Turbopack enabled)
- Image remote patterns: `picsum.photos`, `images.unsplash.com`, `prod-files-secure.s3.us-west-2.amazonaws.com`, `www.notion.so`, `notion-blog-nextjs-brown.vercel.app`
- `_next/image` assets cached `public, max-age=86400`

**Database:**
- Config: `drizzle.config.ts`
- Dialect: `postgresql`
- Schema: `./infrastructure/database/supabase/schema/*`
- Migrations output: `./infrastructure/database/supabase/migrations`
- Credentials from: `.env.local`

**Environment:**
- `.env` present (never read; note existence only)
- `.env.local` used by drizzle-kit

**PostCSS:**
- Config: `postcss.config.mjs` (Tailwind CSS v4 PostCSS plugin)

## Platform Requirements

**Development:**
- Node.js 22.x
- npm
- `npm run dev` (default Webpack) or `npm run dev:turbopack` (Turbopack)

**Production:**
- Deployment target: Vercel (`vercel.json` present with cron config)
- Hosted at: `notion-blog-nextjs-brown.vercel.app`
- Vercel cron: `GET /api/cron` runs daily at `0 15 * * *` (UTC 15:00)

---

*Stack analysis: 2026-06-20*
