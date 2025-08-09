import { diContainer } from '@/shared/di/di-container';

interface MainPageDataProps {
  selectedTag: string;
  selectedSort: string;
}

const getMainPageData = async ({ selectedTag, selectedSort }: MainPageDataProps) => {
  const tagInfoUseCase = diContainer.tagInfo.tagInfoUseCase;
  const postUseCase = diContainer.post.postUseCase;

  const tags = tagInfoUseCase.getAllTags();
  const postsPromise = postUseCase.getPostsWithParams({
    tag: selectedTag,
    sort: selectedSort,
    pageSize: 12,
  });

  return {
    tags,
    postsPromise,
  };
};

export default getMainPageData;
