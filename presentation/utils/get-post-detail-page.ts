import { getDiContainer } from '@/shared/di/di-container';
import { notFound } from 'next/navigation';

const getPostDetailPage = async (id: string) => {
  const postUseCase = getDiContainer().post.postUseCase;
  const result = await postUseCase.getPostPropertiesById(id);

  if (!result) {
    notFound();
  }

  return {
    properties: result,
  };
};

export default getPostDetailPage;
