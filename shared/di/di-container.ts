import { BatchDependencies, createBatchDependencies } from './batch-dependencies';
import { PageViewDependencies, createPageViewDependencies } from './page-view-dependencies';
import { PostDependencies, createPostDependencies } from './post-dependencies';
import { SiteMetricDependencies, createSiteMetricDependencies } from './site-metric-dependencies';
import { TagInfoDependencies, createTagInfoDependencies } from './tag-info-dependencies';

export interface DiContainer {
  tagInfo: TagInfoDependencies;
  post: PostDependencies;
  pageView: PageViewDependencies;
  siteMetric: SiteMetricDependencies;
  batch: BatchDependencies;
}

// 전역 타입 선언
declare global {
  var __diContainer: DiContainer | undefined;
}

export const createDiContainer = (): DiContainer => {
  const postDependencies = createPostDependencies();
  const tagInfoDependencies = createTagInfoDependencies(postDependencies.postRepository);
  const pageViewDependencies = createPageViewDependencies();
  const siteMetricDependencies = createSiteMetricDependencies();
  const batchDependencies = createBatchDependencies();
  return {
    tagInfo: tagInfoDependencies,
    post: postDependencies,
    pageView: pageViewDependencies,
    siteMetric: siteMetricDependencies,
    batch: batchDependencies,
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
