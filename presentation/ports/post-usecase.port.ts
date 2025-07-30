import { Post, PostMetadata } from '@/domain/entities/blog.entity';
import { GetPublishedPostParams, PostMetadataResp } from '@/shared/types/notion';

export interface PostUseCasePort {
  readonly getAllPublishedPostMetadatas: () => Promise<PostMetadata[]>;
  readonly getPublishedPosts: (params: GetPublishedPostParams) => Promise<PostMetadataResp>;
  readonly getPostById: (id: string) => Promise<Post | null>;
}
