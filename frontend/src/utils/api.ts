/**
 * API utility for making backend requests
 * Automatically uses the correct backend URL based on environment
 */

// Get the API base URL
const getApiBaseUrl = (): string => {
  // In development, use relative URLs (Vite proxy handles it)
  if (import.meta.env.DEV) {
    console.log('🔧 [API] Running in DEVELOPMENT mode - using Vite proxy')
    return ''
  }
  
  // In production, use the configured API URL
  const apiUrl = import.meta.env.VITE_API_URL
  
  console.log('🔧 [API] Running in PRODUCTION mode')
  console.log('🔧 [API] VITE_API_URL =', apiUrl || '❌ NOT SET')
  console.log('🔧 [API] import.meta.env.MODE =', import.meta.env.MODE)
  console.log('🔧 [API] import.meta.env.DEV =', import.meta.env.DEV)
  console.log('🔧 [API] import.meta.env.PROD =', import.meta.env.PROD)
  
  if (!apiUrl) {
    console.error('❌ VITE_API_URL is not set! API calls will fail.')
    console.error('❌ All API calls will go to Vercel instead of backend!')
    return ''
  }
  
  console.log('✅ [API] Will route all /api/ calls to:', apiUrl)
  return apiUrl
}

const API_BASE_URL = getApiBaseUrl()

/**
 * Get the full API URL for a given endpoint
 */
export const getFullApiUrl = (endpoint: string): string => {
  if (!endpoint.startsWith('/api/')) {
    return endpoint // Not an API call, return as-is
  }
  
  return `${API_BASE_URL}${endpoint}`
}

/**
 * Enhanced fetch that automatically handles API URLs
 * Drop-in replacement for native fetch()
 */
export const apiFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // If it's a string that starts with /api/, prepend the base URL
  if (typeof input === 'string' && input.startsWith('/api/')) {
    const fullUrl = getFullApiUrl(input)
    
    // Always log API calls for debugging
    console.log(`🌐 [API] ${init?.method || 'GET'} ${input} → ${fullUrl || '(relative URL)'}`)
    
    return fetch(fullUrl, init)
  }
  
  // Otherwise, use native fetch
  return fetch(input, init)
}

// Export as default for easy import
export default apiFetch

