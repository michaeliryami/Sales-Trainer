-- =====================================================
-- SALES TRAINER ANALYTICS DATABASE MIGRATION
-- =====================================================
-- This script creates tables for tracking training sessions,
-- performance metrics, and analytics data
-- 
-- IMPORTANT: Run this in your Supabase SQL Editor
-- This will NOT affect your existing tables:
-- - profiles
-- - organizations  
-- - templates
-- - assignments
-- - rubrics
-- =====================================================

-- =====================================================
-- TABLE: training_sessions
-- Stores all training session data including calls
-- =====================================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User & Organization
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id BIGINT NOT NULL,
  
  -- Session Type
  session_type TEXT NOT NULL CHECK (session_type IN ('template', 'assignment')),
  template_id BIGINT,
  assignment_id BIGINT,
  
  -- Call Data
  call_id TEXT,
  vapi_call_id TEXT,
  
  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INT,
  
  -- Transcript Data
  transcript JSONB, -- Array of {speaker, text, timestamp}
  transcript_clean TEXT, -- Cleaned version for analysis
  
  -- PDF Storage
  pdf_url TEXT, -- URL or path to generated PDF
  
  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'error')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Indexes for performance
  CONSTRAINT fk_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL,
  CONSTRAINT fk_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_org_id ON training_sessions(org_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_created_at ON training_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_training_sessions_session_type ON training_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_training_sessions_template_id ON training_sessions(template_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_assignment_id ON training_sessions(assignment_id);

-- =====================================================
-- TABLE: session_grades
-- Stores rubric-based grading results for assignments
-- =====================================================
CREATE TABLE IF NOT EXISTS session_grades (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- References
  session_id BIGINT NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id BIGINT NOT NULL,
  rubric_id BIGINT,
  
  -- Grading Results
  total_score DECIMAL(5,2) NOT NULL,
  max_possible_score DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS ((total_score / NULLIF(max_possible_score, 0)) * 100) STORED,
  
  -- Detailed Criteria Grades (JSON)
  criteria_grades JSONB NOT NULL, -- Array of {title, description, maxPoints, earnedPoints, evidence, reasoning}
  
  -- AI Grading Metadata
  graded_by TEXT DEFAULT 'ai',
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  grading_model TEXT, -- e.g., 'gpt-4o-mini'
  
  -- Manual Override
  manually_adjusted BOOLEAN DEFAULT FALSE,
  adjusted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  adjusted_at TIMESTAMPTZ,
  adjustment_notes TEXT,
  
  CONSTRAINT fk_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_rubric FOREIGN KEY (rubric_id) REFERENCES rubrics(id) ON DELETE SET NULL
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_session_grades_session_id ON session_grades(session_id);
CREATE INDEX IF NOT EXISTS idx_session_grades_user_id ON session_grades(user_id);
CREATE INDEX IF NOT EXISTS idx_session_grades_assignment_id ON session_grades(assignment_id);
CREATE INDEX IF NOT EXISTS idx_session_grades_created_at ON session_grades(created_at);

-- =====================================================
-- TABLE: user_performance_metrics
-- Aggregated performance metrics per user (updated via trigger)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Session Stats
  total_sessions INT DEFAULT 0,
  completed_sessions INT DEFAULT 0,
  total_duration_minutes INT DEFAULT 0,
  avg_duration_minutes DECIMAL(5,2) DEFAULT 0,
  
  -- Assignment Stats
  assignments_completed INT DEFAULT 0,
  assignments_in_progress INT DEFAULT 0,
  
  -- Performance Stats
  avg_score DECIMAL(5,2) DEFAULT 0,
  highest_score DECIMAL(5,2) DEFAULT 0,
  lowest_score DECIMAL(5,2) DEFAULT 0,
  
  -- Streak & Engagement
  current_streak_days INT DEFAULT 0,
  longest_streak_days INT DEFAULT 0,
  last_session_date DATE,
  
  -- Skill Metrics (can be expanded)
  skills_data JSONB DEFAULT '{}'::jsonb
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_performance_user_id ON user_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_performance_org_id ON user_performance_metrics(org_id);

-- =====================================================
-- TABLE: org_analytics_cache
-- Cached analytics data for organizations (updated periodically)
-- =====================================================
CREATE TABLE IF NOT EXISTS org_analytics_cache (
  id BIGSERIAL PRIMARY KEY,
  org_id BIGINT NOT NULL UNIQUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Time Ranges
  period TEXT NOT NULL DEFAULT '7d', -- '7d', '30d', '90d', 'all'
  
  -- Aggregate Stats
  total_sessions INT DEFAULT 0,
  total_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  avg_session_duration DECIMAL(5,2) DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  
  -- Top Performers
  top_performers JSONB DEFAULT '[]'::jsonb,
  
  -- Template Stats
  template_stats JSONB DEFAULT '[]'::jsonb,
  
  -- Assignment Stats
  assignment_stats JSONB DEFAULT '[]'::jsonb,
  
  -- Trends
  weekly_trends JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(org_id, period)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_org_analytics_org_id ON org_analytics_cache(org_id);

-- =====================================================
-- FUNCTION: Update user performance metrics
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user performance metrics
  INSERT INTO user_performance_metrics (user_id, org_id, updated_at)
  VALUES (NEW.user_id, NEW.org_id, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_sessions = user_performance_metrics.total_sessions + 1,
    completed_sessions = user_performance_metrics.completed_sessions + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    total_duration_minutes = user_performance_metrics.total_duration_minutes + COALESCE(NEW.duration_seconds / 60, 0),
    avg_duration_minutes = (user_performance_metrics.total_duration_minutes + COALESCE(NEW.duration_seconds / 60, 0)) / NULLIF(user_performance_metrics.total_sessions + 1, 0),
    last_session_date = CASE WHEN NEW.status = 'completed' THEN CURRENT_DATE ELSE user_performance_metrics.last_session_date END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-update user performance on new session
-- =====================================================
CREATE TRIGGER trigger_update_user_performance
AFTER INSERT OR UPDATE ON training_sessions
FOR EACH ROW
EXECUTE FUNCTION update_user_performance_metrics();

-- =====================================================
-- FUNCTION: Update user performance with grade data
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_performance_with_grade()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_performance_metrics
  SET
    avg_score = (
      SELECT AVG(percentage)
      FROM session_grades
      WHERE user_id = NEW.user_id
    ),
    highest_score = GREATEST(COALESCE(highest_score, 0), NEW.percentage),
    lowest_score = CASE 
      WHEN lowest_score = 0 OR lowest_score IS NULL THEN NEW.percentage
      ELSE LEAST(lowest_score, NEW.percentage)
    END,
    assignments_completed = assignments_completed + 1,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-update performance when graded
-- =====================================================
CREATE TRIGGER trigger_update_performance_on_grade
AFTER INSERT ON session_grades
FOR EACH ROW
EXECUTE FUNCTION update_user_performance_with_grade();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_analytics_cache ENABLE ROW LEVEL SECURITY;

-- training_sessions policies
CREATE POLICY "Users can view their own sessions"
  ON training_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON training_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON training_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all sessions in their org
CREATE POLICY "Admins can view org sessions"
  ON training_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = training_sessions.org_id
      AND organizations.admin = auth.uid()
    )
  );

-- session_grades policies
CREATE POLICY "Users can view their own grades"
  ON session_grades FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all grades in their org
CREATE POLICY "Admins can view org grades"
  ON session_grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM training_sessions
      JOIN organizations ON training_sessions.org_id = organizations.id
      WHERE session_grades.session_id = training_sessions.id
      AND organizations.admin = auth.uid()
    )
  );

-- Admins can update grades (for manual adjustments)
CREATE POLICY "Admins can update grades"
  ON session_grades FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM training_sessions
      JOIN organizations ON training_sessions.org_id = organizations.id
      WHERE session_grades.session_id = training_sessions.id
      AND organizations.admin = auth.uid()
    )
  );

-- user_performance_metrics policies
CREATE POLICY "Users can view their own metrics"
  ON user_performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view org metrics"
  ON user_performance_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = user_performance_metrics.org_id
      AND organizations.admin = auth.uid()
    )
  );

-- org_analytics_cache policies
CREATE POLICY "Admins can view org analytics"
  ON org_analytics_cache FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = org_analytics_cache.org_id
      AND organizations.admin = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTION: Refresh org analytics cache
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_org_analytics(org_id_param BIGINT, period_param TEXT DEFAULT '7d')
RETURNS void AS $$
DECLARE
  start_date TIMESTAMPTZ;
  total_sessions_count INT;
  active_users_count INT;
  avg_duration DECIMAL;
  completion_rate_pct DECIMAL;
  avg_score_val DECIMAL;
BEGIN
  -- Calculate start date based on period
  start_date := CASE period_param
    WHEN '7d' THEN NOW() - INTERVAL '7 days'
    WHEN '30d' THEN NOW() - INTERVAL '30 days'
    WHEN '90d' THEN NOW() - INTERVAL '90 days'
    ELSE '1970-01-01'::TIMESTAMPTZ
  END;
  
  -- Get stats
  SELECT 
    COUNT(*),
    COUNT(DISTINCT user_id),
    AVG(duration_seconds),
    (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    (SELECT AVG(percentage) FROM session_grades sg
     JOIN training_sessions ts ON sg.session_id = ts.id
     WHERE ts.org_id = org_id_param AND ts.created_at >= start_date)
  INTO total_sessions_count, active_users_count, avg_duration, completion_rate_pct, avg_score_val
  FROM training_sessions
  WHERE org_id = org_id_param
  AND created_at >= start_date;
  
  -- Upsert cache
  INSERT INTO org_analytics_cache (
    org_id, period, updated_at,
    total_sessions, active_users, avg_session_duration,
    completion_rate, avg_score
  )
  VALUES (
    org_id_param, period_param, NOW(),
    COALESCE(total_sessions_count, 0),
    COALESCE(active_users_count, 0),
    COALESCE(avg_duration / 60, 0),
    COALESCE(completion_rate_pct, 0),
    COALESCE(avg_score_val, 0)
  )
  ON CONFLICT (org_id, period)
  DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    active_users = EXCLUDED.active_users,
    avg_session_duration = EXCLUDED.avg_session_duration,
    completion_rate = EXCLUDED.completion_rate,
    avg_score = EXCLUDED.avg_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Analytics migration completed successfully!';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  - training_sessions';
  RAISE NOTICE '  - session_grades';
  RAISE NOTICE '  - user_performance_metrics';
  RAISE NOTICE '  - org_analytics_cache';
  RAISE NOTICE 'Created triggers for auto-updating metrics';
  RAISE NOTICE 'RLS policies enabled for data security';
END $$;

