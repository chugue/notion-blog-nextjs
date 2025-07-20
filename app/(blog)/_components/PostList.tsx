import Link from 'next/link';
import React from 'react';
import { PostCard } from './PostCard';
import { PostMetadata } from '@/lib/types/blog';

interface PostListProps {
  posts: PostMetadata[];
  selectedTag: string;
}

const PostList = ({ posts, selectedTag }: PostListProps) => {
  return (
    <div className="grid gap-4">
      ㄴ
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <Link key={post.id} href={`/blog/${post.id}`}>
            <PostCard post={post} isFirst={index === 0} />
          </Link>
        ))
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-lg">
            {selectedTag
              ? `'${selectedTag}' 태그에 해당하는 포스트가 없습니다.`
              : '아직 발행된 포스트가 없습니다.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PostList;
