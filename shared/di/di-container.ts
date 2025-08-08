import { PostDependencies, createPostDependencies } from './post-dependencies';
import { TagInfoDependencies, createTagInfoDependencies } from './tag-info-dependencies';

export interface DiContainer {
  tagInfo: TagInfoDependencies;
  post: PostDependencies;
}

// 전역 타입 선언
declare global {
  var __diContainer: DiContainer | undefined;
}

export const createDiContainer = (): DiContainer => {
  const postDependencies = createPostDependencies();
  const tagInfoDependencies = createTagInfoDependencies(postDependencies.postRepository);

  return {
    tagInfo: tagInfoDependencies,
    post: postDependencies,
  };
};

// 싱글톤
export const getDiContainer = (): DiContainer => {
  if (!global.__diContainer) {
    global.__diContainer = createDiContainer();
  }
  return global.__diContainer;
};

export const diContainer = getDiContainer();
