import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

// Lazy initialization function
function getSupabaseClient(): SupabaseClient {
  if (_supabase) {
    return _supabase
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables missing:', {
      SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
      SUPABASE_ANON_KEY: supabaseKey ? 'Set' : 'Missing'
    })
    throw new Error('Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.')
  }

  _supabase = createClient(supabaseUrl, supabaseKey)
  return _supabase
}

// Export getter function instead of direct client
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient()
    return (client as any)[prop]
  }
})

// Database types based on your schema
export interface Template {
  id: number
  created_at: string
  title: string
  description: string
  difficulty: string
  type: string
  script: string
}

export default supabase
