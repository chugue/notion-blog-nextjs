# External Integrations

**Analysis Date:** 2026-06-20

## APIs & External Services

**Notion (Private/Unofficial API):**
- Service: Notion private API via `notion-client` (unofficial)
- SDK/Client: `notion-client 7.4.3` (exact pin, patched)
- Client instance: `notionAPI` in `infrastructure/database/external-api/notion-client.ts`
- Auth: Unauthenticated (calls `www.notion.so/api/v3` directly — no token required for public pages)
- Usage:
  - `notionAPI.getPage(pageId)` — fetches full `ExtendedRecordMap` for blog post rendering (`infrastructure/queries/post.query.ts:52`)
  - `notionAPI.getPage(blockId)` — fetches fresh signed URLs for Notion block images (`app/api/notion-block-image/route.ts:21`)
- Patch: `patches/notion-client+7.4.3.patch` replaces `ky` HTTP library with native `fetch`

**Notion (Official API):**
- Service: Notion public REST API
- SDK/Client: `@notionhq/client ^4.0.1`
- Client instance: `notion` (a `Client`) in `infrastructure/database/external-api/notion-client.ts`
- Auth: `NOTION_TOKEN` env var; API version `2022-06-28`
- Usage:
  - `notion.databases.query({ database_id: NOTION_DATABASE_ID })` — fetches published post list with filter/sort/pagination (`infrastructure/queries/post.query.ts:15`, `post.query.ts:92`)
  - `notion.pages.retrieve({ page_id: postId })` — fetches fresh cover image URL for OG image generation (`app/api/og-image/[postId]/route.ts:31`)
- Key env vars: `NOTION_TOKEN`, `NOTION_DATABASE_ID`

**Notion (Markdown Conversion):**
- Service: Notion content to Markdown
- SDK/Client: `notion-to-md ^3.1.9`; instance `n2m` in `infrastructure/database/external-api/notion-client.ts`
- Auth: Shares `notion` (`@notionhq/client`) instance

## Data Storage

**Databases:**
- Type/Provider: PostgreSQL via Supabase
  - Connection env var: `DATABASE_URL` (primary), fallback `SUPABASE_NEXT_PUBLIC_SUPABASE_URL`
  - ORM/Client: Drizzle ORM (`drizzle-orm ^0.44.5`) + `postgres ^3.4.7` driver
  - Drizzle client: `db` exported from `infrastructure/database/drizzle/drizzle.ts`
  - Schema location: `infrastructure/database/supabase/schema/`
  - Tables:
    - `page_views` — per-post view count and like count, keyed by `notion_page_id` (`infrastructure/database/supabase/schema/page-views.ts`)
    - `site_metrics` — daily total/daily visit counters (`infrastructure/database/supabase/schema/site-metircs.ts`)
    - `tag_filter_item` — tag filter cache (`infrastructure/database/supabase/schema/tag-filter-item.ts`)
    - `visitor_info` — visitor tracking (`infrastructure/database/supabase/schema/visitor-info.ts`)
  - Migrations: `infrastructure/database/supabase/migrations/` (managed by `drizzle-kit`)

**Supabase JS Client (browser/server):**
- Browser client: `createClient()` from `infrastructure/database/supabase/client.ts` — uses `createBrowserClient` from `@supabase/ssr`
- Server client: `createClient(cookieStore)` from `infrastructure/database/supabase/server.ts` — uses `createServerClient` from `@supabase/ssr`
- Auth env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**File Storage:**
- Notion S3 assets — images served via presigned S3 URLs (`prod-files-secure.s3.us-west-2.amazonaws.com`) proxied through custom API routes; no direct S3 SDK in use

**Caching:**
- Next.js `unstable_cache` — used for Notion page fetches and database queries (`infrastructure/queries/post.query.ts`)
- Cache tags: `post-{id}`, `all-posts`, `allPostMetadatas`, `getAllPublishedPostMetadatas`, `all-searchable-posts`, `mainPageDefault`, `getMainPageDataCache`, `image-proxy`
- ISR revalidation endpoints:
  - `GET /api/revalidate/[id]` — revalidates single post tag
  - `GET /api/revalidate/all` — revalidates all cache tags
  - `GET /api/revalidate/about` — revalidates about page

## Image Proxy Routes

Three separate API routes proxy images to work around Notion's S3 signed URL expiry and CORS restrictions:

- `GET /api/_image-proxy` (`app/api/_image-proxy/route.ts`) — General-purpose image proxy with SSRF protection (blocks AWS metadata IP `169.254.169.254`, private IP ranges in production). Caches responses `public, max-age=86400`. Accepts `?url=<encoded-url>`.

- `GET /api/notion-image` (`app/api/notion-image/route.ts`) — Proxies Notion page images. Handles GIF streaming separately (no-store cache). Non-GIF images cached `public, max-age=31536000, immutable`. Accepts `?url=<encoded-url>`.

- `GET /api/notion-block-image` (`app/api/notion-block-image/route.ts`) — Fetches fresh Notion signed URL for a specific block via `notionAPI.getPage(blockId)`, then proxies the image. Handles `signed_urls`, `format.display_source`, `properties.source`, and `bookmark_cover`. Non-GIF cached `public, max-age=3600`. Accepts `?blockId=<id>`.

- `GET /api/og-image/[postId]` (`app/api/og-image/[postId]/route.ts`) — Fetches cover image URL fresh from `notion.pages.retrieve`, then proxies it for Open Graph use. Cached `public, max-age=3600, stale-while-revalidate=86400`. Falls back to `/images/main-thumbnail.png`.

## Authentication & Identity

**Auth Provider:**
- None — this is a personal read-only blog. No user authentication flow.
- Supabase client is present but used for database access only (not auth sessions).

## Comments

**Provider:** Giscus (GitHub Discussions-based)
- React component: `app/(blog)/_components/GiscusComments.tsx`
- Package: `@giscus/react ^3.1.0`
- Configuration (hardcoded in component):
  - `repo`: `chugue/notion-blog-nextjs-giscus`
  - `repoId`: `R_kgDOPN-hOQ`
  - `categoryId`: `DIC_kwDOPN-hOc4CtEbo`
  - `mapping`: `specific` (uses `term` prop passed per post)
  - Language: `ko`
  - Theme: adapts to `next-themes` dark/light mode

## Monitoring & Observability

**Analytics:**
- Vercel Analytics (`@vercel/analytics ^1.5.0`) — injected via `<Analytics />` in `app/(main)/layout.tsx`

**Custom Site Metrics:**
- `GET /api/site-metrics` — returns 30-day visit data from `site_metrics` table
- `GET /api/cron` — Vercel cron job (daily at UTC 15:00 per `vercel.json`) that calls `batchUseCase.createTodayMetrics()` to snapshot daily visitor counts

**Error Tracking:**
- None detected (no Sentry, Datadog, or similar)

**Logs:**
- `console.log` / `console.error` / `console.warn` used throughout API routes

## Page View Tracking

- `POST /api/page-view/blog/[id]` (`app/api/page-view/blog/[id]/route.ts`) — increments view count for a specific blog post
- `POST /api/page-view/main` (`app/api/page-view/main/route.ts`) — increments main page visit count
- Stored in `page_views` and `visitor_info` tables in Supabase (via Drizzle ORM)

## Open Graph Scraping

- `GET /api/open-graph` (`app/api/open-graph/route.ts`) — scrapes OG metadata from external URLs using `open-graph-scraper ^6.10.0` (used for Notion bookmark block previews). Accepts `?url=<url>`. Image URLs short-circuit and return immediately.

## Webhooks

**Incoming — Notion Webhook:**
- `POST /api/notion/webhook` (`app/api/notion/webhook/route.ts`) — stub (logs body, no processing yet)
- `POST /api/sidebar` (`app/api/sidebar/route.ts`) — receives Notion webhook payloads; verifies HMAC-SHA256 signature against `NOTION_WEBHOOK_SECERT_TOKEN` env var using `timingSafeEqual`; on valid payload calls `tagInfoUseCase.updateAllTagCount()`

**Outgoing:**
- None detected

## CI/CD & Deployment

**Hosting:**
- Vercel (production URL: `notion-blog-nextjs-brown.vercel.app`)
- `vercel.json` defines daily cron at `/api/cron`

**CI Pipeline:**
- GitHub Actions workflow present at `.github/workflows/` — currently configured as a "Publish Packages to GitHub Package Registry" pipeline (placeholder `yourusername`; appears to be a template not yet activated for this repo)

## Environment Configuration

**Required env vars:**
- `NOTION_TOKEN` — Notion official API integration token
- `NOTION_DATABASE_ID` — Notion database ID for blog posts
- `NOTION_WEBHOOK_SECERT_TOKEN` — HMAC secret for Notion webhook signature verification
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (public, browser-safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (public, browser-safe)
- `DATABASE_URL` — Direct PostgreSQL connection string for Drizzle ORM
- `NEXT_PUBLIC_BASE_URL` — Production base URL (used in sitemap and metadata)

**Secrets location:**
- `.env` (present at project root — never read; note existence only)
- `.env.local` (used by drizzle-kit per `drizzle.config.ts`)

---

*Integration audit: 2026-06-20*
