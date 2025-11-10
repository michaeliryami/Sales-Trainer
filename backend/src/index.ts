// CRITICAL: Load environment variables FIRST
import './setup-env'

// NOW import everything else (after env vars are loaded)
import express from 'express'
import cors from 'cors'
import { config } from './config/environment'
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

// Middleware
// Configure CORS based on environment
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)
    
    // If wildcard is set, allow all origins
    if (config.corsOrigins.includes('*')) {
      return callback(null, true)
    }
    
    // If no CORS origins configured
    if (config.corsOrigins.length === 0) {
      // Allow all in development, reject in production
      if (config.isDevelopment) {
        return callback(null, true)
      } else {
        return callback(new Error('CORS not configured'))
      }
    }
    
    // Check if origin is in allowed list
    if (config.corsOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    // Reject
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware (development only)
if (config.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
  })
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: config.env,
    timestamp: new Date().toISOString()
  })
})

// Get public configuration for frontend
app.get('/api/config', (req, res) => {
  res.json({ 
    vapiPublicKey: config.vapi.publicKey,
    environment: config.env
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
  // Log full stack in development, minimal in production
  if (config.isDevelopment) {
    console.error('❌ Error:', err.stack)
  } else {
    console.error('❌ Error:', err.message)
  }
  
  res.status(500).json({ 
    error: config.isDevelopment ? err.message : 'Something went wrong!'
  })
})

// 404 handler
app.use('*', (req, res) => {
  if (config.isDevelopment) {
    console.log(`⚠️  404: ${req.method} ${req.originalUrl}`)
  }
  res.status(404).json({ error: 'Route not found' })
})

app.listen(config.port, () => {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🚀 Clozone API Server - ${config.env.toUpperCase()}`)
  console.log(`${'='.repeat(60)}`)
  console.log(`   Server: http://localhost:${config.port}`)
  console.log(`   Health: http://localhost:${config.port}/api/health`)
  console.log(`   Status: Ready to accept requests`)
  console.log(`${'='.repeat(60)}\n`)
})
