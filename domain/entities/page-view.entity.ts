export interface PageView {
  readonly id: string;
  readonly notionPageId: string;
  readonly pathname: string;
  readonly viewCount: number;
  readonly likeCount: number;
  readonly date: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
