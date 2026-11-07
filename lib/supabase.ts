import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_DEFAULT_URL = 'https://pwalrxmybjgqldzcfozk.supabase.co';
export const SUPABASE_DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3YWxyeG15YmpncWxkemNmb3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NDgwNDgsImV4cCI6MjEwOTUyNDA0OH0.3VDB-vC_PVV23jJPziT2-CfKy6hfg2x0A5j1V7H_VKM';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_DEFAULT_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.trim().length > 0 &&
  !supabaseUrl.includes('your-project.supabase.co') &&
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
