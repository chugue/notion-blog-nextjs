export interface Tag {
  id: string;
  name: string;
  count: number;
}

export interface TagResponse {
  tags: Tag[];
  lastUpdated: string;
}
