import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';

const url = CONFIG.SUPABASE_URL || 'https://placeholder.supabase.co';
const key = CONFIG.SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const isSupabaseConfigured = () => {
  return Boolean(
    CONFIG.SUPABASE_URL && 
    CONFIG.SUPABASE_ANON_KEY && 
    !CONFIG.SUPABASE_URL.includes('placeholder')
  );
};
