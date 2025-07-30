
import { Post, PostMetadata } from '@/domain/entities/blog.entity';
import { NotionPost } from '@/domain/entities/notion.entity';

export const toPost = (notionPost: NotionPost): Post => {
  return {
    metadata: {
      id: notionPost.id,
      title: notionPost.properties.title.title[0].plain_text,
      author: notionPost.properties.author.rich_text[0].plain_text,
      date: notionPost.properties.date.date.start,
      tag: notionPost.properties.tag.multi_select.map((tag) => tag.name),
    },
    content: '',
  };
};

export const toPostMetadata = (notionPost: NotionPost): PostMetadata => {
  return {
    id: notionPost.id,
    title: notionPost.properties.title.title[0].plain_text,
    author: notionPost.properties.author.rich_text[0].plain_text,
    date: notionPost.properties.date.date.start,
    tag: notionPost.properties.tag.multi_select.map((tag) => tag.name),
  };
};

export const toPosts = (notionPosts: NotionPost[]): Post[] => {
  return notionPosts.map(toPost);
};

export const toPostsMetadata = (notionPosts: NotionPost[]): PostMetadata[] => {
  return notionPosts.map(toPostMetadata);
};

export const sortByDate = (posts: PostMetadata[]): PostMetadata[] => {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const filterByTag = (posts: PostMetadata[], tag: string): PostMetadata[] => {
  if (tag === 'all') return posts;
  return posts.filter((post) => post.tag.includes(tag));
};

export const filterBySearch = (posts: PostMetadata[], search: string): PostMetadata[] => {
  if (search === '') return posts;
  return posts.filter((post) => post.title.toLowerCase().includes(search.toLowerCase()));
};

export const getPostBySlug = (posts: PostMetadata[], slug: string): PostMetadata | undefined => {
  return posts.find((post) => post.id === slug);
};

export const getRelatedPosts = (posts: PostMetadata[], currentPost: PostMetadata): PostMetadata[] => {
  const relatedPosts = posts.filter((post) => {
    if (post.id === currentPost.id) return false;
    return post.tag.some((tag) => currentPost.tag.includes(tag));
  });

  return relatedPosts.slice(0, 3);
};

export const getPaginationPosts = (posts: PostMetadata[], page: number, limit: number): PostMetadata[] => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return posts.slice(startIndex, endIndex);
};

export const getPaginationCount = (posts: PostMetadata[], limit: number): number => {
  return Math.ceil(posts.length / limit);
};

export const getTagsFromPosts = (posts: PostMetadata[]): string[] => {
  const tags = posts.flatMap((post) => post.tag);
  return [...new Set(tags)];
};

export const getTagsWithCount = (posts: PostMetadata[]): { [key: string]: number } => {
  const tags = posts.flatMap((post) => post.tag);
  return tags.reduce(
    (acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    },
    {} as { [key: string]: number },
  );
};

export const getTagsWithCountArray = (posts: PostMetadata[]): { name: string; count: number }[] => {
  const tags = getTagsWithCount(posts);
  return Object.entries(tags).map(([name, count]) => ({ name, count }));
};

export const getTagsWithCountArraySorted = (posts: PostMetadata[]): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => b.count - a.count);
};

export const getTagsWithCountArraySortedByTagName = (posts: PostMetadata[]): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => a.name.localeCompare(b.name));
};

export const getTagsWithCountArraySortedByTagNameDesc = (posts: PostMetadata[]): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => b.name.localeCompare(a.name));
};

export const getTagsWithCountArraySortedByCountDesc = (posts: PostMetadata[]): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => b.count - a.count);
};

export const getTagsWithCountArraySortedByCountAsc = (posts: PostMetadata[]): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => a.count - b.count);
};

export const getTagsWithCountArraySortedByTagNameAndCountDesc = (
  posts: PostMetadata[],
): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => {
    if (a.name > b.name) return -1;
    if (a.name < b.name) return 1;
    return b.count - a.count;
  });
};

export const getTagsWithCountArraySortedByTagNameAndCountAsc = (
  posts: PostMetadata[],
): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return a.count - b.count;
  });
};

export const getTagsWithCountArraySortedByCountAndTagNameDesc = (
  posts: PostMetadata[],
): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => {
    if (a.count > b.count) return -1;
    if (a.count < b.count) return 1;
    return b.name.localeCompare(a.name);
  });
};

export const getTagsWithCountArraySortedByCountAndTagNameAsc = (
  posts: PostMetadata[],
): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => {
    if (a.count < b.count) return -1;
    if (a.count > b.count) return 1;
    return a.name.localeCompare(b.name);
  });
};

export const getTagsWithCountArraySortedBy = (
  posts: PostMetadata[],
  sortBy: 'name' | 'count',
  sortOrder: 'asc' | 'desc',
): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    return sortOrder === 'asc' ? a.count - b.count : b.count - a.count;
  });
};

export const getTagsWithCountArraySortedByMultiple = (
  posts: PostMetadata[],
  sortBy: ('name' | 'count')[],
  sortOrder: ('asc' | 'desc')[],
): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => {
    for (let i = 0; i < sortBy.length; i++) {
      const key = sortBy[i];
      const order = sortOrder[i];
      if (key === 'name') {
        const result = order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        if (result !== 0) return result;
      } else {
        const result = order === 'asc' ? a.count - b.count : b.count - a.count;
        if (result !== 0) return result;
      }
    }
    return 0;
  });
};

export const getTagsWithCountArraySortedByMultipleWith = (
  posts: PostMetadata[],
  sorts: { by: 'name' | 'count'; order: 'asc' | 'desc' }[],
): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => {
    for (const sort of sorts) {
      const { by, order } = sort;
      if (by === 'name') {
        const result = order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        if (result !== 0) return result;
      } else {
        const result = order === 'asc' ? a.count - b.count : b.count - a.count;
        if (result !== 0) return result;
      }
    }
    return 0;
  });
};

export const getTagsWithCountArraySortedWith = (
  posts: PostMetadata[],
  sorts: { by: 'name' | 'count'; order: 'asc' | 'desc' }[],
): { name: string; count: number }[] => {
  const tags = getTagsWithCountArray(posts);
  return tags.sort((a, b) => {
    for (const sort of sorts) {
      const { by, order } = sort;
      if (by === 'name') {
        const result = order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        if (result !== 0) return result;
      } else {
        const result = order === 'asc' ? a.count - b.count : b.count - a.count;
        if (result !== 0) return result;
      }
    }
    return 0;
  });
};
