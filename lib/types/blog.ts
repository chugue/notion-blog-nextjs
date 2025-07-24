export interface TagFilterItem {
  id: string;
  name: string;
  count: number;
}

export interface PostMetadata {
  id: string;
  title: string;
  coverImage?: string;
  tool: string[];
  author: string;
  date: string;
  language: string[];
}

export interface TocEntry {
  value: string;
  depth: number;
  id?: string;
  children?: Array<TocEntry>;
}
