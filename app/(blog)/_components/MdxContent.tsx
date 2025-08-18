import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import CodeBlock from './CodeBlock';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import BookmarkCard from './BookmarkCard';
import DynamicImage from './DynamicImage';
import { Suspense } from 'react';
import ImageFallback from './ImageFallback';
import { MdBlock } from 'notion-to-md/build/types';

interface MDXContentProps {
  source: string;
  mdBlocks: MdBlock[];
}

const prettyCodeOptions = {
  theme: {
    dark: 'material-theme-ocean',
    light: 'aurora-x',
  },
};

export function MDXContent({ source, mdBlocks }: MDXContentProps) {
  const componentsConfig = {
    pre: CodeBlock,
    h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1
        className="group before-header-tag relative mt-25 scroll-m-20 py-0 text-[2.7rem] font-bold before:-left-15"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2
        className="h2 before-header-tag mt-10 scroll-m-20 font-semibold before:-left-10"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3
        className="h3 before-header-tag mt-15 mb-4 scroll-m-20 font-semibold before:-left-10"
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
      const content = props.content;
      if (content === '') {
        return <p className="flex h-20 w-full" />;
      }

      return (
        <p
          className="text-md mt-10 mb-2 leading-[2] font-light tracking-wide text-gray-200 sm:text-xl"
          {...props}
        >
          {children}
        </p>
      );
    },
    blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className="border-primary mt-15 border-l-4 px-8 [&>*]:my-0" {...props}>
        {children}
      </blockquote>
    ),
    code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <code
        className="bg-muted relative rounded px-[0.5rem] py-[0.4rem] font-semibold text-white/80"
        {...props}
      >
        {children}
      </code>
    ),
    img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
      if (!mdBlocks) {
        return <ImageFallback />;
      }

      const srcUrl = typeof props.src === 'string' ? props.src : '';

      const matchingBlock = mdBlocks?.find((block) => {
        const urlMatch = block.parent?.match(/\]\((.*?)\)/);
        const blockUrl = urlMatch?.[1];

        const cleanBlockUrl = blockUrl?.split('?')[0];
        const cleanSrcUrl = srcUrl.split('?')[0];

        return cleanBlockUrl === cleanSrcUrl;
      });

      const pageId = matchingBlock?.blockId;

      if (!pageId) {
        return <ImageFallback {...props} />;
      }

      return (
        <Suspense fallback={<ImageFallback />}>
          <DynamicImage {...props} pageId={pageId} />
        </Suspense>
      );
    },
    a: ({ href }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
      if (!href)
        return (
          <span className="text-md leading-[2] font-light tracking-wider sm:text-xl">
            링크를 불러올 수 없습니다.
          </span>
        );
      return <BookmarkCard href={href} />;
    },
    li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="ml-6 flex items-start lg:ml-8" {...props}>
        <span className="mt-[0.4rem] mr-4 text-[0.6rem] leading-[2] font-light sm:mt-[0.7rem]">
          ●
        </span>
        <div className="text-md w-full min-w-0 flex-1 leading-[2] font-light tracking-wider [overflow-wrap:anywhere] whitespace-normal sm:text-xl [&_code]:break-all [&_figure]:w-full [&_figure]:max-w-full [&_ol]:min-w-0 [&_p]:mt-0 [&_p]:mb-0 [&_pre]:w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_ul]:min-w-0">
          {children}
        </div>
      </li>
    ),
  };

  return (
    <>
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeSanitize, [rehypePrettyCode, prettyCodeOptions]],
          },
        }}
        components={componentsConfig}
      />
    </>
  );
}
