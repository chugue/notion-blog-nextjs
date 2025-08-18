import { diContainer } from '@/shared/di/di-container';
import { notFound } from 'next/navigation';

const getPostDetailPage = async (id: string) => {
  const postUseCase = diContainer.post.postUseCase;
  const result = await postUseCase.getPostById(id);

  if (!result || !result.post) notFound();

  return {
    mdBlocks: result.mdBlocks,
    post: result.post,
    markdown: result.markdown,
  };
};

export default getPostDetailPage;
