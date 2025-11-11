-- SQL to add AI summary column to training_sessions table
-- Run this in your Supabase SQL editor

ALTER TABLE training_sessions 
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- Add a comment to the column
COMMENT ON COLUMN training_sessions.ai_summary IS 'AI-generated summary of call performance - what rep did well, areas to improve, and overall assessment';

