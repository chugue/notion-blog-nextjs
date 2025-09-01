import { getDiContainer } from '@/shared/di/di-container';
import { notFound } from 'next/navigation';

const getPostDetailPage = async (id: string) => {
  const postUseCase = getDiContainer().post.postUseCase;
  const result = await postUseCase.getPostById(id);

  if (!result) {
    notFound();
  }

  return {
    recordMap: result.recordMap,
    properties: result.properties,
  };
};

export default getPostDetailPage;
