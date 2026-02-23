import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/** Ensure we have a session (anonymous auth for zero-friction MVP) */
export async function ensureSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return
  await supabase.auth.signInAnonymously()
}

// Database types
export type PostStatus = 'active' | 'done'
export type PostVisibility = 'private' | 'friends' | 'public'

export interface Post {
  id: string
  user_id: string
  content: string
  status: PostStatus
  is_processed: boolean
  visibility: PostVisibility
  scheduled_for: string
  created_at: string
}
