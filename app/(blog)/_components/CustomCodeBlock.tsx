'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { CodeBlock } from 'notion-types';
import { Code } from 'react-notion-x-code-block';
gsap.registerPlugin(ScrollTrigger);

const CustomCodeBlock = ({ block }: { block: CodeBlock }) => {
  const language = (() => {
    const lang = block.properties?.language?.[0]?.[0];

    if (!lang || lang === 'plain_text' || lang === 'plain text') {
      return 'plaintext';
    }

    return lang;
  })();

  useGSAP(() => {
    gsap.fromTo(
      '.code-block',
      {
        opacity: 0,
        y: 50,
      },
      {
        y: 0,
        opacity: 1,
        duration: 2,
        ease: 'power4.out',
      }
    );
  });

  return (
    <Code
      block={block}
      defaultLanguage={language}
      showLangLabel={true}
      themes={{
        light: 'catppuccin-mocha',
        dark: 'catppuccin-mocha',
      }}
      className="code-block opacity-0"
    />
  );
};

export default CustomCodeBlock;
