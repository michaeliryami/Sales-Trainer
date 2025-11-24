-- Add closed_evidence column to training_sessions table
-- This column stores AI-generated evidence explaining why a call was or wasn't closed

ALTER TABLE training_sessions 
ADD COLUMN IF NOT EXISTS closed_evidence TEXT DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN training_sessions.closed_evidence IS 'AI-generated evidence explaining why the call was closed (true) or not closed (false). Contains specific quotes and reasoning from the transcript.';

