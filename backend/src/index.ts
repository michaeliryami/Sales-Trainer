// Load environment variables FIRST
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import runsRouter from './routes/runs'
import webhooksRouter from './routes/webhooks'
import assistantsRouter from './routes/assistants'

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Get VAPI public key for frontend
app.get('/api/config', (req, res) => {
  res.json({ 
    vapiPublicKey: process.env.VAPI_PUBLIC_KEY || process.env.VAPI_API_KEY 
  })
})

// Routes
app.use('/api/runs', runsRouter)
app.use('/api/webhooks', webhooksRouter)
app.use('/api/assistants', assistantsRouter)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})
