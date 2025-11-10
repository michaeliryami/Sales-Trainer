/**
 * Environment Setup
 * This MUST be imported before anything else
 */
import dotenv from 'dotenv'
import path from 'path'

// Determine .env path
const envPath = process.env.NODE_ENV === 'production' 
  ? path.resolve(__dirname, '../.env')
  : path.resolve(process.cwd(), '.env')

// Load .env file
const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error('❌ Failed to load .env file from:', envPath)
  console.error('Error:', result.error.message)
  console.error('\nMake sure you have a .env file in the backend folder!')
  process.exit(1)
}

console.log('✅ Environment variables loaded from:', envPath)

