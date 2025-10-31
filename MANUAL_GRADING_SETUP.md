# Manual Grade Override Setup

## Overview
This update adds the ability for admins to manually override AI-generated grades and add custom comments for each assignment completion.

## Database Changes

### New Columns Added to `session_grades`
1. **`manual_comments`** (TEXT): Admin comments to override or supplement AI feedback
2. **`is_manual_override`** (BOOLEAN): Flag indicating manual override
3. **`updated_at`** (TIMESTAMPTZ): Timestamp of last update

### Migration Required
Run the SQL script in Supabase SQL Editor:

```bash
# File location
supabase_manual_grade_migration.sql
```

This adds:
- New columns to `session_grades` table
- Index for faster manual override queries
- Trigger to auto-update `updated_at` timestamp

## Features

### Admin Functionality (Assignments Page)
1. **View Assignment Performance**
   - Click "View Performance" on any assignment card
   - See all assigned users and their completion status

2. **Edit Grades**
   - Modify the grade percentage (0-100)
   - Grades are saved per user per assignment

3. **Add Comments**
   - Text area for manual feedback
   - Can override or supplement AI-generated feedback
   - Saved with the grade

4. **Save Manual Override**
   - "Save Manual Grade" button
   - Saves both grade and comments to database
   - Sets `is_manual_override = true` flag
   - Toast notification on success/failure

### Analytics Display
- Manual overrides take precedence over AI grades
- Manual comments displayed alongside AI feedback
- Visual indicator for manually graded assignments

## API Endpoints

### POST `/api/analytics/manual-grade`
Saves manual grade override for a user's assignment completion.

**Request Body:**
```json
{
  "userId": "uuid",
  "assignmentId": 123,
  "percentage": 85,
  "comments": "Great improvement on objection handling!",
  "isManualOverride": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Manual grade saved successfully"
}
```

## Frontend Changes

### `/frontend/src/pages/Assignments.tsx`
- Added state for `manualComments` and `savingGrade`
- New `saveManualGrade()` function
- Enhanced user performance cards with:
  - Textarea for comments
  - "Save Manual Grade" button
  - Loading states

### UI Components
- **Grade Input**: Numeric input (0-100)
- **Comments Field**: Multi-line textarea
- **Save Button**: Green button with loading state
- **Toast Notifications**: Success/error feedback

## How It Works

1. **User completes assignment** → AI grades automatically
2. **Admin reviews in Assignments page** → Clicks "View Performance"
3. **Admin adjusts grade/adds comments** → Types in fields
4. **Admin clicks "Save Manual Grade"** → Saves to database
5. **Manual grade overrides AI grade** → Used in analytics and PDF reports

## Testing

1. Complete an assignment as employee
2. As admin, go to Assignments page
3. Click "View Performance" on the assignment
4. Find the user's card
5. Edit grade and add comment
6. Click "Save Manual Grade"
7. Verify toast notification
8. Check analytics to see updated grade

## Notes

- Manual grades completely override AI grades when set
- Comments are optional but recommended
- Grades must be 0-100
- One manual grade per user per assignment
- Updates existing grade if already present

