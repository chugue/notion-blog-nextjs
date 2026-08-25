import React from 'react';
import { jest } from '@jest/globals';
import { render, screen } from '../../../utils/test-utils';
import { HighlightedCodeProvider } from '../../../../app/(blog)/_components/HighlightedCodeContext';
import { CodeBlock, Decoration } from 'notion-types';

// gsap은 ESM 원본이 변환되지 않아 jest에서 로드되지 않으므로 애니메이션 계층 전체를 모킹한다
jest.unstable_mockModule('gsap', () => ({
  default: { registerPlugin: jest.fn(), fromTo: jest.fn() },
}));
jest.unstable_mockModule('gsap/ScrollTrigger', () => ({ default: {} }));
jest.unstable_mockModule('@gsap/react', () => ({ useGSAP: jest.fn() }));

type CustomCodeBlockComponent =
  typeof import('../../../../app/(blog)/_components/CustomCodeBlock')['default'];

let CustomCodeBlock: CustomCodeBlockComponent;

beforeAll(async () => {
  ({ default: CustomCodeBlock } = await import(
    '../../../../app/(blog)/_components/CustomCodeBlock'
  ));
});

describe('CustomCodeBlock', () => {
  const createMockCodeBlock = (language?: string): CodeBlock => ({
    id: 'test-code-block',
    version: 1,
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
  });

  const getLanguageLabel = () => screen.getByText((_, element) => {
    return element?.tagName === 'DIV' && element.className.includes('text-gray-400');
  });

  it('should render without crashing', () => {
    const mockBlock = createMockCodeBlock('javascript');
    const { container } = render(<CustomCodeBlock block={mockBlock} />);
    expect(container.querySelector('.code-block')).toBeInTheDocument();
  });

  it('should render block title as fallback code when no highlighted html exists', () => {
    const mockBlock = createMockCodeBlock('javascript');
    const { container } = render(<CustomCodeBlock block={mockBlock} />);

    const codeElement = container.querySelector('pre > code');
    expect(codeElement).toHaveTextContent('console.log("Hello World");');
  });

  it('should render the language label for JavaScript', () => {
    const mockBlock = createMockCodeBlock('javascript');
    render(<CustomCodeBlock block={mockBlock} />);

    expect(getLanguageLabel()).toHaveTextContent('javascript');
  });

  it('should render the language label for TypeScript', () => {
    const mockBlock = createMockCodeBlock('typescript');
    render(<CustomCodeBlock block={mockBlock} />);

    expect(getLanguageLabel()).toHaveTextContent('typescript');
  });

  it('should handle plain_text language and convert to plaintext', () => {
    const mockBlock = createMockCodeBlock('plain_text');
    render(<CustomCodeBlock block={mockBlock} />);

    expect(getLanguageLabel()).toHaveTextContent('plaintext');
  });

  it('should handle plain text language and convert to plaintext', () => {
    const mockBlock = createMockCodeBlock('plain text');
    render(<CustomCodeBlock block={mockBlock} />);

    expect(getLanguageLabel()).toHaveTextContent('plaintext');
  });

  it('should handle empty language array and convert to plaintext', () => {
    const mockBlock = createMockCodeBlock();
    render(<CustomCodeBlock block={mockBlock} />);

    expect(getLanguageLabel()).toHaveTextContent('plaintext');
  });

  it('should handle empty language string and convert to plaintext', () => {
    const emptyLanguage: Decoration[] = [['']];
    const mockBlock: CodeBlock = {
      ...createMockCodeBlock(),
      properties: {
        ...createMockCodeBlock().properties,
        language: emptyLanguage,
      },
    };
    render(<CustomCodeBlock block={mockBlock} />);

    expect(getLanguageLabel()).toHaveTextContent('plaintext');
  });

  it('should render server-highlighted html when provided via context', () => {
    const mockBlock = createMockCodeBlock('css');
    const highlightedCode = {
      [mockBlock.id]: '<pre class="shiki"><code data-testid="shiki-code">.a{}</code></pre>',
    };

    const { container } = render(
      <HighlightedCodeProvider highlightedCode={highlightedCode}>
        <CustomCodeBlock block={mockBlock} />
      </HighlightedCodeProvider>
    );

    expect(container.querySelector('.shiki-code-block')).toBeInTheDocument();
    expect(screen.getByTestId('shiki-code')).toHaveTextContent('.a{}');
    expect(container.querySelector('pre.bg-\\[\\#1e1e2e\\]')).not.toBeInTheDocument();
  });

  it('should fall back to plain code when context has no entry for this block', () => {
    const mockBlock = createMockCodeBlock('css');

    const { container } = render(
      <HighlightedCodeProvider highlightedCode={{ 'other-block': '<b>x</b>' }}>
        <CustomCodeBlock block={mockBlock} />
      </HighlightedCodeProvider>
    );

    expect(container.querySelector('.shiki-code-block')).not.toBeInTheDocument();
    expect(container.querySelector('pre > code')).toHaveTextContent('console.log("Hello World");');
  });

  it('should handle various programming languages correctly', () => {
    const languages = [
      'javascript',
      'typescript',
      'python',
      'java',
      'cpp',
      'csharp',
      'php',
      'ruby',
      'go',
      'rust',
    ];

    languages.forEach((lang) => {
      const mockBlock = createMockCodeBlock(lang);
      const { unmount } = render(<CustomCodeBlock block={mockBlock} />);

      expect(getLanguageLabel()).toHaveTextContent(lang);

      unmount();
    });
  });

  it('should handle complex code block with multiple properties', () => {
    const mockBlock: CodeBlock = {
      id: 'complex-code-block',
      version: 3,
      type: 'code',
      properties: {
        language: [['javascript']],
        title: [
          ['function fibonacci(n) {\n'],
          ['  if (n <= 1) return n;\n'],
          ['  return fibonacci(n - 1) + fibonacci(n - 2);\n'],
          ['}'],
        ],
        caption: [['A recursive Fibonacci function']],
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
    };

    const { container } = render(<CustomCodeBlock block={mockBlock} />);

    expect(getLanguageLabel()).toHaveTextContent('javascript');
    expect(container.querySelector('pre > code')).toHaveTextContent('function fibonacci(n)');
    expect(container.querySelector('pre > code')).toHaveTextContent('fibonacci(n - 2);');
  });
});
