-- =====================================================================
-- Insert Built-In Templates for Assignment Support
-- =====================================================================
-- IMPORTANT: Run this script BEFORE trying to assign built-in templates!
-- 
-- This creates database records for all 40 built-in templates so they can
-- be referenced in assignments. The full training scripts are loaded from
-- frontend code (templateLibrary.ts) during actual training sessions.
--
-- After running this, the Assignments page will show all these templates
-- in the dropdown, and "Assign to Team" will work properly.
-- =====================================================================

INSERT INTO templates (title, description, difficulty, script, type, org, created_at) VALUES
('The Family Protector', 'Married parent worried about protecting spouse and children from financial burden.', 'easy', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Busy Professional', 'High-earning, time-starved professional who wants efficiency and results-focused conversation.', 'easy', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Skeptic', 'Distrustful of salespeople, believes there is always a hidden catch or fee.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The "Whatever" Guy', 'Doesn''t care much, just needs coverage to check the box or appease someone.', 'easy', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Fixed-Income Person', 'On Social Security/disability, very price-sensitive but genuinely needs coverage.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Young Single Professional', 'Mid-20s to early 30s, single, thinks they don''t need life insurance yet.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Recent Widow/Widower', 'Recently lost spouse, now realizes importance of life insurance.', 'easy', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Recently Married Couple', 'Newlyweds starting to think about adulting and responsibilities.', 'easy', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Small Business Owner', 'Self-employed, thinking about business continuity and family protection.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Diabetic Lead', 'Has diabetes, worried they can''t get coverage, expecting denial.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Veteran', 'Military veteran checking options between VA benefits and private insurance.', 'easy', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Cancer Survivor', 'Beat cancer 5+ years ago, wants coverage but worried about eligibility.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Expecting Parents', 'Pregnant or just had a baby, suddenly feeling mortal and responsible.', 'easy', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Blue Collar Worker', 'Works physical job, practical about money, straight-shooter personality.', 'easy', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Executive', 'High-level corporate executive with complex financial situation.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Divorcee', 'Recently divorced, restructuring finances and beneficiaries.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Teacher', 'Educator with stable but modest income, family-oriented, detail-oriented.', 'easy', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Healthcare Worker', 'Nurse or medical professional, understands risk, shift-worker schedule.', 'easy', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Empty Nester', 'Kids grown and gone, reassessing coverage needs and final expense planning.', 'easy', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Objection Master', 'Has an objection ready for everything - price, timing, need, coverage amounts, trust.', 'hard', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The MLM Person', 'Involved in multi-level marketing, views everything as recruitment opportunity, pitch-resistant.', 'hard', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Know-It-All', 'Claims expertise in insurance despite having none, corrects you constantly.', 'expert', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Conspiracy Theorist', 'Believes insurance is a government scheme or corporate scam, deep distrust.', 'expert', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Impulse Buyer', 'Says yes to everything immediately, high cancellation risk, no due diligence.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Elderly Confused Lead', 'Senior citizen, possibly early dementia, shouldn''t be sold to, ethical considerations.', 'expert', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Chronic Shopper', 'Calls 10+ companies, wants quotes from everyone, never actually buys.', 'hard', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Policy Flipper', 'Buys and cancels policies frequently, treating insurance like a game.', 'hard', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Passive-Aggressive Lead', 'Agrees verbally but sabotages with actions, non-committal, conflict-avoidant.', 'hard', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Controlled Spouse', 'Wants coverage but needs permission from controlling partner, lacks financial autonomy.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Analysis Paralysis', 'Overthinks every detail, creates decision paralysis, needs every possible data point.', 'hard', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Extreme Bargain Hunter', 'Only cares about lowest price, will sacrifice coverage for $5/month savings.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Recently Unemployed', 'Just lost job, stressed about money, insurance feels like luxury they can''t afford.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Trust Fund Kid', 'Wealthy family background, doesn''t see need for insurance, financially insulated.', 'hard', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Terminal Diagnosis', 'Has terminal illness, desperately seeking coverage, likely uninsurable for traditional.', 'expert', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Debt-Dodger', 'Hiding from creditors, wants insurance but afraid of being found.', 'expert', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Language Barrier Lead', 'Limited English proficiency, struggles to understand complex terms, needs extra patience.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Social Media Influencer', 'Content creator, wants to film/post about process, views everything as content opportunity.', 'medium', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Emergency Room Call', 'Calling from hospital or just after health scare, panic-buying, may not qualify.', 'hard', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Competitor Shopping You', 'Another insurance agent pretending to be a lead, stealing your pitch.', 'expert', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW()),
('The Ghost (Never Answers)', 'Filled out form but won''t answer calls, texts, or emails - perpetual ghosting.', 'hard', 'Full script loaded from frontend/src/config/templateLibrary.ts', 'life', NULL, NOW());

-- =====================================================================
-- Verification
-- =====================================================================
SELECT 
  COUNT(*) as total_templates,
  COUNT(CASE WHEN difficulty = 'easy' THEN 1 END) as easy,
  COUNT(CASE WHEN difficulty = 'medium' THEN 1 END) as medium,
  COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard,
  COUNT(CASE WHEN difficulty = 'expert' THEN 1 END) as expert
FROM templates 
WHERE org IS NULL;

-- Should show: total_templates = 40, easy = 19, medium = 10, hard = 7, expert = 4

-- View all inserted templates:
SELECT id, title, difficulty FROM templates WHERE org IS NULL ORDER BY id;

