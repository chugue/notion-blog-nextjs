import { diContainer } from '@/shared/di/di-container';
import { notFound } from 'next/navigation';

const getPostDetailPage = async (id: string) => {
  const postUseCase = diContainer.post.postUseCase;
  return await postUseCase.getPostById(id);
};

export default getPostDetailPage;
