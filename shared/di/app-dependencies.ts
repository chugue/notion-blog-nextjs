import { createTagDependencies } from './tag-dependencies';

export const diContainer = new Map();

export const registerTagDependencies = () => {
  if (!diContainer.has('tagDependencies')) {
    diContainer.set('tagDependencies', createTagDependencies());
  }
};

export const getTagDependencies = () => diContainer.get('tagDependencies');
