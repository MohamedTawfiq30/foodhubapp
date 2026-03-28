import { createClient } from '@supabase/supabase-js';

function readEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string {
  const raw = import.meta.env[name];
  return typeof raw === 'string' ? raw.trim().replace(/^["']|["']$/g, '') : '';
}

const supabaseUrl = readEnv('VITE_SUPABASE_URL').replace(/\/+$/, '');
const supabaseAnonKey = readEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
}

let parsedUrl: URL;
try {
  parsedUrl = new URL(supabaseUrl);
} catch {
  throw new Error('VITE_SUPABASE_URL is not a valid URL. Copy it from Supabase → Project Settings → API.');
}
if (parsedUrl.protocol !== 'https:') {
  throw new Error('VITE_SUPABASE_URL must start with https://');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
