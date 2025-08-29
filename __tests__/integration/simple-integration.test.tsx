import React from 'react';
import CustomCodeBlock from '../../app/(blog)/_components/CustomCodeBlock';
import NotionPageContent from '../../app/(blog)/_components/NotionPageContent';
import { render, screen } from '../utils/test-utils';

// Mock external dependencies
jest.mock('react-notion-x', () => ({
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

jest.mock('react-notion-x-code-block', () => ({
  Code: ({ block, defaultLanguage, showLangLabel, themes }: any) => (
    <div data-testid="code-component">
      <div data-testid="block-data">{JSON.stringify(block)}</div>
      <div data-testid="default-language">{defaultLanguage}</div>
      <div data-testid="show-lang-label">{String(showLangLabel)}</div>
      <div data-testid="themes">{JSON.stringify(themes)}</div>
    </div>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} data-testid="next-image" {...props} />
  ),
}));

jest.mock('next/link', () => ({
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

describe('Simple Integration Tests', () => {
  describe('NotionPageContent Integration', () => {
    const mockRecordMap = {
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
      render(<NotionPageContent recordMap={mockRecordMap as any} />);

      expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('record-map')).toHaveTextContent('test-block-id');
      expect(screen.getByTestId('components')).toHaveTextContent('nextImage,nextLink,Code');
    });

    it('should handle empty recordMap', () => {
      const emptyRecordMap = {
        block: {},
        collection: {},
        collection_view: {},
        collection_query: {},
        notion_user: {},
        signed_urls: {},
        preview_images: {},
      };

      render(<NotionPageContent recordMap={emptyRecordMap as any} />);

      expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
    });
  });

  describe('CustomCodeBlock Integration', () => {
    const createMockCodeBlock = (language?: string) => ({
      id: 'test-code-block',
      type: 'code',
      properties: {
        language: language ? [[language]] : undefined,
        title: [['console.log("Hello World");']],
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
    });

    it('should render CustomCodeBlock with JavaScript language', () => {
      const mockBlock = createMockCodeBlock('javascript');
      render(<CustomCodeBlock block={mockBlock} />);

      expect(screen.getByTestId('code-component')).toBeInTheDocument();
      expect(screen.getByTestId('default-language')).toHaveTextContent('javascript');
      expect(screen.getByTestId('show-lang-label')).toHaveTextContent('true');
    });

    it('should render CustomCodeBlock with TypeScript language', () => {
      const mockBlock = createMockCodeBlock('typescript');
      render(<CustomCodeBlock block={mockBlock} />);

      expect(screen.getByTestId('code-component')).toBeInTheDocument();
      expect(screen.getByTestId('default-language')).toHaveTextContent('typescript');
    });

    it('should handle plain_text language conversion', () => {
      const mockBlock = createMockCodeBlock('plain_text');
      render(<CustomCodeBlock block={mockBlock} />);

      expect(screen.getByTestId('default-language')).toHaveTextContent('plaintext');
    });

    it('should handle undefined language', () => {
      const mockBlock = createMockCodeBlock();
      render(<CustomCodeBlock block={mockBlock} />);

      expect(screen.getByTestId('default-language')).toHaveTextContent('plaintext');
    });

    it('should configure themes correctly', () => {
      const mockBlock = createMockCodeBlock('python');
      render(<CustomCodeBlock block={mockBlock} />);

      const themesElement = screen.getByTestId('themes');
      const themes = JSON.parse(themesElement.textContent || '{}');

      expect(themes).toEqual({
        light: 'catppuccin-mocha',
        dark: 'catppuccin-mocha',
      });
    });
  });

  describe('Component Integration', () => {
    it('should integrate NotionPageContent and CustomCodeBlock through NotionRenderer', () => {
      const mockRecordMap = {
        block: {
          'code-block-id': {
            role: 'reader',
            value: {
              id: 'code-block-id',
              type: 'code',
              properties: {
                language: [['javascript']],
                title: [['console.log("Hello World");']],
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

      render(<NotionPageContent recordMap={mockRecordMap as any} />);

      // NotionRenderer가 렌더링되었는지 확인
      expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();

      // CustomCodeBlock이 components에 포함되어 있는지 확인
      expect(screen.getByTestId('components')).toHaveTextContent('Code');

      // recordMap이 전달되었는지 확인
      expect(screen.getByTestId('record-map')).toHaveTextContent('code-block-id');
    });

    it('should handle multiple code blocks with different languages', () => {
      const mockRecordMap = {
        block: {
          'js-block': {
            role: 'reader',
            value: {
              id: 'js-block',
              type: 'code',
              properties: {
                language: [['javascript']],
                title: [['const x = 1;']],
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

      render(<NotionPageContent recordMap={mockRecordMap as any} />);

      expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('record-map')).toHaveTextContent('js-block');
      expect(screen.getByTestId('record-map')).toHaveTextContent('ts-block');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle malformed recordMap gracefully', () => {
      const malformedRecordMap = {
        block: null,
        collection: {},
        collection_view: {},
        collection_query: {},
        notion_user: {},
        signed_urls: {},
        preview_images: {},
      };

      expect(() => {
        render(<NotionPageContent recordMap={malformedRecordMap as any} />);
      }).not.toThrow();
    });

    it('should handle malformed code block gracefully', () => {
      const malformedBlock = {
        id: 'malformed-block',
        type: 'code',
        properties: null,
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
      };

      expect(() => {
        render(<CustomCodeBlock block={malformedBlock} />);
      }).not.toThrow();
    });
  });
});
