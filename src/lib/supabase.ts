import { createClient as _createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export function createClient() {
  return _createClient(SUPABASE_URL, SUPABASE_KEY)
}

export const supabase = createClient()
