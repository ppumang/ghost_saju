import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;
let browserClient: SupabaseClient | null = null;

/**
 * 서버 전용 Supabase 클라이언트 (service_role key 사용)
 * API 라우트에서 사용
 */
export function createServerSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn('Supabase 환경변수가 설정되지 않았습니다. DB 저장이 비활성화됩니다.');
    return null;
  }

  if (!serverClient) {
    serverClient = createClient(url, key);
  }

  return serverClient;
}

/**
 * 브라우저용 Supabase 클라이언트 (anon key 사용)
 * 클라이언트 컴포넌트에서 사용
 */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(url, key);
  }

  return browserClient;
}
