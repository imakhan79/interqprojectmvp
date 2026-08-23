import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uxyucxiqogdnxbfcmlnx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eXVjeGlxb2dkbnhiZmNtbG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDE1MDEsImV4cCI6MjEwMDIxNzUwMX0.oq6g78sQABTGw3OZEc3DTz_6Wf6AKpQMcxwRv0SvodM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
