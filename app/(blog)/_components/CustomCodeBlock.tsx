import { CodeBlock } from 'notion-types';
import { Code } from 'react-notion-x-code-block';

const CustomCodeBlock = ({ block }: { block: CodeBlock }) => {
  const language = (() => {
    const lang = block.properties?.language?.[0]?.[0];

    if (!lang || lang === 'plain_text' || lang === 'plain text') {
      return 'plaintext';
    }

    return lang;
  })();
  return (
    <Code
      block={block}
      defaultLanguage={language}
      showLangLabel={true}
      themes={{
        light: 'catppuccin-mocha',
        dark: 'catppuccin-mocha',
      }}
    />
  );
};

export default CustomCodeBlock;
