import { PostMetadata } from '@/domain/entities/post.entity';
import { Card, CardContent } from '@/shared/components/ui/card';
import Image from 'next/image';
import CustomBadge from '../CustomBadge';

interface PostCardProps {
  post: PostMetadata;
  isFirst: boolean;
}

export function PostCard({ post, isFirst = false }: PostCardProps) {
  return (
    <Card className="group bg-card relative flex h-full flex-col overflow-visible border-none py-0 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 hover:z-50">
      {post.coverImage && (
        <div className="relative aspect-[16/9] flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority={isFirst}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      )}

      {/* ---------- CardContent ---------- */}
      <CardContent className="group-hover:text-primary relative my-0 flex flex-1 flex-col p-2 transition-all duration-300">
        {/* 기본 콘텐츠 (레이아웃 유지용) */}
        <div className="flex flex-col px-2 transition-opacity duration-300">
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tag?.map((tag) => (
              <CustomBadge key={tag} tag={tag} />
            ))}
          </div>

          <div
            data-title={post.title}
            className="dark:after:bg-card pointer-events-none relative -mx-4 overflow-visible px-4 after:absolute after:inset-x-0 after:top-0 after:z-10 after:[display:block] after:rounded-b-lg after:px-4 after:pb-4 after:text-xl after:font-bold after:tracking-tight after:whitespace-normal after:opacity-0 after:transition-opacity after:duration-300 after:content-[attr(data-title)] group-hover:after:opacity-100"
          >
            <h2 className="mb-2 line-clamp-2 min-h-[3.5rem] text-xl font-bold tracking-tight transition-opacity duration-300 group-hover:opacity-0">
              {post.title}
            </h2>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
