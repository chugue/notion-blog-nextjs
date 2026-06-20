# Phase 01: Build Recovery - Pattern Map

**Mapped:** 2026-06-20
**Files analyzed:** 6 (1 new, 5 modified)
**Analogs found:** 6 / 6 (all in-repo)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `infrastructure/database/external-api/normalize-record-map.ts` (NEW) | utility (pure infra transform) | transform | `domain/utils/post.utils.ts` (`getPostMetadata`, `getCoverImage`) | role-match (pure Notion-shape transform) |
| `infrastructure/database/external-api/notion-client.ts` (MODIFY) | config / external-api factory | request-response | self (existing `notionAPI` export block) | exact (extend in place) |
| `infrastructure/queries/post.query.ts` (MODIFY, ~48-60) | query (cache wrapper) | CRUD / request-response | self (`getPostByIdQuery` already wraps `unstable_cache`) | exact |
| `app/api/notion-block-image/route.ts` (MODIFY, ~20) | route handler | request-response | self + `app/api/notion/page/route.ts` | exact (one-line swap) |
| `app/api/notion/page/route.ts` (MODIFY, ~26) | route handler | request-response | self | exact (one-line swap) |
| `app/(blog)/blog/[id]/page.tsx` (MODIFY, ~20-33) | route / page (SSG) | request-response | self (`SKIP_SSG_IDS` + `generateStaticParams`) | exact (empty the set) |

---

## Pattern Assignments

### `infrastructure/database/external-api/normalize-record-map.ts` (NEW — utility, transform)

**Analog:** `domain/utils/post.utils.ts` — closest in-repo example of a **pure, named, exported transform over Notion-typed data** (no `Result<T>` wrap, no I/O, framework-free). Use it for the *shape* (named const tables array, single exported function, early `continue`/guard style). Use the **report §2 sketch** for the exact algorithm — it is already locked (D-01, D-02).

**Import/type convention to copy** — the rest of the codebase imports the recordMap type from `notion-types`. Match the neighbors, not a new alias:

```typescript
// presentation/utils/highlight-code-blocks.ts:1  AND  app/api/notion/page/route.ts:4
import { ExtendedRecordMap } from 'notion-types';
```

(Note: `post.query.ts:5` uses `import * as notionType from 'notion-types'` then `notionType.ExtendedRecordMap`. Both styles exist; the named import is cleaner for a new file — prefer it.)

**Pure-transform shape to copy** (from `domain/utils/post.utils.ts` — named exported fn, guard-and-continue, no `Result`):
```typescript
// post.utils.ts:78-81 — guard-first, returns the value directly, no try/catch on pure logic
export const filterByTag = (posts: PostMetadata[], tag: string): PostMetadata[] => {
  if (tag === 'all') return posts;
  return posts.filter((post) => post.tag.includes(tag));
};
```

**Core algorithm (locked — copy from report §2 방안 A, lines 107-124 of the diagnosis doc):**
```typescript
const RECORD_TABLES = ['block', 'collection', 'collection_view', 'notion_user'] as const;

export function normalizeRecordMap(recordMap: ExtendedRecordMap): ExtendedRecordMap {
  for (const table of RECORD_TABLES) {
    const records = recordMap[table] as
      Record<string, { value?: { value?: unknown; role?: string } }> | undefined;
    if (!records) continue;

    for (const id of Object.keys(records)) {
      const nested = records[id]?.value;
      if (nested && typeof nested === 'object' && 'value' in nested) {
        records[id] = { role: nested.role, value: nested.value } as never;
      }
    }
  }
  return recordMap;
}
```

**Non-negotiable constraints (from CONTEXT D-01/D-02 + report §4):**
- **Idempotent**: unwrap ONLY when `'value' in nested` is true. Never touch already-flat records (protects old `.next/cache` hits and future format recovery).
- **`discussion` table is EXCLUDED** from `RECORD_TABLES` — its `value` is `{ role }` only (no nested `value`); normalizing it corrupts shape.
- No `Result<T>` wrapper — this is a pure infra transform, not an I/O boundary (CONTEXT "Established Patterns").

**Readability (project CLAUDE.md — Korean gestalt principles):** blank line between the guard (`if (!records) continue;`) and the inner loop; declare `nested` immediately before its use. Keep `RECORD_TABLES` at module top (widest scope → fully descriptive `SCREAMING_SNAKE`).

**Indentation note:** neighbor infra files (`notion-client.ts`, `post.query.ts`) use **2-space** indent (not the repo-wide 4-space Prettier default). Match the 2-space neighbors so the new file is visually consistent with its directory; let Prettier reconcile on save.

---

### `infrastructure/database/external-api/notion-client.ts` (MODIFY — add `getNotionPage`)

**Analog:** the file itself. Current full content (13 lines) — add the helper, do not restructure existing exports (CONTEXT D-03: helper lives *beside* `notionAPI`, does not shadow it).

**Existing export style to extend** (lines 1-12):
```typescript
import { Client } from '@notionhq/client';
import { NotionAPI } from 'notion-client';
import { NotionToMarkdown } from 'notion-to-md';

export const notion = new Client({ /* ... */ });
export const notionAPI = new NotionAPI();
export const n2m = new NotionToMarkdown({ notionClient: notion });
```

**Pattern to add** — a named `async function` (or `export const`) that composes `getPage` + `normalizeRecordMap`, the single infra entry point all 3 callers use:
```typescript
import { ExtendedRecordMap } from 'notion-types';
import { normalizeRecordMap } from './normalize-record-map';

export async function getNotionPage(id: string): Promise<ExtendedRecordMap> {
  const recordMap = await notionAPI.getPage(id);
  return normalizeRecordMap(recordMap);
}
```
- Relative import (`./normalize-record-map`) — both files are in the same `external-api/` dir; matches existing relative usage (`post.query.ts:6` imports this file via relative `../database/external-api/notion-client`).
- `notionAPI` stays exported (deferred defensive shadowing — CONTEXT "Deferred Ideas").
- Keep 2-space indent to match the file.

---

### `infrastructure/queries/post.query.ts` (MODIFY ~48-60 — normalize cache return)

**Analog:** `getPostByIdQuery` itself (lines 48-80). Do NOT change the `unstable_cache` keys/tags. The ONLY change is **where** normalize is applied: on the `cachedFn()` **result**, not inside the cached function (CONTEXT D-04 — a cache HIT on stale double-wrapped data must also be normalized; idempotency makes the double-apply harmless).

**Current pattern** (lines 50-71):
```typescript
const cachedFn = unstable_cache(
  async () => {
    return await notionAPI.getPage(id);   // ← leave the cached fn calling getPage
  },
  [`post-${id}`],
  { tags: [`post-${id}`, `all-posts`] }
);

const result = await cachedFn();

if (!result) {
  return { success: false, error: new Error('Post not found') };
}

return {
  success: true,
  data: result as unknown as notionType.ExtendedRecordMap,   // ← normalize HERE
};
```

**Change to make:** apply `normalizeRecordMap()` to `result` after the `!result` guard, before/at the success return — e.g. `data: normalizeRecordMap(result as unknown as notionType.ExtendedRecordMap)`.
- Import: `import { normalizeRecordMap } from '../database/external-api/notion-client';` is NOT where it lives — import from `'../database/external-api/normalize-record-map'` (relative, matches the existing `'../database/external-api/notion-client'` import on line 6).
- Keep the existing `Result<T>` wrapping — this is the use-case/query boundary where `Result` IS expected (`shared/types/result.ts`).
- Do NOT switch the cached fn to `getNotionPage` here: D-04 deliberately normalizes the *return value* so stale cache hits are covered. (Normalizing inside too would also work via idempotency, but the locked decision is normalize-on-return.)
- Do NOT add `revalidateTag` / key-bumping (CONTEXT D-05).

---

### `app/api/notion-block-image/route.ts` (MODIFY ~20 — swap to `getNotionPage`)

**Analog:** the file itself + the twin route below. Single-line swap.

**Current** (lines 1, 20):
```typescript
import { notionAPI } from '@/infrastructure/database/external-api/notion-client';
// ...
const recordMap = await notionAPI.getPage(blockId);
const block = recordMap.block[blockId]?.value;   // ← .type/.format read; currently undefined
```

**Change:** import `getNotionPage` (same module path, `@/infrastructure/database/external-api/notion-client`) and replace `await notionAPI.getPage(blockId)` → `await getNotionPage(blockId)`. After normalization `recordMap.block[blockId]?.value` is the flat block, so `block.type === 'image'` (line 37) and `block.format` (line 39) resolve correctly (CONTEXT D-07, ROADMAP criterion #3).
- Nothing else changes — error handling (`try/catch` → `NextResponse.json(..., { status: 500 })`, lines 111-114) and the `if (!block)` 404 guard stay as-is.
- This file uses **4-space** indent — keep it.

---

### `app/api/notion/page/route.ts` (MODIFY ~26 — swap to `getNotionPage`)

**Analog:** the file itself. Single-line swap; cleanest route in the set (CORS + `Result<ExtendedRecordMap>` envelope).

**Current** (lines 1, 26):
```typescript
import { notionAPI } from '@/infrastructure/database/external-api/notion-client';
// ...
const result = await notionAPI.getPage(pageId);
```

**Change:** import `getNotionPage` from the same module, replace `notionAPI.getPage(pageId)` → `getNotionPage(pageId)`. The client now receives flat `{ role, value }` records (CONTEXT D-07, ROADMAP criterion #4).
- Keep the `Result`-envelope return shape (`{ success: true, data: result }`), CORS headers, and the `!result` 404 / `catch` 500 branches untouched — this route's `Result<ExtendedRecordMap>` return type is already correct.
- 2-space indent in this file — keep it.

---

### `app/(blog)/blog/[id]/page.tsx` (MODIFY ~20-33 — empty `SKIP_SSG_IDS`)

**Analog:** the file itself.

**Current** (lines 20-33):
```typescript
/** 빌드 시 정적 생성에서 에러를 유발하는 포스트 ID 목록 (런타임에 동적 렌더링) */
const SKIP_SSG_IDS = new Set([
    '2c39c76c-6cb4-80f0-a79e-e935e2bed857',
    '2c59c76c-6cb4-803e-95eb-f0fe5d659685',
]);

export async function generateStaticParams() {
    const postUseCase = diContainer.post.postUseCase;
    const result = await postUseCase.getAllPublishedPostMetadatas();

    return result
        .filter((post) => !SKIP_SSG_IDS.has(post.id))
        .map((post) => ({ id: post.id }));
}
```

**Change (CONTEXT D-06):** empty the set — `const SKIP_SSG_IDS = new Set([]);` (or `new Set<string>()`). Leave the constant declaration AND the `.filter(...)` call **structurally in place** (deleting the dead constant/filter is Phase 3 / RENDER-01, not Phase 1). Every published post now flows through `generateStaticParams` → satisfies ROADMAP Phase 1 criterion #2.
- Do NOT remove the `.filter()` line, the JSDoc comment, or change `generateStaticParams` logic.
- 4-space indent in this file — keep it.

---

## Shared Patterns

### Single normalization entry point (the core cross-cutting pattern)
**Source (new):** `infrastructure/database/external-api/notion-client.ts` → `getNotionPage(id)`
**Apply to:** all 3 unofficial-API callers — `post.query.ts` (via normalize-on-return, D-04), `api/notion-block-image/route.ts`, `api/notion/page/route.ts`.
The unofficial `notionAPI` path is the ONLY one needing normalization; the official `notion` (`@notionhq/client`) client is untouched (CONTEXT "Two Notion clients"; CLAUDE.md architectural constraint).

### `notion-types` import convention
**Source:** `presentation/utils/highlight-code-blocks.ts:1`, `app/api/notion/page/route.ts:4`
```typescript
import { ExtendedRecordMap } from 'notion-types';
```
**Apply to:** the new normalizer + the `getNotionPage` helper signature.

### Relative imports within `infrastructure/database/external-api/`
**Source:** `post.query.ts:6` → `from '../database/external-api/notion-client'`
**Apply to:** `notion-client.ts` importing the new `./normalize-record-map`, and `post.query.ts` importing `../database/external-api/normalize-record-map`. (App-router files keep using `@/infrastructure/...` absolute alias — `route.ts` files already do.)

### Pure transform = no `Result<T>` wrap
**Source:** `domain/utils/post.utils.ts` (all exports return data directly; only the `convertS3UrlToNotionUrl` URL-parse has a defensive try/catch).
**Apply to:** `normalizeRecordMap` — pure, no `Result`, no try/catch (the I/O `getPage` call and its `Result` wrapping already live one layer out in `post.query.ts`).

### Korean gestalt readability (project + global CLAUDE.md)
**Apply to:** all touched files — blank line between guard / loop / return units; declare vars immediately before use; `is`/`has` boolean prefixes; `SCREAMING_SNAKE` for module-scope constants (`RECORD_TABLES`).

---

## No Analog Found

None. Every file has an in-repo analog (mostly the file itself); the normalizer's algorithm is pre-specified in the diagnosis report §2.

## Out-of-Scope Note (do NOT touch in Phase 1)
- `app/api/og-image/[postId]/route.ts` and `infrastructure/repositories/post.repository.adapter.ts` use the **official** `notion.pages.retrieve` (not the unofficial `notionAPI.getPage`) — they return a different shape and are unaffected by the double-wrapping bug. Leave them alone.

## Metadata

**Analog search scope:** `infrastructure/database/external-api/`, `infrastructure/queries/`, `domain/utils/`, `presentation/utils/`, `app/api/`, `app/(blog)/blog/[id]/`
**Files scanned:** 7 read (6 in-scope + `post.utils.ts`, `highlight-code-blocks.ts`, `result.ts`); `notionAPI` call-site grep confirmed exactly 3 consumers
**Pattern extraction date:** 2026-06-20
