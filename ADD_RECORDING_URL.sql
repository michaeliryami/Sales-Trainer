-- Add recording_url column to training_sessions table
-- Run this in your Supabase SQL Editor

ALTER TABLE training_sessions 
ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_training_sessions_recording_url 
ON training_sessions(recording_url) 
WHERE recording_url IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'training_sessions' 
AND column_name = 'recording_url';

