export interface TagFilterItem {
  id: string;
  name: string;
  count: number;
}

export interface Post {
  id: string;
  title: string;
  coverImage?: string;
  tool: string[];
  author: string;
  date: string;
  language: string[];
}
