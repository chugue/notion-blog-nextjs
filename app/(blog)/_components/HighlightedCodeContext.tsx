'use client';

import { HighlightedCodeMap } from '@/presentation/utils/highlight-code-blocks';
import { createContext, useContext, ReactNode } from 'react';

const HighlightedCodeContext = createContext<HighlightedCodeMap>({});

interface HighlightedCodeProviderProps {
    children: ReactNode;
    highlightedCode: HighlightedCodeMap;
}

export function HighlightedCodeProvider({ children, highlightedCode }: HighlightedCodeProviderProps) {
    return <HighlightedCodeContext.Provider value={highlightedCode}>{children}</HighlightedCodeContext.Provider>;
}

export function useHighlightedCode(blockId: string): string | undefined {
    const highlightedCode = useContext(HighlightedCodeContext);
    return highlightedCode[blockId];
}
