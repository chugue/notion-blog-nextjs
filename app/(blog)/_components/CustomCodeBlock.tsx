'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { CodeBlock } from 'notion-types';
import { getBlockTitle } from 'notion-utils';
import { useRef } from 'react';
import { useHighlightedCode } from './HighlightedCodeContext';

gsap.registerPlugin(ScrollTrigger);

const CustomCodeBlock = ({ block }: { block: CodeBlock }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const highlightedHtml = useHighlightedCode(block.id);

    const language = (() => {
        const lang = block.properties?.language?.[0]?.[0];
        if (!lang || lang === 'plain_text' || lang === 'plain text') {
            return 'plaintext';
        }
        return lang;
    })();

    useGSAP(
        () => {
            if (containerRef.current) {
                gsap.fromTo(
                    containerRef.current,
                    { opacity: 0, y: 50 },
                    { y: 0, opacity: 1, duration: 1.5, ease: 'power4.out' }
                );
            }
        },
        { scope: containerRef }
    );

    // 서버에서 하이라이팅된 HTML이 있으면 사용
    if (highlightedHtml) {
        return (
            <div ref={containerRef} className="code-block opacity-0">
                <div className="mb-2 text-sm text-gray-400">{language}</div>
                <div
                    className="shiki-code-block overflow-x-auto rounded-lg"
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
            </div>
        );
    }

    // 폴백: 서버 하이라이팅 없으면 코드만 표시
    const code = getBlockTitle(block, {} as never) || '';
    return (
        <div ref={containerRef} className="code-block opacity-0">
            <div className="mb-2 text-sm text-gray-400">{language}</div>
            <pre className="overflow-x-auto rounded-lg bg-[#1e1e2e] p-4">
                <code className="text-sm text-gray-200">{code}</code>
            </pre>
        </div>
    );
};

export default CustomCodeBlock;
