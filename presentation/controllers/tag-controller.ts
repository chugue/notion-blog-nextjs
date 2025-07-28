import { TagInfoUseCase } from '@/presentation/use-case/tag-use-case';

export const TagController = (tagInfoUseCase: TagInfoUseCase) => {
  return {
    getAllTags: () => {
      return tagInfoUseCase.getAllTags();
    },
  };
};
