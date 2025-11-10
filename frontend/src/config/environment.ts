/**
 * Frontend Environment Configuration
 * Auto-detects development vs production based on hostname
 */

export type Environment = 'development' | 'production'

export interface FrontendConfig {
  env: Environment
  isDevelopment: boolean
  isProduction: boolean
  apiUrl: string
  supabase: {
    url: string
    anonKey: string
  }
}

// Auto-detect environment based on hostname
const detectEnvironment = (): Environment => {
  // Check Vite's built-in mode first
  if (import.meta.env.MODE === 'production') {
    return 'production'
  }
  if (import.meta.env.MODE === 'development') {
    return 'development'
  }
  
  // Check if running on localhost
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development'
  }
  
  // Default to production
  return 'production'
}

const env = detectEnvironment()
const isDevelopment = env === 'development'
const isProduction = env === 'production'

// Configure API URL based on environment
const getApiUrl = (): string => {
  // If explicitly set in env, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // In development, use Vite proxy (relative path)
  if (isDevelopment) {
    return '' // Empty string uses the Vite proxy configured in vite.config.ts
  }
  
  // In production, must be explicitly set
  console.error('⚠️  VITE_API_URL not set in production environment!')
  return ''
}

// Validate required environment variables
const validateConfig = () => {
  const required = [
    { key: 'VITE_SUPABASE_URL', value: import.meta.env.VITE_SUPABASE_URL },
    { key: 'VITE_SUPABASE_ANON_KEY', value: import.meta.env.VITE_SUPABASE_ANON_KEY },
  ]
  
  const missing = required.filter(({ value }) => !value).map(({ key }) => key)
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`)
    console.error('Please create a .env.local file with the required variables')
    console.error('See .env.example for reference')
  }
  
  // In production, API URL is required
  if (isProduction && !import.meta.env.VITE_API_URL) {
    console.error('❌ VITE_API_URL must be set in production!')
  }
}

// Validate on startup
validateConfig()

export const config: FrontendConfig = {
  env,
  isDevelopment,
  isProduction,
  apiUrl: getApiUrl(),
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
}

// Log configuration on startup (development only)
if (isDevelopment) {
  console.log('🔧 Frontend Configuration:')
  console.log(`   Environment: ${config.env}`)
  console.log(`   API URL: ${config.apiUrl || 'Using Vite proxy'}`)
  console.log(`   Supabase: ${config.supabase.url}`)
  console.log(`   Hostname: ${window.location.hostname}`)
}

