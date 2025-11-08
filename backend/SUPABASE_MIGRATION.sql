-- Make assignment_id nullable in session_grades table to support playground sessions
-- Run this in your Supabase SQL Editor

ALTER TABLE session_grades
ALTER COLUMN assignment_id DROP NOT NULL;

-- Add a check constraint to ensure either assignment_id is provided OR it's a playground session
-- (We'll rely on application logic to distinguish between playground and assignment sessions)

-- Add an index on user_id and template_id for efficient playground session queries
CREATE INDEX IF NOT EXISTS idx_session_grades_user_playground 
ON session_grades(user_id, created_at DESC) 
WHERE assignment_id IS NULL;

COMMENT ON COLUMN session_grades.assignment_id IS 'Assignment ID for formal training, NULL for playground practice sessions';

