import { createClient } from '@supabase/supabase-js';

// We initialize a client if keys exist in localStorage, to support dynamic setup
let supabaseClient: ReturnType<typeof createClient> | null = null;

export const initSupabase = (url: string, key: string) => {
  if (!url || !key) return null;
  try {
    supabaseClient = createClient(url, key);
    return supabaseClient;
  } catch (e) {
    console.error("Failed to init Supabase", e);
    return null;
  }
};

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  
  // Try to load from localStorage as fallback
  const savedUrl = localStorage.getItem('supabase_url');
  const savedKey = localStorage.getItem('supabase_anon_key');
  
  if (savedUrl && savedKey) {
    return initSupabase(savedUrl, savedKey);
  }
  
  return null;
};
