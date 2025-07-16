import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import CodeBlock from './CodeBlock';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface MDXContentProps {
  source: string;
}

const componentsConfig = {
  pre: CodeBlock,
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="font-maplestory-bold text-2xl">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="font-maplestory-bold text-xl">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-maplestory-bold text-lg">{children}</h3>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <h4 className="font-maplestory-bold text-base">{children}</h4>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="font-maplestory text-base">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="font-maplestory list-inside list-disc">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="font-maplestory list-inside list-decimal">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="font-maplestory list-inside list-disc">{children}</li>
  ),
  a: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} className="font-maplestory text-blue-500">
      {children}
    </a>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="font-maplestory border-l-4 border-gray-300 pl-4">{children}</blockquote>
  ),
  hr: () => <hr className="my-4 border-t-2 border-gray-300" />,
};

const codeBlockOptions = {
  theme: 'aurora-x',
};

export async function MDXContent({ source }: MDXContentProps) {
  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSanitize, [rehypePrettyCode, codeBlockOptions]],
        },
      }}
      components={componentsConfig}
    />
  );
}
