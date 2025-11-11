-- SQL to add LLM-cleaned transcript column to training_sessions table
-- Run this in your Supabase SQL editor

-- Add the new column for LLM-cleaned transcript
ALTER TABLE training_sessions 
ADD COLUMN IF NOT EXISTS transcript_llm_clean TEXT;

-- Add a comment to the column
COMMENT ON COLUMN training_sessions.transcript_llm_clean IS 'LLM-cleaned transcript (GPT-4o-mini) - removes duplicates, merges fragments, creates natural flow';

-- Optional: Create an index if you'll be searching/filtering by this
-- CREATE INDEX IF NOT EXISTS idx_training_sessions_transcript_llm_clean ON training_sessions(transcript_llm_clean);

