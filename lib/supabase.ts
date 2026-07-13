import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 브라우저용 anon 클라이언트. env 미설정이면 null → 앱은 seed 폴백으로 동작.
 * 로그인/개인화 없음. hall_of_fame 익명 select/insert + increment_like RPC 만 사용.
 */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export const hasSupabase = Boolean(supabase);
