import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types based on your schema
export interface Template {
  id: number
  created_at: string
  title: string
  description: string
  difficulty: string
  type: string
  script: string
  pdf_path?: string | null
  org?: string | null
  user_id?: string | null
}

export default supabase
