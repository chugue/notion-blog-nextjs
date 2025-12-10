import { ExtendedRecordMap } from 'notion-types';
import { getBlockTitle } from 'notion-utils';
import { createHighlighter, type Highlighter } from 'shiki';

// 자주 사용되는 언어만 미리 로드
const PRELOADED_LANGUAGES = [
    'javascript',
    'typescript',
    'tsx',
    'jsx',
    'html',
    'css',
    'json',
    'markdown',
    'bash',
    'shell',
    'python',
    'java',
    'sql',
    'yaml',
    'plaintext',
];

const THEME = 'catppuccin-mocha';

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: [THEME],
            langs: PRELOADED_LANGUAGES,
        });
    }
    return highlighterPromise;
}

// Notion 언어명을 Shiki 언어명으로 매핑
function normalizeLanguage(lang: string | undefined): string {
    if (!lang || lang === 'plain_text' || lang === 'plain text') {
        return 'plaintext';
    }

    const languageMap: Record<string, string> = {
        'c++': 'cpp',
        'c#': 'csharp',
        'objective-c': 'objc',
        'shell': 'bash',
        'sh': 'bash',
        'zsh': 'bash',
        'yml': 'yaml',
        'js': 'javascript',
        'ts': 'typescript',
    };

    return languageMap[lang.toLowerCase()] || lang.toLowerCase();
}

export interface HighlightedCodeMap {
    [blockId: string]: string;
}

export async function highlightCodeBlocks(recordMap: ExtendedRecordMap): Promise<HighlightedCodeMap> {
    const highlighter = await getHighlighter();
    const highlightedCode: HighlightedCodeMap = {};

    const blocks = Object.values(recordMap.block);

    for (const blockWrapper of blocks) {
        const block = blockWrapper?.value;
        if (!block || block.type !== 'code') continue;

        const code = getBlockTitle(block, recordMap) || '';
        const language = normalizeLanguage(block.properties?.language?.[0]?.[0]);

        try {
            // 언어가 로드되지 않은 경우 동적 로드
            const loadedLangs = highlighter.getLoadedLanguages();
            if (!loadedLangs.includes(language as never)) {
                try {
                    await highlighter.loadLanguage(language as never);
                } catch {
                    // 지원하지 않는 언어는 plaintext로 폴백
                    console.warn(`Language ${language} not supported, falling back to plaintext`);
                }
            }

            const finalLang = highlighter.getLoadedLanguages().includes(language as never) ? language : 'plaintext';

            const html = highlighter.codeToHtml(code, {
                lang: finalLang,
                theme: THEME,
            });

            highlightedCode[block.id] = html;
        } catch (error) {
            console.error(`Failed to highlight block ${block.id}:`, error);
            // 실패 시 코드만 pre 태그로 감싸서 반환
            highlightedCode[block.id] = `<pre><code>${escapeHtml(code)}</code></pre>`;
        }
    }

    return highlightedCode;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
