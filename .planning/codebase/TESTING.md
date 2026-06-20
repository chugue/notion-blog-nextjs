# Testing Patterns

**Analysis Date:** 2026-06-20

## Test Framework

**Runner:**
- Jest 30 (`jest` ^30.0.5) via `next/jest` wrapper
- Config: `jest.config.js` (uses `createJestConfig` from `next/jest`)
- ESM support: `NODE_OPTIONS='--experimental-vm-modules'` is required (all test scripts set this)

**Assertion Library:**
- Jest built-in matchers
- `@testing-library/jest-dom` ^6.6.4 (extended DOM matchers like `toBeInTheDocument`, `toHaveTextContent`)

**Component Testing:**
- `@testing-library/react` ^14.3.1
- `@testing-library/user-event` ^14.6.1

**Hook Testing:**
- `renderHook` from `@testing-library/react`

**E2E:**
- `@playwright/test` ^1.54.1 is installed but no Playwright test files were found — not in active use.

**API Integration:**
- `supertest` ^7.1.4 is installed but tests call route handlers directly rather than via HTTP.

**MSW:**
- `msw` ^2.10.4 is installed but no MSW handlers were found in test files — not in active use.

**Note on mixed framework:** One file (`__tests__/infrastructure/queries/tag-filter-item.query.test.ts`) imports from `vitest` (`import { describe, expect, it, vi } from 'vitest'`). All other files use Jest globals. This file will fail under Jest's runner — treat it as a stale/migrated artifact.

**Run Commands:**
```bash
npm test                  # Run all tests (experimental-vm-modules)
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
npm run test:ci           # CI mode: --ci --coverage --watchAll=false
```

## Test File Organization

**Location:** All tests live under `__tests__/` at the repo root. Tests mirror the source directory structure.

**Test–source mapping:**
```
__tests__/
├── app/
│   ├── (blog)/_components/    # Component tests for app/(blog)/_components/
│   └── api/                   # Route handler tests for app/api/
├── application/
│   └── use-cases/             # Use-case adapter tests
├── domain/
│   └── utils/                 # Pure util function tests
├── infrastructure/
│   ├── queries/               # Query function tests
│   └── repositories/          # Repository adapter tests
├── integration/               # Cross-layer integration tests
├── presentation/
│   ├── ports/                 # Port contract tests
│   └── stores/                # Zustand store tests
├── shared/
│   ├── components/            # Shared component tests
│   ├── di-mock.ts             # Shared DI mock (NOT a test file)
│   └── utils/                 # Shared util tests
└── utils/
    └── test-utils.tsx         # Custom render wrapper + factory helpers
```

**Naming:**
- Unit tests: `[source-filename].test.ts` or `.test.tsx`
- Integration tests: `[description]-integration.test.ts(x)`
- No `.spec.` suffix is used anywhere

## Test Structure

**Suite Organization:**

Top-level `describe` names the architectural layer + module:
```typescript
describe('Domain Utils - Post Utils', () => { ... })
describe('Infrastructure Repositories - TagInfo Repository Adapter', () => { ... })
describe('Application Use Cases - TagInfo UseCase Adapter', () => { ... })
describe('Presentation Stores - useSearchStore', () => { ... })
describe('Presentation Ports - TagInfoUsecasePort Contract', () => { ... })
describe('API Routes - Tag Info Reset', () => { ... })
```

Inner `describe` groups by method or behavior:
```typescript
describe('getAllTags', () => {
  it('저장소에서 모든 태그를 가져와야 한다', async () => { ... })
  it('저장소에서 에러가 발생하면 에러를 전파해야 한다', async () => { ... })
})
```

**Test description language:** Korean. All `it()` and inner `describe()` strings are written in Korean. Top-level `describe()` uses English for the layer prefix and Korean or English for the module name.

**AAA pattern (Given/When/Then):** Used consistently in unit and use-case tests:
```typescript
it('태그 정보 목록을 성공적으로 리셋해야 한다', async () => {
  // Given
  const inputTagFilterItems: TagFilterItem[] = [ ... ];
  mockTagInfoRepositoryPort.resetTagInfoList.mockResolvedValue(expectedTags);

  // When
  const result = await tagInfoUseCase.resetTagInfoList(inputTags);

  // Then
  expect(mockTagInfoRepositoryPort.resetTagInfoList).toHaveBeenCalledWith(inputTags);
  expect(result).toEqual(expectedTags);
});
```

Integration tests use Arrange/Assert without explicit comments.

**Patterns:**
- `beforeEach`: reset mocks (`jest.clearAllMocks()`) and reinitialize adapter/usecase under test
- `beforeAll`: used sparingly for heavier setup (e.g., direct `diContainer` mutation in route tests)
- `afterEach`: not commonly used; teardown is handled by `clearAllMocks`

## Mocking

**Framework:** Jest (`jest.mock`, `jest.fn()`, `jest.Mocked<T>`, `jest.MockedFunction<T>`)

**Module-level mocking (top of file):**
```typescript
jest.mock('@/infrastructure/queries/tag-info.query');
jest.mock('@/domain/utils/tag-info.utils');
```

**Typed mock ports (preferred pattern):**
```typescript
const mockTagInfoRepositoryPort: jest.Mocked<TagInfoRepositoryPort> = {
  getAllTags: jest.fn(),
  resetTagInfoList: jest.fn(),
};
```

**Mocking query objects:**
```typescript
const mockTagInfoQuery = tagInfoQuery as jest.Mocked<typeof tagInfoQuery>;
mockTagInfoQuery.getAllTags = jest.fn();
mockTagInfoQuery.getAllTags.mockResolvedValue({ success: true, data: [] });
```

**DI container mutation (route handler tests):**
```typescript
// __tests__/app/api/site-metrics/route.test.ts
diContainer.siteMetric = {
  siteMetricUsecase: { getThirtyDaysSiteMetrics: mockGetThirtyDaysSiteMetrics },
} as any;
```

**Shared DI mock:** `__tests__/shared/di-mock.ts` provides `mockDiContainer`, `mockPostUseCase`, `mockTagInfoUseCase`, and a `resetAllMocks()` helper. Import and use for integration tests that exercise API routes.

**Global mocks (in `jest.setup.js`):**

| Target | Mock approach |
|---|---|
| `next/navigation` | `jest.mock(...)` — stubs `useRouter`, `useSearchParams`, `usePathname` |
| `next/image` | `jest.mock(...)` — renders plain `<img>` |
| `next/server` | `jest.mock(...)` — stubs `NextResponse.json` and `NextRequest` |
| `next/cache` | `jest.mock(...)` — `unstable_cache` returns the raw function; `revalidateTag` is a jest.fn() |
| `gsap` | `jest.mock(...)` — stubs `gsap.to`, `gsap.timeline`, `ScrollTrigger.create` |
| `global.fetch` | `global.fetch = jest.fn()` |
| `window.matchMedia` | `Object.defineProperty(window, 'matchMedia', ...)` |
| `crypto.subtle` | polyfill mock using SHA-256 simulation |
| `TextEncoder/TextDecoder` | polyfilled from Node `util` |
| `Request/Response/Headers` | class stubs added to `global` |

**Notion mock:**
```typescript
// In component tests — jest.mock per test file:
jest.mock('react-notion-x', () => ({
  NotionRenderer: ({ recordMap, components }) => (
    <div data-testid="notion-renderer">
      <div data-testid="record-map">{JSON.stringify(recordMap)}</div>
      <div data-testid="components">{Object.keys(components).join(',')}</div>
    </div>
  ),
}));
```

**Supabase/Drizzle mock:**
```typescript
// In query tests — mocked at the db client level:
vi.mock('@/infrastructure/database/drizzle/drizzle', () => ({
  db: {
    delete: vi.fn().mockReturnValue({ execute: vi.fn().mockResolvedValue(undefined) }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({ execute: vi.fn().mockResolvedValue(undefined) }),
    }),
  },
}));
```

**What to mock:**
- External services (Notion API, Supabase/Drizzle DB)
- Next.js runtime APIs (`next/navigation`, `next/server`, `next/cache`)
- Animation libraries (`gsap`)
- Port interfaces when testing adapters above them

**What NOT to mock:**
- Domain utility functions (`domain/utils/`) — test them directly
- `shared/types/` and entity interfaces
- The adapter/use-case under test itself

## Fixtures and Factories

**Test Data (in `__tests__/utils/test-utils.tsx`):**
```typescript
export const createMockPost = (overrides = {}) => ({
  id: '1',
  title: 'Test Post',
  author: 'Test Author',
  date: '2024-01-01',
  tag: ['React'],
  ...overrides,
});

export const createMockTagFilterItem = (overrides = {}) => ({
  id: 'test',
  name: 'Test Tag',
  count: 1,
  ...overrides,
});

export const waitForNextTick = () => new Promise((resolve) => setTimeout(resolve, 0));
```

**Inline fixtures:** Most test files define `const mock*` objects inline at the top of the `describe` or `it` block. The factory functions above are available but underused in practice.

**Location:**
- Factories: `__tests__/utils/test-utils.tsx`
- Shared DI mocks: `__tests__/shared/di-mock.ts`

## Custom Render

The `render` export from `__tests__/utils/test-utils.tsx` wraps components with required providers:

```typescript
const AllTheProviders = ({ children }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export const customRender = (ui, options?) => render(ui, { wrapper: AllTheProviders, ...options });
export * from '@testing-library/react';
export { customRender as render };
```

Use this `render` (not the one from `@testing-library/react` directly) when rendering any component that uses TanStack Query or `next-themes`.

## Coverage

**Requirements:**
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

**Collected from:**
- All `**/*.{js,jsx,ts,tsx}` files
- Excluding: `*.d.ts`, `node_modules`, `.next`, `coverage`, `*.config.*`

**View Coverage:**
```bash
npm run test:coverage
```

## Test Types

**Unit Tests** (`domain/`, `application/`, `infrastructure/`, `presentation/stores/`, `shared/`):
- Scope: Single function or adapter method in isolation
- Pattern: Mock all dependencies at port boundaries, verify behavior through `expect` on outputs and mock call counts

**Integration Tests** (`__tests__/integration/`):
- Scope: Multiple layers working together — typically API route + use case + DI container
- Files: `api-integration.test.ts`, `blog-post-integration.test.tsx`, `simple-integration.test.tsx`, `user-scenario-integration.test.tsx`
- Pattern: Replace `diContainer` entries with mock use cases; call the real route handler; assert on `NextResponse.json` mock calls

**Component Tests** (`app/(blog)/_components/`, `shared/components/`):
- Scope: React component rendering and interaction
- Pattern: Mock external libraries (react-notion-x, next/image, next/link); use `render` + `screen` queries; `fireEvent` for interaction

**Port Contract Tests** (`presentation/ports/`):
- Scope: Verify that port interface shape is correct (TypeScript + runtime method existence)
- Pattern: Create minimal mock implementations; call methods; assert on return types and shapes

## Common Patterns

**Async Testing:**
```typescript
it('저장소에서 에러가 발생하면 에러를 전파해야 한다', async () => {
  const error = new Error('Repository error');
  mockTagInfoRepositoryPort.getAllTags.mockRejectedValue(error);

  await expect(tagInfoUseCase.getAllTags()).rejects.toThrow('Repository error');
  expect(mockTagInfoRepositoryPort.getAllTags).toHaveBeenCalledTimes(1);
});
```

**Result<T> success/failure testing:**
```typescript
// Success
mockTagInfoQuery.getAllTags.mockResolvedValue({ success: true, data: [] });

// Failure
mockTagInfoQuery.getAllTags.mockResolvedValue({
  success: false,
  error: new Error('Database error'),
});
```

**Error Testing:**
```typescript
expect(() => formatDate('invalid-date')).toThrow();
await expect(POST(request)).rejects.toThrow('Failed to fetch posts');
```

**Zustand store testing:**
```typescript
beforeEach(() => {
  useSearchStore.setState({
    isOpen: false,
    searchQuery: '',
    searchResults: [],
    isLoading: false,
  });
  jest.clearAllMocks();
});

it('openModal이 모달을 열어야 한다', () => {
  const { result } = renderHook(() => useSearchStore());
  act(() => { result.current.openModal(); });
  expect(result.current.isOpen).toBe(true);
});
```

**jest.config.js module name mapping (key aliases):**
- `^@/(.*)$` → `<rootDir>/$1`
- `react-notion-x-code-block` → resolved to dist index explicitly (ESM interop workaround)

---

*Testing analysis: 2026-06-20*
