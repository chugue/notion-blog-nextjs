'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { PostCard } from './PostCard';
import { Post } from '@/lib/types/blog';

interface PostListProps {
  selectedTag: string;
}

const PostList = ({ selectedTag }: PostListProps) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await fetch('/api/notion').then((res) => res.json());
      setPosts(posts);
    };

    fetchPosts();
  }, []);

  return (
    <div className="grid gap-4">
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
