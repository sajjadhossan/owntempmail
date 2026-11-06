import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.trim().length > 0 &&
  !supabaseUrl.includes('your-supabase-url') &&
  supabaseAnonKey &&
  supabaseAnonKey.trim().length > 0
);

// Fallback placeholder URL to prevent initialization throw if credentials are not yet supplied
const activeUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const activeKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(activeUrl, activeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return supabaseInstance;
}

export const supabase = getSupabase();
