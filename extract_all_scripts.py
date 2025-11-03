#!/usr/bin/env python3
"""
Extract all template scripts from templateLibrary.ts and generate SQL
"""
import re

# Read the file
with open('frontend/src/config/templateLibrary.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all templates by looking for the title pattern
template_pattern = r"title:\s*'([^']+)',\s*description:\s*'([^']+)',\s*category:\s*'([^']+)',\s*difficulty:\s*'([^']+)',\s*isBuiltIn:\s*true,\s*script:\s*`([^`]+(?:`[^,])?[^`]*)`"

templates = []
for match in re.finditer(template_pattern, content, re.DOTALL):
    title = match.group(1)
    description = match.group(2)
    difficulty = match.group(4)
    script = match.group(5).strip()
    
    templates.append({
        'title': title,
        'description': description,
        'difficulty': difficulty,
        'script': script
    })

print(f"Found {len(templates)} templates")

# Generate SQL
sql = """-- =====================================================================
-- INSERT ALL 40 TEMPLATES WITH FULL SCRIPTS
-- =====================================================================
-- IMPORTANT: This contains the COMPLETE training scripts for all templates
-- File size is large (~500KB+) because it includes full persona scripts
-- 
-- Run this in Supabase SQL Editor to populate templates table
-- =====================================================================

"""

# First template
for i, t in enumerate(templates):
    if i == 0:
        sql += "INSERT INTO templates (title, description, difficulty, script, type, org, created_at) VALUES\n"
    
    # Escape single quotes
    title_escaped = t['title'].replace("'", "''")
    desc_escaped = t['description'].replace("'", "''")
    script_escaped = t['script'].replace("'", "''")
    
    sql += f"""(
  '{title_escaped}',
  '{desc_escaped}',
  '{t['difficulty']}',
  '{script_escaped}',
  'life',
  NULL,
  NOW()
)"""
    
    if i < len(templates) - 1:
        sql += ",\n"
    else:
        sql += ";\n"

sql += """
-- =====================================================================
-- Verification
-- =====================================================================
SELECT 
  id, 
  title, 
  difficulty, 
  LENGTH(script) as script_chars,
  SUBSTRING(script, 1, 100) as script_preview
FROM templates 
WHERE org IS NULL 
ORDER BY id;

-- Should show 40 templates with script_chars > 1000 for each
"""

# Write to file
with open('INSERT_TEMPLATES_WITH_FULL_SCRIPTS.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"✅ Generated INSERT_TEMPLATES_WITH_FULL_SCRIPTS.sql")
print(f"📊 File size: {len(sql) / 1024:.2f} KB")
print(f"📝 Templates: {len(templates)}")

if len(templates) != 40:
    print(f"⚠️  WARNING: Expected 40 templates but found {len(templates)}")
    print("Listing found templates:")
    for t in templates:
        print(f"  - {t['title']} ({t['difficulty']})")

