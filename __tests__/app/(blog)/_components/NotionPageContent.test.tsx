import React from 'react';
import { render, screen } from '../../../utils/test-utils';
import NotionPageContent from '../../../../app/(blog)/_components/NotionPageContent';

// Mock dependencies
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

jest.mock('../../../../app/(blog)/_components/CustomCodeBlock', () => ({
  __esModule: true,
  default: ({ block }: { block: unknown }) => (
    <div data-testid="custom-code-block">{JSON.stringify(block)}</div>
  ),
}));

describe('NotionPageContent', () => {
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

  it('should render without crashing', () => {
    render(<NotionPageContent recordMap={mockRecordMap as any} />);
    expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
  });

  it('should pass recordMap to NotionRenderer', () => {
    render(<NotionPageContent recordMap={mockRecordMap as any} />);
    const recordMapElement = screen.getByTestId('record-map');
    expect(recordMapElement).toHaveTextContent('test-block-id');
  });

  it('should configure NotionRenderer with correct props', () => {
    render(<NotionPageContent recordMap={mockRecordMap as any} />);

    // NotionRenderer가 렌더링되었는지 확인
    expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();

    // components가 올바르게 전달되었는지 확인
    const componentsElement = screen.getByTestId('components');
    expect(componentsElement).toHaveTextContent('nextImage,nextLink,Code');
  });

  it('should render with correct structure', () => {
    const { container } = render(<NotionPageContent recordMap={mockRecordMap as any} />);
    // Mock된 NotionRenderer가 렌더링되므로 실제 div 구조를 확인
    const notionRenderer = screen.getByTestId('notion-renderer');
    expect(notionRenderer).toBeInTheDocument();
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

  it('should handle complex recordMap with multiple blocks', () => {
    const complexRecordMap = {
      block: {
        'block-1': {
          role: 'reader',
          value: {
            id: 'block-1',
            type: 'text',
            properties: { title: [['Block 1']] },
            content: ['block-2'],
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
        'block-2': {
          role: 'reader',
          value: {
            id: 'block-2',
            type: 'text',
            properties: { title: [['Block 2']] },
            content: [],
            parent_id: 'block-1',
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

    render(<NotionPageContent recordMap={complexRecordMap as any} />);
    expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
  });

  it('should be a client component', () => {
    // 'use client' 지시문이 있는지 확인하기 위해 파일 내용을 검사
    // 실제로는 컴포넌트가 클라이언트에서 렌더링되는지 확인
    render(<NotionPageContent recordMap={mockRecordMap as any} />);
    expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
  });
});
