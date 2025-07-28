export interface TagFilterItem {
  id: string;
  name: string;
  count: number;
}

export interface PostMetadata {
  readonly id: string;
  readonly title: string;
  readonly coverImage?: string;
  readonly tool: string[];
  readonly author: string;
  readonly date: string;
  readonly language: string[];
}

export interface TocEntry {
  value: string;
  depth: number;
  id?: string;
  children?: Array<TocEntry>;
}

export interface TechStackItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  tagName: string;
}

export interface GetPostByIdResp {
  markdown: string;
  post: PostMetadata | null;
}
