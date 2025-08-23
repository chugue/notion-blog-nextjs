import React from 'react';
import { render, screen } from '../../../utils/test-utils';
import CustomCodeBlock from '../../../../app/(blog)/_components/CustomCodeBlock';
import { CodeBlock } from 'notion-types';

// Mock react-notion-x-code-block
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

describe('CustomCodeBlock', () => {
  const createMockCodeBlock = (language?: string): CodeBlock => ({
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

  it('should render without crashing', () => {
    const mockBlock = createMockCodeBlock('javascript');
    render(<CustomCodeBlock block={mockBlock} />);
    expect(screen.getByTestId('code-component')).toBeInTheDocument();
  });

  it('should pass block data to Code component', () => {
    const mockBlock = createMockCodeBlock('javascript');
    render(<CustomCodeBlock block={mockBlock} />);

    const blockDataElement = screen.getByTestId('block-data');
    expect(blockDataElement).toHaveTextContent('test-code-block');
  });

  it('should set correct default language for JavaScript', () => {
    const mockBlock = createMockCodeBlock('javascript');
    render(<CustomCodeBlock block={mockBlock} />);

    const languageElement = screen.getByTestId('default-language');
    expect(languageElement).toHaveTextContent('javascript');
  });

  it('should set correct default language for TypeScript', () => {
    const mockBlock = createMockCodeBlock('typescript');
    render(<CustomCodeBlock block={mockBlock} />);

    const languageElement = screen.getByTestId('default-language');
    expect(languageElement).toHaveTextContent('typescript');
  });

  it('should handle plain_text language and convert to plaintext', () => {
    const mockBlock = createMockCodeBlock('plain_text');
    render(<CustomCodeBlock block={mockBlock} />);

    const languageElement = screen.getByTestId('default-language');
    expect(languageElement).toHaveTextContent('plaintext');
  });

  it('should handle plain text language and convert to plaintext', () => {
    const mockBlock = createMockCodeBlock('plain text');
    render(<CustomCodeBlock block={mockBlock} />);

    const languageElement = screen.getByTestId('default-language');
    expect(languageElement).toHaveTextContent('plaintext');
  });

  it('should handle undefined language and convert to plaintext', () => {
    const mockBlock = createMockCodeBlock();
    render(<CustomCodeBlock block={mockBlock} />);

    const languageElement = screen.getByTestId('default-language');
    expect(languageElement).toHaveTextContent('plaintext');
  });

  it('should handle empty language array and convert to plaintext', () => {
    const mockBlock: CodeBlock = {
      ...createMockCodeBlock(),
      properties: {
        ...createMockCodeBlock().properties,
        language: [[]],
      },
    };
    render(<CustomCodeBlock block={mockBlock} />);

    const languageElement = screen.getByTestId('default-language');
    expect(languageElement).toHaveTextContent('plaintext');
  });

  it('should set showLangLabel to true', () => {
    const mockBlock = createMockCodeBlock('python');
    render(<CustomCodeBlock block={mockBlock} />);

    const showLangLabelElement = screen.getByTestId('show-lang-label');
    expect(showLangLabelElement).toHaveTextContent('true');
  });

  it('should configure themes correctly', () => {
    const mockBlock = createMockCodeBlock('css');
    render(<CustomCodeBlock block={mockBlock} />);

    const themesElement = screen.getByTestId('themes');
    const themes = JSON.parse(themesElement.textContent || '{}');

    expect(themes).toEqual({
      light: 'catppuccin-mocha',
      dark: 'catppuccin-mocha',
    });
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

      const languageElement = screen.getByTestId('default-language');
      expect(languageElement).toHaveTextContent(lang);

      unmount();
    });
  });

  it('should handle complex code block with multiple properties', () => {
    const mockBlock: CodeBlock = {
      id: 'complex-code-block',
      type: 'code',
      properties: {
        language: [['javascript']],
        title: [
          ['function fibonacci(n) {'],
          ['  if (n <= 1) return n;'],
          ['  return fibonacci(n - 1) + fibonacci(n - 2);'],
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

    render(<CustomCodeBlock block={mockBlock} />);

    expect(screen.getByTestId('code-component')).toBeInTheDocument();
    expect(screen.getByTestId('default-language')).toHaveTextContent('javascript');
  });

  it('should handle edge case with null properties', () => {
    const mockBlock: CodeBlock = {
      ...createMockCodeBlock(),
      properties: null,
    };

    render(<CustomCodeBlock block={mockBlock} />);

    const languageElement = screen.getByTestId('default-language');
    expect(languageElement).toHaveTextContent('plaintext');
  });
});
