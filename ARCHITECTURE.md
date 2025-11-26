# Sales-Trainer Architecture & Scaling Guide

## System Overview

Sales-Trainer is an AI-powered sales training platform that combines real-time voice calls (via VAPI), AI-driven grading (via OpenAI), and comprehensive analytics to help sales teams improve their skills.

---

## Core Services

### 1. **Call Service (VAPI Integration)**

#### Current Architecture
- **Provider**: VAPI (Voice AI Platform)
- **Flow**:
  1. User initiates a call from the frontend
  2. Frontend requests a VAPI call token from our backend
  3. VAPI handles the voice conversation with an AI customer persona
  4. Call transcript is streamed in real-time
  5. When call ends, transcript is sent to our backend for processing

#### Key Files
- `backend/src/services/vapi.ts` - VAPI service wrapper
- `frontend/src/components/CreateSession.tsx` - Call initiation UI
- `backend/src/routes/analytics.ts` - Post-call processing

#### Current Limitations
- **Synchronous Processing**: After a call ends, we immediately process transcript cleaning, summarization, and grading
- **No Queue System**: If 100 users end calls simultaneously, all processing happens at once
- **Rate Limits**: OpenAI API has rate limits (tokens per minute, requests per minute)
- **Timeout Risk**: Long transcripts can cause HTTP timeouts during processing

---

### 2. **Analytics Service**

#### Current Architecture
- **Database**: Supabase (PostgreSQL)
- **Caching**: LocalStorage (2-minute TTL)
- **Endpoints**:
  - `GET /api/analytics/admin/:orgId` - Organization-wide analytics
  - `GET /api/analytics/employee/:userId` - Individual user analytics

#### Data Flow
1. **Session Creation**:
   - Call ends → Transcript saved to `training_sessions` table
   - Background processing starts (non-blocking)
   
2. **Background Processing** (`processSessionInBackground`):
   - Step 1: Fetch recording URL from VAPI (with retries)
   - Step 2: Clean transcript with OpenAI
   - Step 3: Generate AI summary
   - Step 4: Auto-grade against rubric
   - Step 5: Determine "close" status

3. **Analytics Calculation**:
   - Fetches sessions, grades, and user metrics
   - Filters by time range, user, assignment
   - Calculates aggregates (avg score, cloze rate, skills breakdown)
   - Returns structured data to frontend

#### Current Limitations
- **Fire-and-Forget Background Jobs**: No retry mechanism if processing fails
- **No Job Visibility**: Can't track if a session is "still processing" vs "failed"
- **Database Load**: Complex queries with multiple joins and aggregations
- **No Caching Layer**: Every analytics request hits the database
- **LocalStorage Only**: No server-side caching for frequently accessed data

---

## Scaling to 100s of Users

### **Critical Bottlenecks**

1. **OpenAI Rate Limits**
   - Current: ~10,000 tokens/min on gpt-4o-mini
   - Problem: 10 concurrent calls ending = potential rate limit hit
   
2. **Synchronous Processing**
   - Current: Processing blocks until complete
   - Problem: User waits for grading to finish before seeing results

3. **Database Queries**
   - Current: No indexes on frequently queried columns
   - Problem: Slow analytics queries as data grows

4. **No Horizontal Scaling**
   - Current: Single Node.js server
   - Problem: CPU-bound tasks (AI processing) block other requests

---

## Recommended Scaling Strategy

### **Phase 1: Immediate Improvements (1-2 weeks)**

#### 1.1 Add Database Indexes
```sql
-- Already created in database_indexes.sql
CREATE INDEX idx_training_sessions_user_created ON training_sessions(user_id, created_at DESC);
CREATE INDEX idx_training_sessions_org_created ON training_sessions(org_id, created_at DESC);
CREATE INDEX idx_session_grades_session ON session_grades(session_id);
CREATE INDEX idx_training_sessions_assignment ON training_sessions(assignment_id) WHERE assignment_id IS NOT NULL;
```

#### 1.2 Implement Job Queue (BullMQ + Redis)
**Why**: Decouple call processing from HTTP requests

**Implementation**:
```typescript
// backend/src/queues/sessionProcessing.ts
import { Queue, Worker } from 'bullmq';

const sessionQueue = new Queue('session-processing', {
  connection: { host: 'localhost', port: 6379 }
});

// Add job when session is created
await sessionQueue.add('process-session', {
  sessionId,
  userId,
  assignmentId,
  transcriptClean,
  vapiCallId
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 }
});

// Worker processes jobs
const worker = new Worker('session-processing', async (job) => {
  await processSessionInBackground(job.data);
}, { connection: { host: 'localhost', port: 6379 } });
```

**Benefits**:
- Automatic retries on failure
- Rate limiting (process N jobs per minute)
- Job status tracking
- Horizontal scaling (add more workers)

#### 1.3 Add Server-Side Caching (Redis)
**Why**: Reduce database load for frequently accessed analytics

```typescript
// Cache analytics for 5 minutes
const cacheKey = `analytics:${orgId}:${period}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// ... fetch from DB ...
await redis.setex(cacheKey, 300, JSON.stringify(analyticsData));
```

---

### **Phase 2: Architecture Improvements (2-4 weeks)**

#### 2.1 Separate Processing Service
**Current**: Single Node.js server handles API + background processing
**Improved**: Split into two services

```
┌─────────────────┐
│   API Server    │ ← Handles HTTP requests
│  (Express.js)   │ ← Adds jobs to queue
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Redis  │ ← Job queue
    └────┬───┘
         │
         ▼
┌─────────────────┐
│ Worker Service  │ ← Processes sessions
│  (Node.js)      │ ← Calls OpenAI
└─────────────────┘
```

**Benefits**:
- API server stays responsive
- Scale workers independently
- Isolate failures (worker crash doesn't affect API)

#### 2.2 Implement Rate Limiting
```typescript
// Limit OpenAI calls to 50/minute
const limiter = new Bottleneck({
  reservoir: 50,
  reservoirRefreshAmount: 50,
  reservoirRefreshInterval: 60 * 1000
});

const gradingCompletion = await limiter.schedule(() =>
  openai.chat.completions.create({ ... })
);
```

#### 2.3 Add Materialized Views for Analytics
**Why**: Pre-compute expensive aggregations

```sql
CREATE MATERIALIZED VIEW user_performance_summary AS
SELECT 
  user_id,
  COUNT(*) as total_sessions,
  AVG(percentage) as avg_score,
  MAX(created_at) as last_session
FROM training_sessions ts
LEFT JOIN session_grades sg ON ts.id = sg.session_id
GROUP BY user_id;

-- Refresh every hour
CREATE INDEX ON user_performance_summary(user_id);
```

---

### **Phase 3: Production-Ready (4-8 weeks)**

#### 3.1 Horizontal Scaling
- **Load Balancer**: Nginx or AWS ALB
- **Multiple API Servers**: 2-4 Node.js instances
- **Multiple Workers**: 4-8 worker instances
- **Database**: Supabase scales automatically, but consider read replicas

#### 3.2 Monitoring & Observability
```typescript
// Add metrics
import { Counter, Histogram } from 'prom-client';

const sessionProcessingDuration = new Histogram({
  name: 'session_processing_duration_seconds',
  help: 'Time to process a session'
});

const sessionProcessingErrors = new Counter({
  name: 'session_processing_errors_total',
  help: 'Number of session processing errors'
});
```

**Tools**:
- **Logging**: Winston + Datadog/Logtail
- **Metrics**: Prometheus + Grafana
- **Alerts**: PagerDuty for critical failures

#### 3.3 Error Handling & Dead Letter Queue
```typescript
// If job fails 3 times, move to DLQ for manual review
const worker = new Worker('session-processing', async (job) => {
  try {
    await processSessionInBackground(job.data);
  } catch (error) {
    if (job.attemptsMade >= 3) {
      await deadLetterQueue.add('failed-session', job.data);
      await notifyAdmin(error);
    }
    throw error;
  }
});
```

---

## Cost Estimates (100 Active Users)

### Current Architecture
- **Supabase**: ~$25/month (Pro plan)
- **OpenAI**: ~$200/month (assuming 1000 calls/month, 5min avg)
- **VAPI**: ~$500/month (based on usage)
- **Hosting**: $0 (local dev) → $50/month (production VPS)

**Total**: ~$775/month

### Scaled Architecture
- **Supabase**: ~$25/month (same)
- **OpenAI**: ~$200/month (same)
- **VAPI**: ~$500/month (same)
- **Redis**: ~$15/month (Upstash or Redis Cloud)
- **Hosting**: ~$150/month (2 API servers + 4 workers on AWS/Railway)
- **Monitoring**: ~$50/month (Datadog/Logtail)

**Total**: ~$940/month

---

## Implementation Priority

### **Week 1-2: Critical Path**
1. ✅ Add database indexes (already done)
2. ⚠️ Implement BullMQ job queue
3. ⚠️ Add Redis caching for analytics

### **Week 3-4: Reliability**
4. ⚠️ Separate worker service
5. ⚠️ Add rate limiting
6. ⚠️ Implement retry logic

### **Week 5-8: Production Hardening**
7. ⚠️ Add monitoring/logging
8. ⚠️ Horizontal scaling setup
9. ⚠️ Load testing (simulate 100 concurrent users)

---

## Key Metrics to Track

1. **Session Processing Time**: Should be < 60 seconds
2. **API Response Time**: Should be < 500ms for analytics
3. **Queue Depth**: Should be < 10 jobs waiting
4. **Error Rate**: Should be < 1% of sessions
5. **OpenAI Token Usage**: Track to avoid rate limits

---

## Next Steps

1. **Set up Redis** (locally or Upstash)
2. **Install BullMQ**: `npm install bullmq`
3. **Refactor** `processSessionInBackground` to be queue-based
4. **Add job status** endpoint so frontend can show "Processing..."
5. **Test** with 10 concurrent calls to identify bottlenecks
