import { diContainer } from '@/shared/di/di-container';
import { headers } from 'next/headers';

interface MainPageDataProps {
  selectedTag: string;
  selectedSort: string;
}

const getMainPageData = ({ selectedTag, selectedSort }: MainPageDataProps) => {
  const tagInfoUseCase = diContainer.tagInfo.tagInfoUseCase;
  const postUseCase = diContainer.post.postUseCase;
  const pageViewUseCase = diContainer.pageView.pageViewUseCase;

  const request = headers();

  pageViewUseCase.addMainPageView(request);
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
