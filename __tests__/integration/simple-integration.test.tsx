import { render, screen } from '@/__tests__/utils/test-utils';
import { jest } from '@jest/globals';
import { CodeBlock, ExtendedRecordMap } from 'notion-types';
import React from 'react';

// 테스트 파일은 ESM 으로 실행되므로 정적 import 이전에 적용되는 jest.unstable_mockModule 을 사용하고,
// 대상 컴포넌트는 모킹 등록 이후 동적 import 로 가져온다.

// gsap/ScrollTrigger 는 ESM 소스인데 gsap 패키지가 CJS 로 선언되어 있어 jest 가 파싱하지 못한다 → 로드 자체를 막는다
jest.unstable_mockModule('gsap', () => ({
  default: { registerPlugin: jest.fn(), fromTo: jest.fn(), to: jest.fn() },
}));
jest.unstable_mockModule('gsap/ScrollTrigger', () => ({ default: {} }));
jest.unstable_mockModule('@gsap/react', () => ({ useGSAP: jest.fn() }));

jest.unstable_mockModule('react-notion-x', () => ({
  NotionRenderer: ({
    recordMap,
    components,
  }: {
    recordMap: unknown;
    components: Record<string, unknown>;
  }) => (
    <div data-testid="notion-renderer">
      <div data-testid="record-map">{JSON.stringify(recordMap)}</div>
      <div data-testid="components">{Object.keys(components).join(',')}</div>
    </div>
  ),
}));

jest.unstable_mockModule('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} data-testid="next-image" {...props} />
  ),
}));

jest.unstable_mockModule('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} data-testid="next-link" {...props}>
      {children}
    </a>
  ),
}));

const { default: CustomCodeBlock } = await import('@/app/(blog)/_components/CustomCodeBlock');
const { default: NotionPageContent } = await import('@/app/(blog)/_components/NotionPageContent');

describe('Simple Integration Tests', () => {
  describe('NotionPageContent Integration', () => {
    const mockRecordMap: ExtendedRecordMap = {
      block: {
        'test-block-id': {
          role: 'reader',
          value: {
            id: 'test-block-id',
            type: 'text',
            properties: {
              title: [['Test Content']],
            },
            content: [],
            parent_id: 'parent-block',
            parent_table: 'block',
            alive: true,
            created_by_id: 'user-id',
            created_by_table: 'notion_user',
            created_time: 1234567890,
            last_edited_by_id: 'user-id',
            last_edited_by_table: 'notion_user',
            last_edited_time: 1234567890,
            version: 1,
          },
        },
      },
      collection: {},
      collection_view: {},
      collection_query: {},
      notion_user: {},
      signed_urls: {},
      preview_images: {},
    };

    it('should render NotionPageContent with recordMap', () => {
      render(<NotionPageContent recordMap={mockRecordMap} />);

      expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('record-map')).toHaveTextContent('test-block-id');
      expect(screen.getByTestId('components')).toHaveTextContent(
        'nextImage,nextLink,Code,Collection'
      );
    });

    it('should handle empty recordMap', () => {
      const emptyRecordMap: ExtendedRecordMap = {
        block: {},
        collection: {},
        collection_view: {},
        collection_query: {},
        notion_user: {},
        signed_urls: {},
        preview_images: {},
      };

      render(<NotionPageContent recordMap={emptyRecordMap} />);

      expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
    });
  });

  describe('CustomCodeBlock Integration', () => {
    const createMockCodeBlock = (language?: string): CodeBlock => ({
      id: 'test-code-block',
      type: 'code',
      properties: {
        language: language ? [[language]] : [],
        title: [['console.log("Hello World");']],
        caption: [],
      },
      content: [],
      parent_id: 'parent-block',
      parent_table: 'block',
      alive: true,
      created_by_id: 'user-id',
      created_by_table: 'notion_user',
      created_time: 1234567890,
      last_edited_by_id: 'user-id',
      last_edited_by_table: 'notion_user',
      last_edited_time: 1234567890,
      version: 1,
    });

    it('should render CustomCodeBlock with JavaScript language', () => {
      const mockBlock = createMockCodeBlock('javascript');
      render(<CustomCodeBlock block={mockBlock} />);

      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('console.log("Hello World");')).toBeInTheDocument();
    });

    it('should render CustomCodeBlock with TypeScript language', () => {
      const mockBlock = createMockCodeBlock('typescript');
      render(<CustomCodeBlock block={mockBlock} />);

      expect(screen.getByText('typescript')).toBeInTheDocument();
    });

    it('should handle plain_text language conversion', () => {
      const mockBlock = createMockCodeBlock('plain_text');
      render(<CustomCodeBlock block={mockBlock} />);

      expect(screen.getByText('plaintext')).toBeInTheDocument();
    });

    it('should handle undefined language', () => {
      const mockBlock = createMockCodeBlock();
      render(<CustomCodeBlock block={mockBlock} />);

      expect(screen.getByText('plaintext')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should integrate NotionPageContent and CustomCodeBlock through NotionRenderer', () => {
      const mockRecordMap: ExtendedRecordMap = {
        block: {
          'code-block-id': {
            role: 'reader',
            value: {
              id: 'code-block-id',
              type: 'code',
              properties: {
                language: [['javascript']],
                title: [['console.log("Hello World");']],
                caption: [],
              },
              content: [],
              parent_id: 'parent-block',
              parent_table: 'block',
              alive: true,
              created_by_id: 'user-id',
              created_by_table: 'notion_user',
              created_time: 1234567890,
              last_edited_by_id: 'user-id',
              last_edited_by_table: 'notion_user',
              last_edited_time: 1234567890,
              version: 1,
            },
          },
        },
        collection: {},
        collection_view: {},
        collection_query: {},
        notion_user: {},
        signed_urls: {},
        preview_images: {},
      };

      render(<NotionPageContent recordMap={mockRecordMap} />);

      // NotionRenderer가 렌더링되었는지 확인
      expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();

      // CustomCodeBlock이 components에 포함되어 있는지 확인
      expect(screen.getByTestId('components')).toHaveTextContent('Code');

      // recordMap이 전달되었는지 확인
      expect(screen.getByTestId('record-map')).toHaveTextContent('code-block-id');
    });

    it('should handle multiple code blocks with different languages', () => {
      const mockRecordMap: ExtendedRecordMap = {
        block: {
          'js-block': {
            role: 'reader',
            value: {
              id: 'js-block',
              type: 'code',
              properties: {
                language: [['javascript']],
                title: [['const x = 1;']],
                caption: [],
              },
              content: [],
              parent_id: 'parent-block',
              parent_table: 'block',
              alive: true,
              created_by_id: 'user-id',
              created_by_table: 'notion_user',
              created_time: 1234567890,
              last_edited_by_id: 'user-id',
              last_edited_by_table: 'notion_user',
              last_edited_time: 1234567890,
              version: 1,
            },
          },
          'ts-block': {
            role: 'reader',
            value: {
              id: 'ts-block',
              type: 'code',
              properties: {
                language: [['typescript']],
                title: [['const y: number = 2;']],
                caption: [],
              },
              content: [],
              parent_id: 'parent-block',
              parent_table: 'block',
              alive: true,
              created_by_id: 'user-id',
              created_by_table: 'notion_user',
              created_time: 1234567890,
              last_edited_by_id: 'user-id',
              last_edited_by_table: 'notion_user',
              last_edited_time: 1234567890,
              version: 1,
            },
          },
        },
        collection: {},
        collection_view: {},
        collection_query: {},
        notion_user: {},
        signed_urls: {},
        preview_images: {},
      };

      render(<NotionPageContent recordMap={mockRecordMap} />);

      expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('record-map')).toHaveTextContent('js-block');
      expect(screen.getByTestId('record-map')).toHaveTextContent('ts-block');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle recordMap without blocks gracefully', () => {
      const emptyRecordMap: ExtendedRecordMap = {
        block: {},
        collection: {},
        collection_view: {},
        collection_query: {},
        notion_user: {},
        signed_urls: {},
        preview_images: {},
      };

      expect(() => {
        render(<NotionPageContent recordMap={emptyRecordMap} />);
      }).not.toThrow();
    });

    it('should handle code block with empty properties gracefully', () => {
      const malformedBlock: CodeBlock = {
        id: 'malformed-block',
        type: 'code',
        properties: { title: [], language: [], caption: [] },
        content: [],
        parent_id: 'parent-block',
        parent_table: 'block',
        alive: true,
        created_by_id: 'user-id',
        created_by_table: 'notion_user',
        created_time: 1234567890,
        last_edited_by_id: 'user-id',
        last_edited_by_table: 'notion_user',
        last_edited_time: 1234567890,
        version: 1,
      };

      expect(() => {
        render(<CustomCodeBlock block={malformedBlock} />);
      }).not.toThrow();
    });
  });
});
