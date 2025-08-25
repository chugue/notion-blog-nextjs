import {
  GetPublishedPostParams,
  Post,
  PostMetadata,
  PostMetadataResp,
} from '@/domain/entities/post.entity';

export interface PostUseCasePort {
  readonly getAllPublishedPostMetadatas: () => Promise<PostMetadata[]>;
  readonly getPostsWithParams: (params: GetPublishedPostParams) => Promise<PostMetadataResp>;
  readonly getPostById: (id: string) => Promise<Post | null>;
}
