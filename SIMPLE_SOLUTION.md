# Simple Solution for Built-In Template Assignments

## The Real Issue

When you create an assignment with a built-in template, the assignment table stores a `template` ID. But built-in templates don't have database IDs - they only exist in the frontend code.

## The Simple Solution

**You don't actually need the full scripts in the database!** Here's why:

1. **For Playground/Training Sessions**: The system uses scripts from `frontend/src/config/templateLibrary.ts` 
2. **For Assignments**: We only need a database record with the title and basic info so assignments can reference it

## Quick Setup (5 minutes)

Run this SQL in your Supabase SQL Editor:

```sql
-- Insert just the template metadata (scripts pulled from frontend code during calls)
INSERT INTO templates (title, description, difficulty, script, type, org, created_at) VALUES
('The Family Protector', 'Married parent worried about protecting spouse and children from financial burden.', 'easy', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Busy Professional', 'High-earning, time-starved professional who wants efficiency and results-focused conversation.', 'easy', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Skeptic', 'Distrustful of salespeople, believes there is always a hidden catch or fee.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The "Whatever" Guy', 'Doesn''t care much, just needs coverage to check the box or appease someone.', 'easy', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Fixed-Income Person', 'On Social Security/disability, very price-sensitive but genuinely needs coverage.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Young Single Professional', 'Mid-20s to early 30s, single, thinks they don''t need life insurance yet.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Recent Widow/Widower', 'Recently lost spouse, now realizes importance of life insurance.', 'easy', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Recently Married Couple', 'Newlyweds starting to think about adulting and responsibilities.', 'easy', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Small Business Owner', 'Self-employed, thinking about business continuity and family protection.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Diabetic Lead', 'Has diabetes, worried they can''t get coverage, expecting denial.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Veteran', 'Military veteran checking options between VA benefits and private insurance.', 'easy', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Cancer Survivor', 'Beat cancer 5+ years ago, wants coverage but worried about eligibility.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Expecting Parents', 'Pregnant or just had a baby, suddenly feeling mortal and responsible.', 'easy', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Blue Collar Worker', 'Works physical job, practical about money, straight-shooter personality.', 'easy', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Executive', 'High-level corporate executive with complex financial situation.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Divorcee', 'Recently divorced, restructuring finances and beneficiaries.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Teacher', 'Educator with stable but modest income, family-oriented, detail-oriented.', 'easy', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Healthcare Worker', 'Nurse or medical professional, understands risk, shift-worker schedule.', 'easy', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Empty Nester', 'Kids grown and gone, reassessing coverage needs and final expense planning.', 'easy', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Objection Master', 'Has an objection ready for everything - price, timing, need, coverage amounts, trust.', 'hard', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The MLM Person', 'Involved in multi-level marketing, views everything as recruitment opportunity, pitch-resistant.', 'hard', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Know-It-All', 'Claims expertise in insurance despite having none, corrects you constantly.', 'expert', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Conspiracy Theorist', 'Believes insurance is a government scheme or corporate scam, deep distrust.', 'expert', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Impulse Buyer', 'Says yes to everything immediately, high cancellation risk, no due diligence.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Elderly Confused Lead', 'Senior citizen, possibly early dementia, shouldn''t be sold to, ethical considerations.', 'expert', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Chronic Shopper', 'Calls 10+ companies, wants quotes from everyone, never actually buys.', 'hard', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Policy Flipper', 'Buys and cancels policies frequently, treating insurance like a game.', 'hard', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Passive-Aggressive Lead', 'Agrees verbally but sabotages with actions, non-committal, conflict-avoidant.', 'hard', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Controlled Spouse', 'Wants coverage but needs permission from controlling partner, lacks financial autonomy.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Analysis Paralysis', 'Overthinks every detail, creates decision paralysis, needs every possible data point.', 'hard', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Extreme Bargain Hunter', 'Only cares about lowest price, will sacrifice coverage for $5/month savings.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Recently Unemployed', 'Just lost job, stressed about money, insurance feels like luxury they can''t afford.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Trust Fund Kid', 'Wealthy family background, doesn''t see need for insurance, financially insulated.', 'hard', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Terminal Diagnosis', 'Has terminal illness, desperately seeking coverage, likely uninsurable for traditional.', 'expert', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Debt-Dodger', 'Hiding from creditors, wants insurance but afraid of being found.', 'expert', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Language Barrier Lead', 'Limited English proficiency, struggles to understand complex terms, needs extra patience.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Social Media Influencer', 'Content creator, wants to film/post about process, views everything as content opportunity.', 'medium', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Emergency Room Call', 'Calling from hospital or just after health scare, panic-buying, may not qualify.', 'hard', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Competitor Shopping You', 'Another insurance agent pretending to be a lead, stealing your pitch.', 'expert', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW()),
('The Ghost (Never Answers)', 'Filled out form but won''t answer calls, texts, or emails - perpetual ghosting.', 'hard', 'See frontend/src/config/templateLibrary.ts for full script', 'life', NULL, NOW());

-- Verify insertion
SELECT id, title, difficulty FROM templates WHERE org IS NULL ORDER BY id;
```

## How It Works

### When Admin Assigns Template:
1. Clicks "Assign to Team" in Templates page
2. System finds template in database by title
3. Gets the database ID
4. Creates assignment with that ID

### When Employee Starts Training:
1. Loads assignment from database
2. Sees template title (e.g., "The Family Protector")
3. **Frontend matches title to `templateLibrary.ts`**
4. Loads FULL script from frontend code
5. Sends complete script to VAPI

### Result:
- ✅ Assignments work (have database IDs)
- ✅ Full scripts used in training (from frontend)
- ✅ No need to duplicate huge scripts in database
- ✅ Easy to update scripts (just edit `templateLibrary.ts`)

## Verification

After running the SQL:

```sql
-- Should return 40 rows
SELECT COUNT(*) FROM templates WHERE org IS NULL;

-- View all templates
SELECT id, title, difficulty FROM templates WHERE org IS NULL ORDER BY id;
```

## Testing the Full Flow

1. **Run the SQL script** - All 40 templates are now in the database
2. **Go to Templates page (Admin)** - You'll see the built-in templates
3. **Click "Assign to Team"** on any template
4. **Assignments page opens** with:
   - Title pre-filled (e.g., "The Family Protector Assignment")
   - Description pre-filled
   - Template dropdown **already selected** with the right template
5. **Select team members and create** - Assignment is created successfully
6. **Employee sees assignment** with template name visible
7. **Employee starts session** - Full training script loads from frontend code

## Why This Works Better

1. **Single Source of Truth**: Scripts live in `templateLibrary.ts`
2. **Easy Updates**: Edit one file to update all scripts
3. **Smaller Database**: No 100KB+ text fields
4. **Faster**: Less data to transfer
5. **Version Control**: Scripts tracked in Git, not buried in DB

The database just needs to know "Template #5 = The Family Protector" so assignments can reference it. The actual training script comes from your frontend code!

