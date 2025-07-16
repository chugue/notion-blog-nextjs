import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import CodeBlock from './CodeBlock';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

interface MDXContentProps {
  source: string;
}

const componentsConfig = {
  pre: CodeBlock,
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
          rehypePlugins: [rehypeSlug, rehypeSanitize, [rehypePrettyCode, codeBlockOptions]],
        },
      }}
      components={componentsConfig}
    />
  );
}
