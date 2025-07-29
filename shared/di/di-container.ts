import { PostDependencies, createPostDependencies } from './post-dependencies';
import { TagInfoDependencies, createTagInfoDependencies } from './tag-info-dependencies';

export interface DiContainer {
  tagInfo: TagInfoDependencies;
  post: PostDependencies;
}

export const createDiContainer = (): DiContainer => {
  const postDependencies = createPostDependencies();
  const tagInfoDependencies = createTagInfoDependencies(postDependencies.postRepository);

  return {
    tagInfo: tagInfoDependencies,
    post: postDependencies,
  };
};

export const diContainer = createDiContainer();
