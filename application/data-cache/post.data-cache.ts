import { postQuery } from '@/infrastructure/queries/post.query';
import { unstable_cache } from 'next/cache';
import { PostRepositoryPort } from '../port/post-repository.port';

export const allPostMetadatasDataCache = async (postRepositoryPort: PostRepositoryPort) => {
  const cachedFn = unstable_cache(
    async () => {
      return await postRepositoryPort.getAllPublishedPosts();
    },
    ['getAllPublishedPostMetadatas'],
    {
      tags: ['getAllPublishedPostMetadatas'],
    }
  );

  return await cachedFn();
};

export const getMainPageDataCache = async () => {
  const cachedFn = unstable_cache(
    async () => {
      return await postQuery.getPublishedPosts({
        tag: '전체',
        sort: 'latest',
        pageSize: 12,
      });
    },
    ['getMainPageDataCache'],
    {
      tags: ['getMainPageDataCache'],
    }
  );

  return await cachedFn();
};

export const getCachedPostById = (postRepositoryPort: PostRepositoryPort, id: string) =>
  unstable_cache(
    async () => {
      return await postRepositoryPort.getPostById(id);
    },
    [`post-${id}`],
    {
      tags: [`post-${id}`, 'all-posts'],
    }
  );
