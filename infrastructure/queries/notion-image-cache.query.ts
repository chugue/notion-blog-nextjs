import { NOTION_IMAGE_BUCKET, storageClient } from '@/infrastructure/database/supabase/storage';

interface CachedImage {
  buffer: Buffer;
  contentType: string;
}

// recordMap 캐시와 같은 패턴의 이미지 캐시: 스토리지에 있으면 그걸 쓰고, 없으면 Notion에서
// 받아 업로드한다. 스토리지 장애/미설정은 절대 렌더를 막지 않는다(미스/무시로 폴백).
const notionImageCache = {
  get: async (key: string): Promise<CachedImage | null> => {
    if (!storageClient) return null;

    try {
      const { data, error } = await storageClient.storage.from(NOTION_IMAGE_BUCKET).download(key);
      if (error || !data) return null;

      const buffer = Buffer.from(await data.arrayBuffer());
      return { buffer, contentType: data.type || 'image/png' };
    } catch (error) {
      console.log('[notion-image-cache] read miss (falling back to Notion):', error);
      return null;
    }
  },

  put: async (key: string, buffer: Buffer, contentType: string): Promise<void> => {
    if (!storageClient) return;

    try {
      await storageClient.storage
        .from(NOTION_IMAGE_BUCKET)
        .upload(key, buffer, { contentType, upsert: true });
    } catch (error) {
      console.log('[notion-image-cache] write failed (non-fatal):', error);
    }
  },
};

export default notionImageCache;
