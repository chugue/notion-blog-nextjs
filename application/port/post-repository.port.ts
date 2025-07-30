import { Post } from '@/domain/entities/blog.entity';
import { GetPublishedPostParams, PostMetadataResp } from '@/shared/types/notion';
import { Result } from '@/shared/types/result';

export interface PostRepositoryPort {
  readonly getPublishedPosts: (params: GetPublishedPostParams) => Promise<Result<PostMetadataResp>>;
  readonly getPostById: (id: string) => Promise<Result<Post>>;
}
