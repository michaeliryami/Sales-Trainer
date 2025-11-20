-- Add age_range column to templates table
-- This allows templates to specify the age range for the prospect persona
-- This ensures the AI prospect matches the intended persona (e.g., "newgrad" should be young, not 41 years old)

ALTER TABLE templates 
ADD COLUMN age_range VARCHAR(20);

-- Add comment to document the purpose
COMMENT ON COLUMN templates.age_range IS 'Age range for the prospect persona (e.g., "18-25", "26-35", "36-45", "46-55", "56-65", "65+")';

-- Add index for faster queries if needed
CREATE INDEX idx_templates_age_range ON templates(age_range);

