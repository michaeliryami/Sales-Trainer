-- Critical Database Indexes for Clozone Scaling
-- Run this in your Supabase SQL Editor
-- These indexes will dramatically improve query performance as data grows

-- ============================================
-- TRAINING_SESSIONS TABLE
-- ============================================

-- Index for org-level analytics queries (most common)
CREATE INDEX IF NOT EXISTS idx_training_sessions_org_id_created 
ON training_sessions(org_id, created_at DESC);

-- Index for user-specific analytics
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id_created 
ON training_sessions(user_id, created_at DESC);

-- Index for assignment filtering
CREATE INDEX IF NOT EXISTS idx_training_sessions_assignment_id 
ON training_sessions(assignment_id) 
WHERE assignment_id IS NOT NULL;

-- Index for cloze rate calculations
CREATE INDEX IF NOT EXISTS idx_training_sessions_closed 
ON training_sessions(closed) 
WHERE closed IS NOT NULL;

-- Index for submitted assignments (admin view)
CREATE INDEX IF NOT EXISTS idx_training_sessions_submitted 
ON training_sessions(submitted_for_review) 
WHERE submitted_for_review = true;

-- Composite index for common query pattern: org + date range + status
CREATE INDEX IF NOT EXISTS idx_training_sessions_org_status_created 
ON training_sessions(org_id, status, created_at DESC);

-- Index for template-based queries
CREATE INDEX IF NOT EXISTS idx_training_sessions_template_id 
ON training_sessions(template_id) 
WHERE template_id IS NOT NULL;

-- ============================================
-- SESSION_GRADES TABLE
-- ============================================

-- Primary lookup by session
CREATE INDEX IF NOT EXISTS idx_session_grades_session_id 
ON session_grades(session_id);

-- User performance queries
CREATE INDEX IF NOT EXISTS idx_session_grades_user_id_created 
ON session_grades(user_id, created_at DESC);

-- Assignment grading queries
CREATE INDEX IF NOT EXISTS idx_session_grades_assignment_id 
ON session_grades(assignment_id) 
WHERE assignment_id IS NOT NULL;

-- Composite for analytics: user + date range
CREATE INDEX IF NOT EXISTS idx_session_grades_user_created 
ON session_grades(user_id, created_at DESC);

-- ============================================
-- TEMPLATES TABLE
-- ============================================

-- Template visibility queries (org + user filtering)
CREATE INDEX IF NOT EXISTS idx_templates_org_user 
ON templates(org, user_id);

-- User-created templates
CREATE INDEX IF NOT EXISTS idx_templates_user_id 
ON templates(user_id) 
WHERE user_id IS NOT NULL;

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================

-- User assignment lookups
CREATE INDEX IF NOT EXISTS idx_assignments_user_id 
ON assignments(user_id);

-- Org assignment queries
CREATE INDEX IF NOT EXISTS idx_assignments_org_id 
ON assignments(org_id);

-- Template-based assignments
CREATE INDEX IF NOT EXISTS idx_assignments_template_id 
ON assignments(template_id);

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Org member queries
CREATE INDEX IF NOT EXISTS idx_profiles_org_id 
ON profiles(org_id);

-- User lookup by email (if you query by email)
-- CREATE INDEX IF NOT EXISTS idx_profiles_email 
-- ON profiles(email);

-- ============================================
-- NOTES
-- ============================================
-- 
-- These indexes will:
-- 1. Speed up analytics queries by 10-100x
-- 2. Improve user list loading
-- 3. Make date range filtering fast
-- 4. Optimize assignment lookups
-- 
-- Trade-off: Slightly slower writes, but worth it for read-heavy app
-- Monitor index usage in Supabase dashboard after deployment

