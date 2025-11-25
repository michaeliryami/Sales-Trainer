# Clozone Technical Scaling Guide

## 🚨 Critical (Do First)

### 1. Background Job Queue System
**Current Issue**: `processSessionInBackground()` is fire-and-forget. If server restarts, jobs are lost.

**Solution**: Implement a job queue (BullMQ + Redis or Supabase Queue)

```typescript
// Recommended: BullMQ with Redis
// Install: npm install bullmq ioredis

// Create: backend/src/services/queue.ts
import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export const sessionProcessingQueue = new Queue('session-processing', { connection })

// Worker to process jobs
export const sessionWorker = new Worker('session-processing', async (job) => {
  const { sessionId, userId, assignmentId, transcriptClean, vapiCallId } = job.data
  await processSessionInBackground(sessionId, userId, assignmentId, transcriptClean, vapiCallId)
}, { connection })

// In analytics.ts, replace fire-and-forget with:
await sessionProcessingQueue.add('process-session', {
  sessionId: session.id,
  userId,
  assignmentId,
  transcriptClean,
  vapiCallId: session.vapi_call_id
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
})
```

**Benefits**:
- Jobs survive server restarts
- Retry logic built-in
- Can scale workers horizontally
- Monitor job status

---

### 2. Database Query Optimization
**Current Issue**: Some queries fetch all rows then filter in memory.

**Action Items**:
1. **Add Database Indexes** (Run in Supabase SQL Editor):
```sql
-- Critical indexes for training_sessions
CREATE INDEX IF NOT EXISTS idx_training_sessions_org_id_created ON training_sessions(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id_created ON training_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_assignment_id ON training_sessions(assignment_id) WHERE assignment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_training_sessions_closed ON training_sessions(closed) WHERE closed IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_training_sessions_submitted ON training_sessions(submitted_for_review) WHERE submitted_for_review = true;

-- For session_grades
CREATE INDEX IF NOT EXISTS idx_session_grades_session_id ON session_grades(session_id);
CREATE INDEX IF NOT EXISTS idx_session_grades_user_id_created ON session_grades(user_id, created_at DESC);

-- For templates
CREATE INDEX IF NOT EXISTS idx_templates_org_user ON templates(org, user_id);
```

2. **Optimize Analytics Queries**:
```typescript
// Instead of fetching all sessions then filtering:
// BAD: const { data: sessions } = await supabase.from('training_sessions').select('*').eq('org_id', orgId)
// Then: sessions.filter(s => s.status === 'completed')

// GOOD: Filter in database
const { data: completedSessions } = await supabase
  .from('training_sessions')
  .select('id, status, duration_seconds, closed')
  .eq('org_id', orgId)
  .eq('status', 'completed')
  .gte('created_at', startDate.toISOString())
```

3. **Use Pagination** for large datasets:
```typescript
// For user lists, paginate
const { data: users, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('org_id', orgId)
  .range(page * pageSize, (page + 1) * pageSize - 1)
```

---

### 3. API Rate Limiting
**Current Issue**: No rate limiting - vulnerable to abuse.

**Solution**: Add `express-rate-limit`
```bash
npm install express-rate-limit
```

```typescript
// backend/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // For expensive operations like grading
  message: 'Too many grading requests, please try again later.',
})

// In index.ts:
import { apiLimiter, strictLimiter } from './middleware/rateLimit'
app.use('/api/', apiLimiter)
app.use('/api/analytics/grade-transcript', strictLimiter)
```

---

### 4. Server-Side Caching
**Current Issue**: Only client-side caching. Repeated expensive queries hit DB.

**Solution**: Add Redis caching for analytics
```typescript
// backend/src/services/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export async function getCachedAnalytics(orgId: string, period: string) {
  const key = `analytics:${orgId}:${period}`
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)
  return null
}

export async function setCachedAnalytics(orgId: string, period: string, data: any, ttl = 120) {
  const key = `analytics:${orgId}:${period}`
  await redis.setex(key, ttl, JSON.stringify(data))
}

// In analytics.ts:
const cached = await getCachedAnalytics(orgId, period)
if (cached) return res.json(cached)

// ... fetch data ...

await setCachedAnalytics(orgId, period, result, 120) // 2 min TTL
```

---

## ⚠️ High Priority (Do Soon)

### 5. File Storage Migration
**Current Issue**: Files stored in `backend/uploads/` - won't scale on multiple servers.

**Solution**: Move to Supabase Storage or S3
```typescript
// Use Supabase Storage (already have Supabase)
import { supabase } from '../config/supabase'

// Upload file
const { data, error } = await supabase.storage
  .from('pdf-exports')
  .upload(`${userId}/${filename}`, fileBuffer, {
    contentType: 'application/pdf',
    upsert: false
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('pdf-exports')
  .getPublicUrl(`${userId}/${filename}`)
```

---

### 6. Structured Logging & Monitoring
**Current Issue**: Only `console.log` - hard to debug in production.

**Solution**: Add structured logging
```bash
npm install winston
```

```typescript
// backend/src/services/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

// Replace console.log with:
logger.info('Session saved', { sessionId, userId })
logger.error('Grading failed', { error, sessionId })
```

**Monitoring**: Set up Sentry or similar for error tracking
```bash
npm install @sentry/node
```

---

### 7. Database Connection Pooling
**Current Issue**: Single Supabase client - may hit connection limits.

**Solution**: Supabase handles this, but verify pool settings:
- Check Supabase dashboard → Settings → Database
- Ensure connection pooling is enabled
- Consider using Supabase connection pooler URL for high-traffic routes

---

### 8. OpenAI API Cost Optimization
**Current Issue**: Using `gpt-4o-mini` for all operations - costs add up.

**Optimizations**:
1. **Cache LLM responses** where possible (transcript cleaning, summaries)
2. **Batch operations** when possible
3. **Use streaming** for long responses
4. **Set token limits** appropriately (you already do this)
5. **Monitor usage** via OpenAI dashboard

```typescript
// Cache cleaned transcripts (you already do this in DB - good!)
// Consider also caching grading results for identical transcripts
```

---

## 📈 Medium Priority (Scale When Needed)

### 9. Load Balancing & Horizontal Scaling
**When**: When you have >1000 concurrent users

**Setup**:
1. Deploy multiple backend instances
2. Use a load balancer (AWS ALB, Cloudflare, or nginx)
3. Ensure stateless backend (you are - good!)
4. Use shared Redis for sessions/cache

---

### 10. CDN for Static Assets
**Current**: Frontend assets served directly

**Solution**: Use Vercel/Netlify (you might already) or Cloudflare CDN
- Faster global delivery
- Reduced server load
- Better caching

---

### 11. Database Read Replicas
**When**: When analytics queries slow down main DB

**Solution**: Supabase supports read replicas
- Route analytics queries to read replica
- Keep writes on primary

---

### 12. Webhook Retry Logic
**Current**: VAPI webhooks might fail silently

**Solution**: Add retry queue for webhooks
```typescript
// Similar to session processing queue
export const webhookQueue = new Queue('webhook-processing', { connection })
```

---

## 🔧 Infrastructure Checklist

### Environment Variables Needed:
```bash
# Redis (for queues and caching)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Supabase (already have)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

### Deployment Considerations:
1. **Health Checks**: You have `/api/health` - good! Add more detailed checks
2. **Graceful Shutdown**: Handle SIGTERM to finish jobs before shutdown
3. **Process Manager**: Use PM2 or similar in production
4. **Auto-scaling**: Set up based on CPU/memory metrics

---

## 📊 Monitoring & Alerts

### Key Metrics to Track:
1. **API Response Times** (p50, p95, p99)
2. **Database Query Performance**
3. **OpenAI API Costs** (daily/weekly)
4. **Job Queue Depth** (if using queues)
5. **Error Rates** (by endpoint)
6. **Active Users** (concurrent sessions)

### Tools:
- **Application**: Sentry, Datadog, or New Relic
- **Infrastructure**: Supabase dashboard, Vercel analytics
- **Costs**: OpenAI usage dashboard

---

## 🎯 Quick Wins (Do These First)

1. ✅ Add database indexes (5 minutes, huge impact)
2. ✅ Add rate limiting (10 minutes, prevents abuse)
3. ✅ Add Redis caching for analytics (30 minutes)
4. ✅ Move to job queue for background processing (1 hour)
5. ✅ Add structured logging (30 minutes)

---

## 📝 Notes

- **Supabase**: Already handles connection pooling, backups, and scaling
- **Current Architecture**: Stateless backend is good for scaling
- **Frontend**: Already using caching (localStorage) - good!
- **File Storage**: Needs migration before multi-server deployment

---

## 🚀 Scaling Timeline

**Week 1**: Indexes, rate limiting, caching
**Week 2**: Job queue, structured logging
**Week 3**: File storage migration, monitoring
**Month 2+**: Load balancing, read replicas (if needed)

