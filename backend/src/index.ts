// Load environment variables FIRST
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import express from 'express'
import cors from 'cors'
import runsRouter from './routes/runs'
import webhooksRouter from './routes/webhooks'
import assistantsRouter from './routes/assistants'
import templatesRouter from './routes/templates'
import invitesRouter from './routes/invites'
import profilesRouter from './routes/profiles'
import aiRouter from './routes/ai'
import exportRouter from './routes/export'
import analyticsRouter from './routes/analytics'
import assignmentsRouter from './routes/assignments'

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
app.use('/api/templates', templatesRouter)
app.use('/api/invites', invitesRouter)
app.use('/api/profiles', profilesRouter)
app.use('/api/ai', aiRouter)
app.use('/api/export', exportRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/assignments', assignmentsRouter)

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
