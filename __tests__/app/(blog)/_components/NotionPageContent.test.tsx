import React from 'react';
import { jest } from '@jest/globals';
import { render, screen } from '@/__tests__/utils/test-utils';
import { ExtendedRecordMap, TextBlock } from 'notion-types';

// ESM jest 모드에서는 jest.mock이 호이스팅되지 않으므로 unstable_mockModule + 동적 import를 사용한다
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

// next/dynamic은 react-notion-x/build/third-party/collection을 로드하므로 컴포넌트 로딩 자체를 막는다
jest.unstable_mockModule('next/dynamic', () => ({
  __esModule: true,
  default: () => () => <div data-testid="dynamic-collection" />,
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

jest.unstable_mockModule('@/app/(blog)/_components/CustomCodeBlock', () => ({
  __esModule: true,
  default: ({ block }: { block: unknown }) => (
    <div data-testid="custom-code-block">{JSON.stringify(block)}</div>
  ),
}));

type NotionPageContentComponent =
  typeof import('@/app/(blog)/_components/NotionPageContent')['default'];

let NotionPageContent: NotionPageContentComponent;

beforeAll(async () => {
  ({ default: NotionPageContent } = await import('@/app/(blog)/_components/NotionPageContent'));
});

const createTextBlock = (
  id: string,
  title: string,
  overrides: Partial<TextBlock> = {}
): TextBlock => ({
  id,
  type: 'text',
  properties: { title: [[title]] },
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
  ...overrides,
});

const createRecordMap = (blocks: TextBlock[]): ExtendedRecordMap => ({
  block: Object.fromEntries(blocks.map((block) => [block.id, { role: 'reader', value: block }])),
  collection: {},
  collection_view: {},
  collection_query: {},
  notion_user: {},
  signed_urls: {},
  preview_images: {},
});

describe('NotionPageContent', () => {
  const mockRecordMap = createRecordMap([createTextBlock('test-block-id', 'Test Content')]);

  it('should render without crashing', () => {
    render(<NotionPageContent recordMap={mockRecordMap} />);
    expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
  });

  it('should pass recordMap to NotionRenderer', () => {
    render(<NotionPageContent recordMap={mockRecordMap} />);
    const recordMapElement = screen.getByTestId('record-map');
    expect(recordMapElement).toHaveTextContent('test-block-id');
  });

  it('should configure NotionRenderer with correct props', () => {
    render(<NotionPageContent recordMap={mockRecordMap} />);

    // NotionRenderer가 렌더링되었는지 확인
    expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();

    // components가 올바르게 전달되었는지 확인 (Collection은 next/dynamic으로 추가됨)
    const componentsElement = screen.getByTestId('components');
    expect(componentsElement).toHaveTextContent('nextImage,nextLink,Code,Collection');
  });

  it('should render with correct structure', () => {
    const { container } = render(<NotionPageContent recordMap={mockRecordMap} />);
    // 렌더러는 flex 래퍼 안에 위치한다
    const notionRenderer = screen.getByTestId('notion-renderer');
    expect(notionRenderer).toBeInTheDocument();
    expect(container.querySelector('.flex')).toContainElement(notionRenderer);
  });

  it('should handle empty recordMap', () => {
    const emptyRecordMap = createRecordMap([]);

    render(<NotionPageContent recordMap={emptyRecordMap} />);
    expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
  });

  it('should handle complex recordMap with multiple blocks', () => {
    const complexRecordMap = createRecordMap([
      createTextBlock('block-1', 'Block 1', { content: ['block-2'] }),
      createTextBlock('block-2', 'Block 2', { parent_id: 'block-1' }),
    ]);

    render(<NotionPageContent recordMap={complexRecordMap} />);
    expect(screen.getByTestId('record-map')).toHaveTextContent('block-2');
  });

  it('should be a client component', () => {
    // 'use client' 컴포넌트가 jsdom(클라이언트)에서 렌더링되는지 확인
    render(<NotionPageContent recordMap={mockRecordMap} />);
    expect(screen.getByTestId('notion-renderer')).toBeInTheDocument();
  });
});
