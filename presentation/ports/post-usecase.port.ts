import {
  AboutPost,
  GetPublishedPostParams,
  Post,
  PostMetadata,
  PostMetadataResp,
} from '@/domain/entities/post.entity';

export interface PostUseCasePort {
  readonly getPostPropertiesById: (id: string) => Promise<PostMetadata | null>;
  readonly getAllPublishedPostMetadatas: () => Promise<PostMetadata[]>;
  readonly getPostsWithParams: (params: GetPublishedPostParams) => Promise<PostMetadataResp>;
  readonly getPostById: (id: string) => Promise<Post | null>;
  readonly getAboutPage: (id: string) => Promise<AboutPost | null>;
}
