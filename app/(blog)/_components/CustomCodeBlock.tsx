import { CodeBlock } from 'notion-types';
import React from 'react';
import { Code } from 'react-notion-x-code-block';

const CustomCodeBlock = ({ block }: { block: CodeBlock }) => {
  const language = (() => {
    const lang = block.properties?.language?.[0]?.[0];

    // 언어가 없거나 plain text 관련 값인 경우 처리
    if (!lang || lang === 'plain_text' || lang === 'plain text') {
      return 'plaintext'; // shiki에서 지원하는 정확한 언어 식별자 사용
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
