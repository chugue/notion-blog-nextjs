export interface PageView {
  readonly id: string;
  readonly notionPageId: string;
  readonly pathname: string;
  readonly viewCount: number;
  readonly likeCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
