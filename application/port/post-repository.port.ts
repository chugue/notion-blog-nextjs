import {
  GetPublishedPostParams,
  Post,
  PostMetadata,
  PostMetadataResp,
} from '@/domain/entities/post.entity';
import { Result } from '@/shared/types/result';

export interface PostRepositoryPort {
  readonly getAllPublishedPosts: () => Promise<Result<PostMetadata[]>>;
  readonly getPostsWithParams: (
    params: GetPublishedPostParams
  ) => Promise<Result<PostMetadataResp>>;
  readonly getPostById: (id: string) => Promise<Result<Post>>;
}
