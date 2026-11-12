/// <reference types="vite/client" />

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const viteEnv = import.meta.env ?? ({} as ImportMetaEnv);
const supabaseUrl = viteEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = viteEnv.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Configura el archivo .env.local.",
    );
  }

  return supabase;
}
