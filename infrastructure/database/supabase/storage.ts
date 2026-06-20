import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 서버 전용 스토리지 클라이언트. 업로드는 RLS를 우회하는 service-role 키가 필요하다.
// 키가 없으면 null → 이미지 캐시는 비활성(베스트 에포트)되고 기존 Notion 페치로 폴백한다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const NOTION_IMAGE_BUCKET = 'notion-images';

export const storageClient: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
    : null;
