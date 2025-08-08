import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import CodeBlock from './CodeBlock';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import Image from 'next/image';
import BookmarkCard from './BookmarkCard';

interface MDXContentProps {
  source: string;
}

const componentsConfig = {
  pre: CodeBlock,
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="group before-header-tag relative mt-20 scroll-m-20 py-0 text-[2.7rem] font-bold before:-left-15"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="h2 before-header-tag mt-10 scroll-m-20 font-semibold before:-left-10" {...props}>
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
    <blockquote
      className="border-primary bg-muted-foreground/10 mt-10 rounded-sm border-l-4 px-8 py-4 [&>*]:my-0"
      {...props}
    >
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
  img: ({ src, alt, width, height, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const imageSrc = typeof src === 'string' ? src : '/images/no-image-dark.png';
    const imageWidth = width ? Number(width) : 800;
    const imageHeight = height ? Number(height) : 400;

    return (
      <Image
        src={imageSrc}
        alt={alt || ''}
        width={imageWidth}
        height={imageHeight}
        className="mt-8 mb-8 w-full rounded-lg shadow-sm transition-shadow hover:shadow-md"
        placeholder="blur" // 블러 효과
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
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
    <li className="ml-12 flex items-start" {...props}>
      <span className="mt-[0.8rem] mr-4 text-[0.6rem] leading-[2] font-light">●</span>
      <span className="text-md leading-[2] font-light tracking-wider sm:text-xl">{children}</span>
    </li>
  ),
};

const prettyCodeOptions = {
  theme: {
    dark: 'material-theme-ocean',
    light: 'aurora-x',
  },
};

export function MDXContent({ source }: MDXContentProps) {
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
