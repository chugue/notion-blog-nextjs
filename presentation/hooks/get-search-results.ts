'use client';

import { useQuery } from '@tanstack/react-query';
import { PostMetadata } from '@/domain/entities/post.entity';
import { toast } from 'sonner';

const useSearchResults = (searchQuery: string): PostMetadata[] => {
  const { data: result, isError } = useQuery({
    queryKey: ['all-searchable-posts'],
    queryFn: () =>
      fetch(`/api/notion`)
        .then((res) => res.json())
        .then((data) => data.data as PostMetadata[]),
    enabled: !!searchQuery && searchQuery.trim() !== '',
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (!result) return [];
  if (isError) toast.error('검색 중 오류가 발생했습니다.');

  const filteredList = result.filter((post: PostMetadata) => {
    return (
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tag.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return filteredList;
};

export default useSearchResults;
