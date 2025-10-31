-- Migration to add manual grade override support
-- Run this in your Supabase SQL editor

-- Add manual override columns to session_grades table
ALTER TABLE session_grades
ADD COLUMN IF NOT EXISTS manual_comments TEXT,
ADD COLUMN IF NOT EXISTS is_manual_override BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_session_grades_manual_override 
ON session_grades(is_manual_override) 
WHERE is_manual_override = TRUE;

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_session_grades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS session_grades_updated_at_trigger ON session_grades;

CREATE TRIGGER session_grades_updated_at_trigger
BEFORE UPDATE ON session_grades
FOR EACH ROW
EXECUTE FUNCTION update_session_grades_updated_at();

-- Comment the columns
COMMENT ON COLUMN session_grades.manual_comments IS 'Manual comments added by admin to override or supplement AI feedback';
COMMENT ON COLUMN session_grades.is_manual_override IS 'Flag indicating if this grade was manually overridden by an admin';
COMMENT ON COLUMN session_grades.updated_at IS 'Timestamp of last update to this grade record';

-- Add trigger to update user_performance_metrics when grades are updated
-- This ensures the top performers leaderboard updates when manual overrides happen
DROP TRIGGER IF EXISTS trigger_update_performance_on_grade_update ON session_grades;

CREATE TRIGGER trigger_update_performance_on_grade_update
AFTER UPDATE ON session_grades
FOR EACH ROW
EXECUTE FUNCTION update_user_performance_with_grade();

