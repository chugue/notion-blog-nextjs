# Coding Conventions

**Analysis Date:** 2026-06-20

## Naming Patterns

**Files:**
- React components: PascalCase — `NotionPageContent.tsx`, `ThemeToggle.tsx`, `CustomCodeBlock.tsx`
- Hooks: `use-kebab-case.ts` — `use-fetch-post.ts`, `use-search-store.ts`, `use-scroll-direction.ts`
- Port interfaces: `kebab-case.port.ts` — `post-repository.port.ts`, `tag-info-usecase.port.ts`
- Adapter implementations: `kebab-case.adapter.ts` — `tag-info-repository.adapter.ts`, `post-usecase.adapter.ts`
- Queries: `kebab-case.query.ts` — `tag-filter-item.query.ts`, `post.query.ts`
- Entities: `kebab-case.entity.ts` — `post.entity.ts`, `site-metric.entity.ts`
- Stores (Zustand): `use-kebab-case.store.ts` — `use-search.store.ts`, `use-selected-tag.store.ts`

**Functions:**
- Factory functions: `create` prefix returning an interface — `createTagInfoRepositoryAdapter()`, `createPostUseCaseAdapter()`
- Hooks: `use` prefix — `useFetchPost`, `useSearchStore`, `useActiveHeading`
- Domain utils: verb + noun — `toTagFilterItem`, `sortByDate`, `filterByTag`, `filterBySearch`, `getPostMetadata`
- Event handlers (where present): `handle` prefix

**Variables:**
- camelCase throughout
- Boolean states: `is`/`has` prefix — `isOpen`, `isLoading`, `hasMore`
- Count values: `~Count` suffix — `count` field on `TagFilterItem`
- Result objects from queries: `result` (reused consistently)

**Types/Interfaces:**
- PascalCase for interfaces and types
- Interfaces preferred over `type` for object shapes — `PostMetadata`, `TagFilterItem`, `DiContainer`
- `type` used for discriminated unions — `Result<T, E>` in `shared/types/result.ts`
- Port interfaces always named `[Domain]RepositoryPort` or `[Domain]UsecasePort`

## Port/Adapter Architecture

**Pattern:** Every boundary crossing uses a port (interface) + adapter (implementation) pair.

```
application/port/post-repository.port.ts      ← interface
infrastructure/repositories/post.repository.adapter.ts  ← implements the port
```

**Port naming rule:** `[domain]-[repository|usecase].port.ts`
**Adapter naming rule:** `[domain]-[repository|usecase].adapter.ts`

**Factory pattern for adapters:** All adapters use factory functions, not classes:
```typescript
// infrastructure/repositories/tag-info-repository.adapter.ts
export const createTagInfoRepositoryAdapter = (
  postRepositoryPort: PostRepositoryPort
): TagInfoRepositoryPort => {
  return {
    getAllTags: async () => { ... },
    replaceAllTagFilterItems: async () => { ... },
  };
};
```

**Presentation ports** mirror use-case ports at the UI boundary:
- `presentation/ports/tag-info-usecase.port.ts` — `TagInfoUsecasePort`
- `presentation/ports/post-usecase.port.ts` — `PostUseCasePort`

## Result<T> Pattern

All infrastructure operations return `Result<T, E>`:

```typescript
// shared/types/result.ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | {
      success: false;
      error: E;
      statusCode?: number;
      message?: string;
    };
```

**Usage contract:**
- Queries (`*.query.ts`) always wrap async DB calls in try/catch and return `Result<T>`
- Repository adapters check `result.success` before using `result.data`
- Use case adapters unwrap or propagate the `Result` — they never throw up to the caller
- Failed results at use-case level return safe defaults (`[]`, `null`, `{}`)

```typescript
// Canonical pattern in use-case adapters:
const result = await postRepositoryPort.getAllPublishedPosts();
if (!result.success) return [];
return result.data;
```

## Code Style

**Formatting:**
- Tool: Prettier (`/.prettierrc`)
- Single quotes: `true`
- Tab width: 4 spaces
- Trailing commas: `es5`
- Print width: 100 characters
- Bracket spacing: `true`
- Arrow parens: `always`
- Plugin: `prettier-plugin-tailwindcss` (auto-sorts Tailwind class names)

**Linting:**
- Tool: ESLint flat config (`eslint.config.mjs`)
- Extends: `next/core-web-vitals`, `next/typescript`
- Disabled: `@typescript-eslint/no-unused-vars`, `react-hooks/exhaustive-deps`, `no-unused-vars`
- `eslint-config-prettier` included — Prettier rules win over ESLint formatting

**TypeScript:**
- Strict mode enabled (`tsconfig.json`: `"strict": true`)
- Path alias `@/*` maps to repo root
- No `noUnusedLocals` enforcement (compensated by disabled eslint rule)

## Import Organization

**Order (enforced by convention, not tooling):**
1. React and Next.js framework imports
2. Third-party packages
3. Internal imports using `@/` alias (domain → application → infrastructure → presentation → shared)
4. Relative imports for co-located files

**Path Aliases:**
- `@/` resolves to repo root (`tsconfig.json` paths)
- All cross-layer imports use `@/` — e.g., `import { Result } from '@/shared/types/result'`
- Integration test files use relative paths (e.g., `'../../../app/api/notion/route'`) — noted as an inconsistency

## Dependency Injection

DI is wired manually in `shared/di/`:

```typescript
// shared/di/di-container.ts
export const getDiContainer = (): DiContainer => {
  if (!global.__diContainer) {
    global.__diContainer = createDiContainer();
  }
  return global.__diContainer;
};
export const diContainer = getDiContainer();
```

Each feature domain has its own `*-dependencies.ts` file:
- `shared/di/post-dependencies.ts`
- `shared/di/tag-info-dependencies.ts`
- `shared/di/page-view-dependencies.ts`

## Error Handling

**Strategy:** Errors are caught at the query layer and converted to `Result<T, E>`. Use cases never throw; they return safe fallback values. Errors that escape (network failures in hooks) are logged with `console.error`.

**Patterns:**
- Query layer: `try/catch` → `{ success: false, error: error as Error }`
- Repository adapter: `if (!result.success) return []` (or `null`, `{}`)
- Use case adapter: propagate `Result` or return fallback
- React hooks: `catch (error) { console.error('검색 중 오류 발생:', error) }`
- Custom error class: `shared/utils/rollback-error.ts` → `RollbackError extends Error` for DB transaction rollback signalling

## Logging

**Approach:** `console.log` in infrastructure catch blocks, `console.error` in hooks. No structured logging library.

**Patterns:**
- `console.log(error)` — used in query catch blocks (infrastructure layer)
- `console.error('한국어 메시지:', error)` — used in presentation hooks

## Comments

**Language:** Korean for internal implementation comments and Korean for `it()` / `describe()` test description strings. English for JSDoc-style comments on exported interfaces.

**Examples:**
```typescript
// 1. 모든 PostMetadata 조회
// 2. tagInfo 형태로 변환
// 3. supabase로 업데이트
```
```typescript
// jest.config.js
transformIgnorePatterns: [
  '<rootDir>/node_modules/(?!notion-client|ky|gsap|...)/', // 👈 gsap 관련 모듈 추가 및 확장
],
```

**JSDoc/TSDoc:** Minimal — used only on a few port contract files.

## Function Design

**Size:** Small, single-responsibility. Use-case adapters are typically 3–8 lines per method.

**Parameters:** Dependency-injected via factory function parameters; method signatures are minimal.

**Return Values:** Always typed. Async functions return `Promise<Result<T>>` at infrastructure, `Promise<T | null>` or `Promise<T[]>` at use-case.

## Module Design

**Exports:**
- Named exports preferred for utility functions and factory functions
- Default exports used for React components

**Barrel Files:** Not used. Each file exports directly; consumers import by full path.

**Zustand stores:**
- Defined with `create<StateShape>()` and exported as a named hook
- State shape splits `// 초기 상태` from `// 액션들` via comments

---

*Convention analysis: 2026-06-20*
