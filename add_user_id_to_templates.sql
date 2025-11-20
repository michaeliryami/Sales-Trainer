-- Add user_id column to templates table
-- This allows tracking which user created each template
-- Templates with null user_id are considered shared/built-in templates

ALTER TABLE templates 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for faster queries filtering by user_id
CREATE INDEX idx_templates_user_id ON templates(user_id);

-- Add comment to document the purpose
COMMENT ON COLUMN templates.user_id IS 'User who created this template. NULL means it is a shared/built-in template visible to all.';

