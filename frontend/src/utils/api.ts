/**
 * API utility for making backend requests
 * Automatically uses the correct backend URL based on environment
 */

// Store original fetch before any overrides
const originalFetch = window.fetch

// Get the API base URL
const getApiBaseUrl = (): string => {
  // In development, use relative URLs (Vite proxy handles it)
  if (import.meta.env.DEV) {
    return ''
  }
  
  // In production, use the configured API URL
  const apiUrl = import.meta.env.VITE_API_URL
  
  if (!apiUrl) {
    if (import.meta.env.DEV) console.error('❌ VITE_API_URL is not set! API calls will fail.')
    return ''
  }
  
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
 * Uses original fetch to avoid circular reference
 */
export const apiFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // If it's a string that starts with /api/, prepend the base URL
  if (typeof input === 'string' && input.startsWith('/api/')) {
    const fullUrl = getFullApiUrl(input)
    return originalFetch(fullUrl, init)
  }
  
  // Otherwise, use original fetch
  return originalFetch(input, init)
}

// Export as default for easy import
export default apiFetch

