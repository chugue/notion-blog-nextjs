import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PostMetadata } from '@/lib/types/blog';

interface PostCardProps {
  post: PostMetadata;
  isFirst: boolean;
}

export function PostCard({ post, isFirst = false }: PostCardProps) {
  return (
    <Card className="group bg-background relative flex h-full flex-col overflow-visible border-none py-0 backdrop-blur-sm transition-transform duration-300 hover:z-50">
      {post.coverImage && (
        <div className="relative aspect-[16/9] flex-shrink-0">
          <div className="from-background/20 absolute inset-0 bg-gradient-to-t to-transparent">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority={isFirst}
              className="rounded-md object-cover transition-transform duration-300 group-hover:scale-102"
            />
          </div>
        </div>
      )}

      {/* ---------- CardContent ---------- */}
      <CardContent className="relative my-0 flex flex-1 flex-col px-0 py-0">
        {/* 기본 콘텐츠 (레이아웃 유지용) */}
        <div className="flex flex-col px-2 transition-opacity duration-300 group-hover:opacity-0">
          <div className="mb-4 flex flex-wrap gap-2">
            {post.language?.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h2 className="mb-2 line-clamp-2 min-h-[3.5rem] text-xl font-bold tracking-tight">
            {post.title}
          </h2>
        </div>

        {/* 호버 시 전체 콘텐츠 오버레이 */}
        <div className="bg-background text-primary absolute z-40 flex flex-col rounded-md px-2 pb-5 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
          <div className="mb-4 flex flex-wrap gap-2">
            {post.language?.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* hover시 제목 - line-clamp 없음 */}
          <h2 className="text-xl font-bold tracking-tight">{post.title}</h2>
        </div>
      </CardContent>
    </Card>
  );
}
