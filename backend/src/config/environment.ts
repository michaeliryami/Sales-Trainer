/**
 * Environment Configuration
 * Auto-detects development vs production and provides type-safe config
 */

export type Environment = 'development' | 'production'

export interface AppConfig {
  env: Environment
  isDevelopment: boolean
  isProduction: boolean
  port: number
  corsOrigins: string[]
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  supabase: {
    url: string
    anonKey: string
    serviceKey: string
  }
  openai: {
    apiKey: string
  }
  vapi: {
    apiKey: string
    publicKey: string
  }
}

// Auto-detect environment
const detectEnvironment = (): Environment => {
  // If NODE_ENV is explicitly set, use it
  if (process.env.NODE_ENV === 'production') {
    return 'production'
  }
  if (process.env.NODE_ENV === 'development') {
    return 'development'
  }
  
  // Auto-detect based on port (if running on standard dev port, assume dev)
  const port = process.env.PORT || '3002'
  if (port === '3002') {
    return 'development'
  }
  
  // Default to production for safety
  return 'production'
}

const env = detectEnvironment()
const isDevelopment = env === 'development'
const isProduction = env === 'production'

// Parse CORS origins
const parseCorsOrigins = (): string[] => {
  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  }
  
  // Default CORS based on environment
  if (isDevelopment) {
    return ['http://localhost:3000', 'http://localhost:3001']
  }
  
  // In production, must be explicitly set for security
  return []
}

// Validate required environment variables
const validateConfig = () => {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'OPENAI_API_KEY',
    'VAPI_API_KEY'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`)
    console.error('Please check your .env file')
    process.exit(1)
  }
}

// Validate on startup
validateConfig()

export const config: AppConfig = {
  env,
  isDevelopment,
  isProduction,
  port: parseInt(process.env.PORT || '3002', 10),
  corsOrigins: parseCorsOrigins(),
  logLevel: (process.env.LOG_LEVEL as AppConfig['logLevel']) || (isDevelopment ? 'debug' : 'info'),
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  vapi: {
    apiKey: process.env.VAPI_API_KEY!,
    publicKey: process.env.VAPI_PUBLIC_KEY || process.env.VAPI_API_KEY!,
  },
}

// Log configuration on startup (without sensitive data)
console.log('🔧 Environment Configuration:')
console.log(`   Environment: ${config.env}`)
console.log(`   Port: ${config.port}`)
console.log(`   CORS Origins: ${config.corsOrigins.join(', ') || 'None (will reject all cross-origin requests)'}`)
console.log(`   Log Level: ${config.logLevel}`)
console.log(`   Supabase: ${config.supabase.url}`)
console.log(`   OpenAI: ${config.openai.apiKey ? '✓ Configured' : '✗ Missing'}`)
console.log(`   VAPI: ${config.vapi.apiKey ? '✓ Configured' : '✗ Missing'}`)

