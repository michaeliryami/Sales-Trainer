-- Add closed column to training_sessions table
-- This column stores whether the sales call was successfully closed (not rejected by customer)

ALTER TABLE training_sessions 
ADD COLUMN IF NOT EXISTS closed BOOLEAN DEFAULT NULL;

-- Add index for faster queries on closed status
CREATE INDEX IF NOT EXISTS idx_training_sessions_closed ON training_sessions(closed);

-- Add comment
COMMENT ON COLUMN training_sessions.closed IS 'Whether the sales call was successfully closed (true) or rejected/not closed (false). NULL means not yet determined.';

