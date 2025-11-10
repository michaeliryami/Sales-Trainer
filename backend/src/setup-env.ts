/**
 * Environment Setup
 * This MUST be imported before anything else
 */
import dotenv from 'dotenv'
import path from 'path'

// In production (Render), environment variables come from the dashboard
// In development, we load from .env file
if (process.env.NODE_ENV === 'production') {
  console.log('✅ Running in PRODUCTION - using environment variables from hosting platform')
} else {
  // Development: load .env file
  const envPath = path.resolve(process.cwd(), '.env')
  const result = dotenv.config({ path: envPath })

  if (result.error) {
    console.error('❌ Failed to load .env file from:', envPath)
    console.error('Error:', result.error.message)
    console.error('\nMake sure you have a .env file in the backend folder!')
    process.exit(1)
  }

  console.log('✅ Environment variables loaded from:', envPath)
}

