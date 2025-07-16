'use client';

import { Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
}

const CodeBlock = ({ className = '', children, ...props }: CodeBlockProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopyCode = async () => {
    const code = preRef.current?.textContent;

    if (!code || isLoading || isCopied) return;

    try {
      setIsLoading(true);
      await navigator.clipboard.writeText(code);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative">
      {/* 복사 버튼 */}
      <button
        type="button"
        disabled={isCopied || isLoading}
        aria-label={isCopied ? '복사됨!' : '코드 복사'}
        onClick={handleCopyCode}
        className={cn(
          'absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-md transition-all',
          'hover:bg-code-accent',
          'opacity-0 group-hover:opacity-100',
          'disabled:cursor-not-allowed',
          isCopied && 'opacity-100'
        )}
      >
        {isCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="text-code-text h-4 w-4" />
        )}
      </button>

      {/* 코드 블록 */}
      <pre
        ref={preRef}
        {...props}
        className={cn(
          'overflow-x-auto rounded-lg border p-4',
          'bg-code-accent text-code-text',
          className
        )}
      >
        {children}
      </pre>
    </div>
  );
};

export default CodeBlock;
