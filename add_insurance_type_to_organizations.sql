-- Migration: Add insurance_type column to organizations table
-- This allows each organization to have its own insurance type (life, health, auto, home, business, etc.)

-- Add the insurance_type column with a default value of 'life'
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS insurance_type TEXT NOT NULL DEFAULT 'life';

-- Add a comment to document the column
COMMENT ON COLUMN organizations.insurance_type IS 'The type of insurance this organization focuses on (e.g., life, health, auto, home, business)';

-- Optional: Add a check constraint to ensure only valid insurance types
ALTER TABLE organizations 
ADD CONSTRAINT valid_insurance_type 
CHECK (insurance_type IN ('life', 'health', 'auto', 'home', 'business', 'other'));

-- Update existing organizations to have 'life' as default (if any exist)
UPDATE organizations 
SET insurance_type = 'life' 
WHERE insurance_type IS NULL;

-- Display updated organizations
SELECT id, name, insurance_type, created_at 
FROM organizations 
ORDER BY id;

