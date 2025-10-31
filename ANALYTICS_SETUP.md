# 📊 Analytics System Setup Guide

## Overview
This comprehensive analytics system tracks training sessions, grades performance, and provides detailed insights for both administrators and employees.

---

## 🗄️ Database Setup

### Step 1: Run the SQL Migration

1. Open your **Supabase SQL Editor**
2. Copy the entire contents of `supabase_analytics_migration.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the migration

This will create:
- ✅ `training_sessions` - Stores all training call data
- ✅ `session_grades` - Stores rubric-based grading results
- ✅ `user_performance_metrics` - Aggregated user stats (auto-updated via triggers)
- ✅ `org_analytics_cache` - Cached organization-wide analytics
- ✅ All necessary indexes for fast queries
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers for updating metrics

---

## 🎯 What's Been Built

### 📁 Files Created/Modified

#### **Backend:**
- `backend/src/routes/analytics.ts` - Analytics API endpoints
- `backend/src/routes/export.ts` - Updated to save sessions & grades to database
- `backend/src/index.ts` - Registered analytics routes
- `supabase_analytics_migration.sql` - Database migration script

#### **Frontend:**
- `frontend/src/pages/Analytics.tsx` - Admin analytics dashboard (updated to use real data)
- `frontend/src/pages/MyAnalytics.tsx` - Employee performance dashboard
- `frontend/src/pages/CreateSession.tsx` - Updated to send user/org data for storage
- `frontend/src/components/Header.tsx` - Added analytics navigation items
- `frontend/src/App.tsx` - Added analytics routes

---

## 🚀 Features

### 📊 Admin Analytics Dashboard (`/analytics`)

**Key Metrics:**
- Total training sessions
- Active users count
- Average session duration
- Average performance score
- Completion rate

**Insights:**
- Top performing templates with success rates
- Top performers leaderboard with scores and streaks
- Recent session history with scores
- Weekly trends (sessions & completion rates)

**Time Ranges:**
- Last 7 days
- Last 30 days  
- Last 90 days

---

### 👤 Employee Analytics Dashboard (`/my-analytics`)

**Performance Overview:**
- Total sessions completed
- Average score
- Average session duration
- Current streak & longest streak

**Progress Tracking:**
- Assignment completion progress bar
- Pending vs completed assignments
- Improvement rate over time

**Skill Breakdown:**
- Individual rubric criteria performance
- Progress bars for each skill
- Average scores per skill

**Session History:**
- Recent training sessions
- Scores and completion status
- Duration and dates
- Assignment vs template indicators

**Score Trend:**
- Chronological score progression
- Visual improvement tracking

---

## 🔄 How It Works

### 1. **Session Recording**
When a user completes a training call and exports the PDF:

```typescript
// Frontend sends:
{
  userId: profile.id,
  orgId: organization.id,
  templateId: template.id,
  assignmentId: assignment?.id, // if assignment
  chunks: transcriptChunks,
  startTime, endTime, duration
  // ... other data
}
```

### 2. **Database Storage**
Backend automatically:
1. Saves session to `training_sessions` table
2. If assignment: Grades transcript against rubric using AI
3. Saves grade to `session_grades` table
4. **Triggers fire automatically** to update `user_performance_metrics`

### 3. **Analytics Calculation**
- Metrics are calculated in real-time from database
- User performance metrics are cached and updated via triggers
- Organization analytics can be refreshed using helper functions

---

## 🎨 Dashboard Design

### Admin Dashboard
- **Left Panel**: Overview metrics, top templates, top performers
- **Right Panel**: Recent activity feed with session details
- Modern card-based layout with glassmorphism effects
- Resizable panels for customization

### Employee Dashboard
- **Left Panel**: Personal metrics, assignment progress, skills breakdown
- **Right Panel**: Recent session history with detailed cards
- Color-coded badges for scores (green/yellow/red)
- Streak tracking with visual indicators

---

## 📡 API Endpoints

### GET `/api/analytics/admin/:orgId`
**Query Params:** `?period=7d|30d|90d|all`

Returns organization-wide analytics:
```json
{
  "totalSessions": 47,
  "totalUsers": 12,
  "avgSessionDuration": 18.5,
  "completionRate": 84.2,
  "avgScore": 87.3,
  "topTemplates": [...],
  "recentSessions": [...],
  "topPerformers": [...],
  "weeklyTrends": { ... }
}
```

### GET `/api/analytics/employee/:userId`
**Query Params:** `?period=7d|30d|90d|all`

Returns user-specific analytics:
```json
{
  "totalSessions": 12,
  "completedSessions": 10,
  "avgScore": 85.5,
  "highestScore": 95,
  "lowestScore": 72,
  "assignmentsCompleted": 5,
  "assignmentsPending": 3,
  "currentStreak": 7,
  "recentSessions": [...],
  "scoreTrend": [...],
  "skills": [...],
  "improvementRate": 12.5
}
```

### POST `/api/analytics/session`
Manually save a training session (used internally by export route)

### POST `/api/analytics/grade`
Manually save a session grade (used internally by export route)

---

## 🔒 Security

### Row Level Security (RLS)
All tables have RLS enabled:

**training_sessions:**
- Users can view/create/update their own sessions
- Admins can view all sessions in their organization

**session_grades:**
- Users can view their own grades
- Admins can view and update all grades in their organization

**user_performance_metrics:**
- Users can view their own metrics
- Admins can view all metrics in their organization

**org_analytics_cache:**
- Only admins can view organization analytics

---

## 🎯 Data Flow

```
User completes call
        ↓
Exports PDF transcript
        ↓
Frontend sends data to /api/export/transcript-pdf
        ↓
Backend:
  1. Cleans transcript with LLM
  2. Saves to training_sessions table
  3. If assignment: Grades with AI
  4. Saves grade to session_grades
  5. Triggers update user_performance_metrics
  6. Generates PDF with grading report
        ↓
User downloads PDF
Analytics dashboards update in real-time
```

---

## 🛠️ Database Schema

### training_sessions
```sql
- id (bigserial, primary key)
- user_id (uuid, references auth.users)
- org_id (bigint)
- session_type ('template' | 'assignment')
- template_id (bigint, nullable)
- assignment_id (bigint, nullable)
- call_id (text)
- start_time, end_time (timestamptz)
- duration_seconds (int)
- transcript (jsonb)
- transcript_clean (text)
- status ('in_progress' | 'completed' | 'abandoned' | 'error')
```

### session_grades
```sql
- id (bigserial, primary key)
- session_id (bigint, references training_sessions)
- user_id (uuid)
- assignment_id (bigint)
- rubric_id (bigint, nullable)
- total_score (decimal)
- max_possible_score (decimal)
- percentage (computed column)
- criteria_grades (jsonb)
- grading_model (text, e.g., 'gpt-4o-mini')
- manually_adjusted (boolean)
```

### user_performance_metrics
```sql
- user_id (uuid, unique)
- org_id (bigint)
- total_sessions, completed_sessions (int)
- total_duration_minutes, avg_duration_minutes (decimal)
- assignments_completed, assignments_in_progress (int)
- avg_score, highest_score, lowest_score (decimal)
- current_streak_days, longest_streak_days (int)
- last_session_date (date)
- Auto-updated via triggers!
```

---

## ✨ Key Features

### Automatic Metric Updates
- No manual aggregation needed
- Triggers automatically update user metrics
- Real-time performance tracking

### AI-Powered Grading
- LLM analyzes transcripts against rubric criteria
- Provides specific evidence from conversations
- Detailed reasoning for each grade
- Stored permanently for historical tracking

### Performance Insights
- Skill-by-skill breakdown
- Improvement tracking over time
- Comparison against organization averages
- Leaderboards and streaks

### Enterprise-Ready
- Scalable database design with proper indexes
- RLS for data security
- Multi-tenant support (org isolation)
- Caching for performance

---

## 🔧 Advanced Features

### Refresh Organization Cache
```sql
SELECT refresh_org_analytics(1, '30d');
```
This function recalculates and caches organization analytics for the specified period.

### Manual Metric Recalculation
If metrics get out of sync, you can manually recalculate:
```sql
-- Triggers will automatically update on new sessions/grades
-- Or manually refresh:
DELETE FROM user_performance_metrics WHERE user_id = 'user-id';
-- Then insert a new session to trigger recalculation
```

---

## 📈 Future Enhancements

Potential additions:
- [ ] Comparative analytics (user vs org average)
- [ ] Goal setting and tracking
- [ ] Custom report generation
- [ ] Export analytics to CSV/Excel
- [ ] Email digest reports
- [ ] Predictive performance analytics
- [ ] Skill recommendations based on weak areas
- [ ] Team/department analytics
- [ ] Time-of-day performance patterns
- [ ] Advanced data visualization (charts/graphs)

---

## 🐛 Troubleshooting

### No data showing in dashboards?
1. Check that the SQL migration ran successfully
2. Verify users have completed sessions with PDF exports
3. Check browser console for API errors
4. Verify backend is running and routes are registered

### Metrics not updating?
1. Check that triggers are installed: `\df update_user_performance_metrics`
2. Verify RLS policies allow inserts: Check Supabase table policies
3. Look for errors in backend logs during session save

### Permission errors?
1. Verify RLS policies are correctly configured
2. Check that users are authenticated
3. Ensure organization assignment is correct

---

## 🎉 You're All Set!

Your analytics system is now fully operational! Here's what you have:

✅ Comprehensive admin dashboard
✅ Personalized employee performance tracking
✅ Automatic data collection and aggregation
✅ AI-powered grading and insights
✅ Secure, scalable database architecture
✅ Real-time analytics with caching
✅ Beautiful, modern UI with resizable panels

**Next Steps:**
1. Run the SQL migration in Supabase
2. Complete a training session and export PDF
3. Check the Analytics dashboard - you'll see real data!
4. Employee users can view their personal performance

---

## 📞 Support

If you encounter any issues:
1. Check this README
2. Review Supabase logs for database errors
3. Check browser console for frontend errors
4. Review backend terminal logs for API errors

Happy analyzing! 🚀📊

