import { MdBlock } from 'notion-to-md/build/types';

export interface TagFilterItem {
  id: string;
  name: string;
  count: number;
}

export interface PostMetadata {
  readonly id: string;
  readonly title: string;
  readonly coverImage?: string;
  readonly author: string;
  readonly date: string;
  readonly tag: string[];
}

export interface TocEntry {
  value: string;
  depth: number;
  id?: string;
  children?: Array<TocEntry>;
}

export interface Post {
  readonly mdBlocks: MdBlock[];
  readonly markdown: string;
  readonly post: PostMetadata | null;
}

export interface PostMetadataResp {
  posts: PostMetadata[];
  hasMore: boolean;
  nextCursor: string;
}

export interface GetPublishedPostParams {
  tag?: string;
  sort?: string;
  pageSize?: number;
  startCursor?: string;
}
