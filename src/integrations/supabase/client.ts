// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://uxyucxiqogdnxbfcmlnx.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eXVjeGlxb2dkbnhiZmNtbG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDE1MDEsImV4cCI6MjEwMDIxNzUwMX0.oq6g78sQABTGw3OZEc3DTz_6Wf6AKpQMcxwRv0SvodM";

const resolveSupabaseCredentials = () => {
  const storedUrl = localStorage.getItem("SUPABASE_URL");
  const storedKey = localStorage.getItem("SUPABASE_ANON_KEY");

  return {
    url: storedUrl || DEFAULT_SUPABASE_URL,
    key: storedKey || DEFAULT_SUPABASE_ANON_KEY,
  };
};

const createSupabaseClient = (url: string, key: string) =>
  createClient<Database>(url, key, {
    auth: {
      storage: {
        getItem: (key: string) => {
          try {
            return localStorage.getItem(key);
          } catch {
            return null;
          }
        },
        setItem: (key: string, value: string) => {
          try {
            localStorage.setItem(key, value);
          } catch {
            console.error("Failed to save to localStorage");
          }
        },
        removeItem: (key: string) => {
          try {
            localStorage.removeItem(key);
          } catch {
            console.error("Failed to remove from localStorage");
          }
        },
      },
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

const initialCredentials = resolveSupabaseCredentials();
export let supabase = createSupabaseClient(initialCredentials.url, initialCredentials.key);

export const refreshSupabaseConfig = (url?: string, key?: string) => {
  const credentials = {
    url: url || localStorage.getItem("SUPABASE_URL") || DEFAULT_SUPABASE_URL,
    key: key || localStorage.getItem("SUPABASE_ANON_KEY") || DEFAULT_SUPABASE_ANON_KEY,
  };

  if (url && key) {
    localStorage.setItem("SUPABASE_URL", credentials.url);
    localStorage.setItem("SUPABASE_ANON_KEY", credentials.key);
  }

  supabase = createSupabaseClient(credentials.url, credentials.key);
  return supabase;
};

export const getSupabaseClient = () => supabase;

// Helper function to get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const session = await getCurrentSession();
    return !!session;
  } catch {
    return false;
  }
};

// Export types
export type { Database };
