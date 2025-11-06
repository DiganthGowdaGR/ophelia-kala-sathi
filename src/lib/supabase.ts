import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// In development we prefer a warn rather than throwing during module import because
// throwing here will cause dynamic imports to fail at fetch time and break the dev server.
if (!supabaseUrl || !supabaseAnonKey) {
  // Provide a helpful developer message and export a harmless fallback client.
  // Consumers will still get runtime errors when they call the client if envs are missing,
  // but the module import will not crash the bundler.
  // To fix: create a .env.local file at project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
  // Example:
  // VITE_SUPABASE_URL=https://your-project.supabase.co
  // VITE_SUPABASE_ANON_KEY=your-anon-key
  // (Then restart the dev server)
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Supabase client will be initialized with placeholder values.');
}

const effectiveUrl = supabaseUrl ?? 'http://localhost:54321';
const effectiveKey = supabaseAnonKey ?? '';

export const supabase = createClient(effectiveUrl, effectiveKey);
