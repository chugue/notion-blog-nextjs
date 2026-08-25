const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/__tests__/utils/(.*)$': '<rootDir>/__tests__/utils/$1',
    '^@/app/\\(blog\\)/blog/\[id\]/page$': '<rootDir>/app/(blog)/blog/[id]/page.tsx',
    '^../../../app/api/notion/route$': '<rootDir>/app/api/notion/route.ts',
    '^../../../app/api/search/route$': '<rootDir>/app/api/search/route.ts',
    '^../../../app/(blog)/_components/NotionPageContent$':
      '<rootDir>/app/(blog)/_components/NotionPageContent.tsx',
    // gsap/ScrollTrigger 루트 파일은 ESM이라 jest가 파싱하지 못함 → UMD 빌드로 매핑
    '^gsap/ScrollTrigger$': '<rootDir>/node_modules/gsap/dist/ScrollTrigger.js',
    '^react-notion-x-code-block$': '<rootDir>/node_modules/react-notion-x-code-block/dist/index.js',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!notion-client|ky|gsap|@gsap/react|gsap/dist|gsap/src|gsap/all|gsap/Observer)/', // 👈 gsap 관련 모듈 추가 및 확장
  ],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
