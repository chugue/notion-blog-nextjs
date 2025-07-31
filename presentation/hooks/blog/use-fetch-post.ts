import { PostMetadataResp } from '@/domain/entities/post.entity';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export const useFetchPost = (initialData: PostMetadataResp) => {
  const searchParams = useSearchParams();
  const tag = searchParams.get('tag') || '전체';
  const sort = searchParams.get('sort') || 'latest';

  const fetchPost = async ({ pageParam }: { pageParam?: string }): Promise<PostMetadataResp> => {
    const params = new URLSearchParams();

    if (tag && tag !== '전체') params.append('tag', tag);
    if (sort && sort !== 'latest') params.append('sort', sort);
    if (pageParam) params.append('startCursor', pageParam);

    params.append('pageSize', '10');

    const response = await fetch(`/api/notion?${params.toString()}`);

    if (!response.ok) {
      toast.error('포스트를 불러오는 중 오류가 발생했습니다.');
    }

    const result = await response.json();

    return result.data;
  };

  const infiniteQuery = useInfiniteQuery({
    queryKey: ['posts', tag, sort],
    queryFn: fetchPost,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialData: {
      pages: [initialData],
      pageParams: [undefined],
    },
  });

  return { ...infiniteQuery, tag, sort };
};
