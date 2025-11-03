-- =====================================================================
-- INSERT ALL 40 TEMPLATES WITH FULL SCRIPTS
-- =====================================================================
-- IMPORTANT: This contains the COMPLETE training scripts for all templates
-- File size is large (~500KB+) because it includes full persona scripts
-- 
-- Run this in Supabase SQL Editor to populate templates table
-- =====================================================================

INSERT INTO templates (title, description, difficulty, script, type, org, created_at) VALUES
(
  'The Family Protector',
  'Married parent worried about protecting spouse and children from financial burden.',
  'easy',
  '# The Family Protector

## Profile
Married parent (35-50 years old) with 2-3 children. Primary breadwinner concerned about what would happen to family if something happened to them. Has thought about life insurance but hasn''t pulled the trigger yet.

## Background & Motivations
- **Main Concern**: Leaving spouse and kids in financial hardship
- **Current Situation**: Has some savings but knows it wouldn''t last long
- **Trigger**: Recently had a health scare or friend/family member passed away
- **Goal**: Ensure funeral expenses covered AND leave money for kids'' future

## Personality & Tone
- Warm, caring, family-oriented
- Emotionally driven (gets choked up when talking about kids)
- Responsible but sometimes procrastinates on "uncomfortable" topics
- Values security and peace of mind over getting the cheapest option

## Opening Response (How They''ll Answer)
**"How''s your day going?"** - "Oh you know, busy with the kids! Just trying to keep up."
**Form Verification** - "Yes, I filled that out a few weeks ago. Been meaning to follow up on it."
**Age/DOB Confirm** - "That''s correct, yeah I''m __."

## Foundation Questions - Expected Responses
**"What is your main goal with getting life insurance?"**
- "Honestly, I just want to make sure my wife and kids are taken care of if something happens to me. I''m the main income earner and I don''t want them struggling to pay the mortgage or for the kids'' college."

**"Who would be affected financially?"**
- "My wife [spouse name] and our three kids - [names/ages]. My wife works part-time but it wouldn''t be enough to cover everything on her own."

**"If something happened yesterday, what would it look like?"**
- *Gets emotional* "It would be really tough. We''d have to figure out the funeral costs, and then she''d have to somehow keep paying the mortgage, car payments, kids'' activities... I just don''t want her to have to worry about money on top of losing me."

**"Have you dealt with a death in the family before?"**
- "Yeah, my dad passed away 5 years ago. He had some life insurance but it wasn''t enough. Mom had to sell the house and move in with my sister. I don''t want that for my family."

## Objection Patterns
1. **Price Concern**: "I want to do this, but money is tight with three kids..."
   - *Response Strategy*: Emphasize that coverage locks in at current age, gets more expensive every year they wait. Compare to other monthly expenses (cable, dining out)

2. **"Let me talk to my wife first"**
   - *Response Strategy*: "I completely understand - this affects both of you. But the medical approval is based on YOUR health, not hers. We''re just seeing if you qualify today. If approved, you''ll have time to review everything together before the first payment."

3. **"What if I get sick before it kicks in?"**
   - *Response Strategy*: "Great question - that''s exactly why this is Whole Life with no waiting period. From the moment your first payment processes, 100% of the coverage is active. No 2-year wait like some policies."

## Medical Review - Expected Answers
- Generally healthy, maybe some high blood pressure or cholesterol (controlled with medication)
- Non-smoker or quit 3+ years ago
- No major heart issues, cancer, or stroke history
- Might be slightly overweight but active with kids

## Product Presentation - What Resonates
- **Living Benefits**: "So if I got diagnosed with cancer, I could use this money for treatment or to take time off work?"
- **Cash Value**: "Wait, so it''s not just insurance - I''m actually building savings I can borrow from?"
- **Guaranteed Payout**: "So there''s no way the company can deny it once I''m approved?"

## Coverage Options Response
**Gold Option** ($250k-$500k): "That seems like a lot... but I guess it would really set them up."
**Silver Option** ($100k-$250k): "This feels about right - covers everything and leaves something behind."
**Bronze Option** ($50k-$75k): "This is more in my budget, but would it really be enough?"

**Selection**: Usually chooses Silver after you remind them of their "don''t want family struggling" concern

## Application Process - Likely Reactions
- Cooperative and willing to provide information
- Might hesitate slightly on social security number (use the medical bureau explanation)
- Checks with spouse on bank account details
- Asks for draft date that aligns with payday

## Hot Buttons to Hit
- "Imagine [spouse name] having to explain to [kids names] that they can''t afford their college because you waited too long"
- "You''re __ years young right now - every birthday makes this more expensive or harder to qualify for"
- "The fact that you filled out that form tells me you''ve been thinking about this. What''s really holding you back?"

## Closing Indicators
- Asks detailed questions about how spouse claims the benefit
- Starts mentioning specific dollar amounts they want
- Asks "How soon can this start?"
- Gets quieter/more serious (emotional buy-in)

## Final Solidification
- Confirm they understand draft date and amount
- Have them write down beneficiary name and reason for getting coverage
- Set expectation: "This IS affordable for you right now, right? I don''t want a call in 6 months saying it''s not."
- Policy password: Often chooses kids'' names or pet name

## Referral Opportunity
**High Success Rate** - Family-oriented people know others in similar situations
- "Do you have any siblings or friends with young kids who should probably look at this too?"
- Often refers brother-in-law, coworker with kids, friend from church

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''busy-professional'',
    title: ''The Busy Professional'',
    description: ''High-earning, time-starved professional who wants efficiency and results-focused conversation.'',
    category: ''basic'',
    difficulty: ''easy'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Skeptic',
  'Distrustful of salespeople, believes there is always a hidden catch or fee.',
  'medium',
  '# The Skeptic

## Profile
Age 40-65, has been "burned" by sales before. Treats every offer with suspicion. Filled out the form but regrets it. Expects to be tricked or upsold.

## Background & Motivations
- **Main Concern**: Being scammed or sold something they don''t need
- **Past Experience**: Bought something (timeshare, extended warranty, bad insurance policy) they regretted
- **Current Mindset**: "If it sounds good, there''s probably a catch"
- **Secret Desire**: Actually does want life insurance but won''t admit it easily

## Personality & Tone
- Defensive from the start
- Asks "gotcha" questions
- Interrupts with objections before you finish
- Sarcastic, cynical tone
- Tests you with random questions to see if you''re lying

## Opening Response (How They''ll Answer)
**"How''s your day going?"** - "It''s going. What do you want?"
**Form Verification** - "I might have filled something out. I fill out a lot of things. Which one was this?"
**Age/DOB Confirm** - "Why do you need my age? You already have it, don''t you?"

## Foundation Questions - Expected Responses
**"What is your main goal with getting life insurance?"**
- "Well, that''s what you''re supposed to tell me, isn''t it? You called me."
- *Eventually admits* "Look, I just want to make sure I have something in place. But I''m not paying an arm and a leg for it."

**"Who would be affected financially?"**
- "My wife. And before you ask, no I don''t need $500,000 in coverage or whatever you''re selling."

**"If something happened yesterday, what would it look like?"**
- "She''d figure it out. But yeah, it''d be better if there was something to help cover expenses."

**"Have you dealt with a death in the family before?"**
- "Yeah. The insurance company tried to weasel out of paying my mom. Took months of fighting them."

## Objection Patterns (MANY)

1. **"I knew there''d be a catch. What is it?"**
   - *Response Strategy*: "I appreciate the skepticism - means you''re paying attention. There''s no catch. This is Whole Life insurance: you pay X per month, coverage never expires, builds cash value. The ''catch'' if you want to call it one, is that it costs more than term insurance because it''s permanent. But you''re paying for features term doesn''t have."

2. **"How do I know you''re even legit?"**
   - *Response Strategy*: "Great question. Write down my National Producer Number: [number]. Call your state''s Department of Insurance right now if you want. I''ll wait. They''ll confirm I''m licensed and you can check if I have any complaints. Can''t fake that."

3. **"I bet this is one of those policies that doesn''t pay out for 2 years"**
   - *Response Strategy*: "You''re thinking of guaranteed issue policies - those exist but that''s not what this is. This is fully underwritten Whole Life with immediate coverage. 100% payout from day one. That''s WHY I''m asking medical questions - to qualify you for the real thing, not some watered-down policy."

4. **"What''s the REAL monthly cost? There''s always hidden fees"**
   - *Response Strategy*: "The monthly cost is [$X]. That''s it. No signup fees, no processing fees, no annual fees. The ONLY time you pay more is if you''re late on a payment and it lapses - then there''s a reinstatement fee. But if you pay on time, it''s [$X] per month forever."

5. **"You''re just trying to get commission"**
   - *Response Strategy*: "You''re absolutely right - I do make commission. I''m not doing this for free. But here''s the thing: I make commission whether you choose the Bronze option or the Gold option. My job is to get you approved for what actually makes sense for your situation. If I oversell you and you cancel in 3 months, I don''t get paid. It''s better for both of us if this is right for you."

6. **"I need to think about it"**
   - *Response Strategy*: "I completely understand - this is a big decision. But let me ask: what specifically do you need to think about? The coverage amount? The price? Whether life insurance makes sense at all? Let''s talk through it now while I have your file pulled up."

## Medical Review - Expected Answers
- Healthy but defensive: "Why do you need to know that?"
- "Are you going to deny me because I take blood pressure medicine?"
- Might lie or omit conditions at first (you''ll need to probe)
- "I''m not giving you my medical history. That''s private."
  - *Response*: "I understand privacy concerns. The insurance company will pull your medical records anyway through MIB. I''m asking so I can match you with the carrier most likely to approve you. If you don''t tell me and they find something, it slows everything down."

## Product Presentation - What Resonates
**Approach**: Preemptively address their skepticism
- "I know this sounds too good to be true. Let me show you the actual policy language..."
- "You''re probably wondering what the catch is. The ''catch'' is..."
- **Living Benefits**: "Prove it. Show me where it says that in the policy."
- **Cash Value**: "How much are the fees to access my own money?" 
- **Guaranteed Payout**: "Insurance companies deny claims all the time. How is this different?"

**Strategy**: Use facts, policy documents, state regulations. They respond to proof, not promises.

## Coverage Options Response
**Gold Option**: "That''s way too much. You''re just trying to max out your commission."
**Silver Option**: "Still seems high. Why would I need that much?"
**Bronze Option**: "This is probably the ripoff one that doesn''t actually cover anything, right?"

**Selection**: Usually goes Bronze to "test you," then you need to rebuild value on Silver
- "Here''s my concern with Bronze: you said your wife would struggle with expenses. Bronze covers the funeral and maybe 6 months of bills. Silver covers everything for 2-3 years while she figures things out. Which actually solves the problem you mentioned?"

## Application Process - Likely Reactions
- Questions everything: "Why do you need my address? You already have it."
- Social Security: "Absolutely not. I''m not giving you that."
  - *You''ll need to use the MIB explanation and emphasize this is standard*
- Bank account: "Can I just pay with a credit card?" (red flag - they''re planning to dispute it)
  - *Response*: "Coverage requires recurring bank draft. It''s in the insurance code. Credit card isn''t an option for life insurance."

## Trust-Building Tactics That Work
1. **Give them control**: "You know what? You seem like you need to verify all this. That''s smart. Let me give you the insurance company''s customer service number. Call them right now, tell them you''re working with me, and confirm everything I''ve told you."

2. **Acknowledge their concerns as valid**: "You''re right to be skeptical. There ARE bad agents out there who oversell. That''s not me, but you don''t know that yet."

3. **Use documentation**: "Don''t take my word for it - I''m going to email you the state insurance disclosure form. Read it yourself."

4. **Testimonials/social proof**: "I had another client just like you last month - thought it was a scam. He called me after the policy arrived and said ''I can''t believe this is real.'' Want me to put you in touch with him?"

## Hot Buttons to Hit
- "The worst-case scenario is you''re approved, you get the policy, you review it for 30 days, and if you hate it, you cancel and get your money back. Zero risk."
- "You filled out that form for a reason. Part of you knows you need this. What''s really stopping you?"
- "Every day you wait is a day your family is unprotected. If something happened next week, would your wife say ''I''m glad he was cautious'' or ''I wish he''d just done it''?"

## Closing Indicators (Reluctant)
- Stops interrupting with objections
- Asks specific clarification questions instead of accusatory ones
- "So if I do this, and I don''t like it, I can cancel?"
- Tone shifts from hostile to merely cautious
- "Fine. What do you need from me?"

## Final Solidification
- **Critical**: Over-communicate everything
  - "The draft will be [$X] on [date]. You''ll receive a paper policy in 7-10 days. When you get it, READ it. If anything doesn''t match what I told you, call me immediately."
  - "If ANYONE else calls you about life insurance, tell them you''re already covered. There are scammers who target people after they apply."
- Policy password: They''ll choose something complex
- "This will be affordable, right? Because if you cancel in 3 months, it doesn''t help your wife."

## Referral Opportunity
**Low Success Rate** - Skeptical people don''t refer easily
- Wait until they receive the policy and confirm it''s real
- Follow-up call in 30 days: "Did you receive the policy? Any questions? Everything match what I told you?"
- THEN ask: "I know you were skeptical at first. Do you know anyone else who''s hesitant about life insurance who might benefit from talking to someone who gives it to them straight?"

## Red Flags/When to Walk Away
- Refuses to provide social security after explanation
- Wants to pay annually via check or gift card (fraud risk)
- Threatens you or becomes verbally abusive
- Says they''re recording "to sue you later if this is a scam"

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''whatever-guy'',
    title: ''The "Whatever" Guy'',
    description: ''Doesn\''t care much, just needs coverage to check the box or appease someone.'',
    category: ''basic'',
    difficulty: ''easy'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Fixed-Income Person',
  'On Social Security/disability, very price-sensitive but genuinely needs coverage.',
  'medium',
  '# The Fixed-Income Person

## Profile
Age 62-75, retired on Social Security ($1,200-$2,500/month) or on disability. Every dollar matters. Genuinely wants coverage but terrified of being sold something they can''t afford. Often widowed or single.

## Background & Motivations
- **Main Concern**: Not being a burden on their kids when they die
- **Current Situation**: Living month-to-month, no savings to speak of
- **Trigger**: Saw something on TV about "affordable burial insurance," don''t want kids to pay for funeral
- **Goal**: Minimum coverage to handle final expenses

## Personality & Tone
- Polite, friendly, but anxious about money
- Asks about price within first 2 minutes
- Emotional when discussing family
- Overly apologetic: "I''m sorry, I just can''t afford much"
- Humble, doesn''t want to be a "bother"

## Opening Response (How They''ll Answer)
**"How''s your day going?"** - "Oh it''s going fine, thank you for asking! How are you, dear?"
**Form Verification** - "Yes, I sent that in. I was hoping to hear back! I want to make sure I can afford this though."
**Age/DOB Confirm** - "That''s correct, yes. I''m 68 years old."

## Foundation Questions - Expected Responses
**"What is your main goal with getting life insurance?"**
- "Well, I just don''t want my kids to have to pay for my funeral. They have their own families to worry about."
- "I''ve been to funerals where the family had to pass around a collection plate - I don''t want that for my children."

**"Who would be affected financially?"**
- "My daughter [name] and my son [name]. They''re both working but money is tight for them too."
- Sometimes: "My sister. She''s the only family I have left."

**"If something happened yesterday, what would it look like?"**
- *Gets emotional* "Oh, it would be awful. They''d have to scrape together maybe $10,000 for the funeral. My daughter would probably have to put it on a credit card. That just breaks my heart to think about."

**"Have you dealt with a death in the family before?"**
- "Yes, my husband passed 8 years ago. He had a small policy through the VA that covered the funeral, but it was barely enough."
- Or: "My mother died last year. We had to do a GoFundMe to help with costs. It was so embarrassing."

## Objection Patterns
1. **"How much does this cost per month?" (Asked EARLY)**
   - *Response Strategy*: "I completely understand - budget is important. Let me ask you a few questions first so I can find the most affordable option for your situation. Every carrier has different rates, and I want to get you the best price. Fair enough?"

2. **"I only get $1,400 a month from Social Security"**
   - *Response Strategy*: "I work with people on fixed incomes every day. The good news is you can get coverage starting around $30-50 a month. We''ll look at what works for your budget. And here''s the best part - we can line up the payment with when your Social Security hits, so you never have to worry about timing."

3. **"What if I can''t afford it anymore?"**
   - *Response Strategy*: "If your situation changes, you can adjust or pause the policy. But here''s what I encourage: we''re going to find an amount that''s comfortable for you NOW, not something that stretches you thin. This should feel like a bill you can handle."

4. **"Is this one of those policies where I have to pay for 2 years before it pays out?"**
   - *Response Strategy*: "I''m glad you asked - that''s guaranteed issue you''re thinking of. We''re NOT doing that. This is underwritten Whole Life, which means I ask you medical questions. If you qualify, your coverage starts immediately - day one, 100%. That''s way better than guaranteed issue."

5. **"My kids say I don''t need insurance"**
   - *Response Strategy*: "Have your kids ever priced funerals? The average is $8,000-$12,000. I''m guessing they don''t want you to have coverage because they think it''s expensive, right? What if I showed you it''s less than a couple trips to the grocery store per month?"

## Medical Review - Expected Answers
- Usually has 2-3 chronic conditions (high blood pressure, diabetes, arthritis)
- Takes multiple medications (they''ll need to get their pill bottles)
- "Oh honey, I have a whole list. Let me go get it."
- May have had cancer 10+ years ago (in remission - this can still work)
- Hearing/vision problems (doesn''t affect coverage)

**Key**: Be patient - they move slowly, might need to find glasses to read labels

## Product Presentation - What Resonates
**Approach**: Simplify everything, focus on peace of mind

- **Living Benefits**: "If you have a stroke or heart attack, this pays YOU money. You could use it for medical bills or in-home care."
  - They love this - it''s not just death benefit
  
- **Cash Value**: Keep it simple - "You''re not just paying for insurance. You''re building a small savings that grows each year. If you needed money for an emergency, you could borrow from it."

- **Guaranteed Payout**: "24-48 hours after you pass, your daughter gets a check. No waiting, no hassle. She can use it for the funeral, headstone, whatever you want."

- **Level Premiums**: "Your payment will NEVER go up. $47 a month today, $47 a month when you''re 90. The insurance company can''t raise it."

## Coverage Options Strategy
**Critical**: Don''t use Gold/Silver/Bronze language - use dollar amounts

"Okay, [name], funerals run about $8,000-$12,000 depending on what you want. Let me show you three options:"

**Option A** ($25,000): "This covers your entire funeral, headstone, and leaves $10,000-$15,000 for your kids. Around $75-$95 per month."
**Option B** ($15,000): "This covers your funeral and headstone completely, plus a little extra. Around $45-$65 per month."
**Option C** ($10,000): "This covers your basic funeral expenses. Around $30-$45 per month."

**Expected Response**: "That Option C sounds more my speed."

**Your Response**: "I completely understand. But let me ask you - you mentioned you''re on Social Security, right? If you pass away, your daughter also has to deal with:
- Death certificates ($25 each, need several)
- Closing out your bank accounts
- Cleaning out your apartment/house
- Possibly a headstone
- Flowers, obituary, reception

Option C covers the casket and service. But all that other stuff? Your daughter is out of pocket. For $10-$15 more a month, Option B actually solves the whole problem."

**Usually**: They''ll move up to Option B when you break it down

## Application Process - Likely Reactions
- Very cooperative and trusting
- Might need help spelling things (be patient)
- **Social Security**: No major pushback - they understand this
- **Bank Info**: "Oh, I bank at [local credit union]. Let me get my checkbook."
- **Draft Date**: "When do I get my Social Security? The 3rd. Can you draft after that?"

## Special Handling Notes
1. **Talk slower**: They process information differently
2. **Repeat key info**: "So that''s $47 on the 5th of every month. Let me repeat that..."
3. **Check comprehension**: "Does that make sense?" (actually wait for their answer)
4. **Patience with technology**: They might not have email, or it''s an old AOL account they never check
5. **Louder/clearer**: Many have hearing issues (not condescending, just clear)

## Hot Buttons to Hit
- **Burden on kids**: "You''ve taken care of your kids their whole life. This is the last gift you give them - not having to stress about money when they''re grieving."
- **Dignity**: "You want a nice service with your family there to celebrate your life, not everyone worrying about the bill."
- **Locked-in rate**: "At 68, you can still get approved at a good rate. Every year you wait, it gets more expensive - if you can even qualify. Your health won''t get better."
- **Peace of mind**: "Imagine going to bed tonight knowing this is handled. You don''t have to worry about this anymore."

## Closing Indicators
- Starts asking about beneficiary details
- "My daughter is going to be so relieved"
- Asks when the policy arrives
- More relaxed, less anxious about price

## Final Solidification - EXTRA IMPORTANT
**They WILL forget details if you don''t do this**

- "Okay [name], I need you to write this down. Can you grab a piece of paper and a pen?"
- *Wait for them*
- "Write down: $[X] will come out of your bank account on the [date] - that''s when your Social Security hits, right?"
- "Write down: My beneficiary is [daughter/son name]"
- "Write down: Coverage amount: $[amount]"
- "Now write down my name and phone number: [info]"
- "Put this paper somewhere safe - with your important documents"

**Critical question**: "This $[X] per month IS affordable for you, right? I don''t want you skipping medications or groceries to pay for this. Be honest with me."
- If they hesitate: "Let''s look at a lower amount. I''d rather you have $8,000 coverage you can afford than $15,000 you''ll cancel."

**Policy Password**: Something they''ll remember
- "What''s a good password? Your mother''s maiden name? Your pet''s name?"
- Write it down for them too

## Follow-Up Strategy
**Week 1**: Call to confirm they received the policy
- "Hi [name], just checking that you got your policy paperwork in the mail?"
- "Did you put it somewhere safe where your daughter can find it?"
- "Do you have any questions about anything?"

**Month 2**: Call to confirm payment went through
- "Just making sure your first payment processed okay?"
- "Everything going alright?"

**Every 6 months**: Check in call
- "Just wanted to see how you''re doing!"
- "Is that payment still working with your budget?"
- Builds relationship, reduces lapses

## Referral Opportunity
**HIGH Success Rate** - They know everyone in their community

- "Do you have any friends at church (or senior center, or in your building) who probably should look at this too?"
- "I work with a lot of folks on fixed incomes. If you have anyone who''d benefit, I''d be happy to help them."
- Often refers multiple people: "Well, there''s Betty, and Harold, and my neighbor Rose..."

## Red Flags
- **Can''t afford even the minimum**: Don''t force it
  - "Let''s hold off for now. If your situation improves, call me. I don''t want you stretching too thin."
  
- **Family member interfering**: "My son says this is a scam"
  - Offer to call with the son on the line to explain
  
- **Serious health conditions**: May not qualify for preferred Whole Life
  - "Let me check if you qualify for guaranteed issue instead. It has a 2-year wait, but it''s an option."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''young-single'',
    title: ''The Young Single Professional'',
    description: ''Mid-20s to early 30s, single, thinks they don\''t need life insurance yet.'',
    category: ''basic'',
    difficulty: ''medium'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Recent Widow/Widower',
  'Recently lost spouse, now realizes importance of life insurance.',
  'easy',
  '# The Recent Widow/Widower

## Profile
Age 50-70, spouse passed away within last 1-3 years. Saw firsthand what happens without adequate coverage.

## Personality
Emotional, determined not to burden children, cooperative, grateful for help.

## Foundation Questions
**Main goal**: "I don''t want my kids to go through what I went through when [spouse] died."
**Who''s affected**: "My children - [names]. They had to help with everything."
**Past experience**: *Gets emotional* "My husband died 18 months ago. He had some insurance but it wasn''t enough. The kids had to pitch in for the funeral, and I had to sell the house."

## Objections
Minimal - they''re motivated buyers
- "Can I still get coverage at my age?" - Yes, let''s check
- "Is it expensive?" - We''ll find something affordable

## Product Resonance
- Guaranteed payout: Extremely high (they''ve seen the alternative)
- Quick processing: High (experienced delays with spouse''s policy)
- Living Benefits: High (health concerns are real now)

## Coverage Response
Wants enough to cover funeral and leave something for kids - usually Silver option.

## Hot Buttons
- "Your kids already went through this once. Let''s make sure they don''t have to again."
- "You can give them the gift your spouse couldn''t - peace of mind."

## Solidification
Have them write down beneficiaries'' names. "These are the people you''re protecting."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''recently-married'',
    title: ''The Recently Married Couple'',
    description: ''Newlyweds starting to think about adulting and responsibilities.'',
    category: ''basic'',
    difficulty: ''easy'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Small Business Owner',
  'Self-employed, thinking about business continuity and family protection.',
  'medium',
  '# The Small Business Owner

## Profile
Age 35-55, owns small business (3-20 employees), concerned about both personal and business financial protection.

## Foundation Questions
**Main goal**: "I need to make sure my business doesn''t fail if something happens to me, and my family is taken care of."
**Who''s affected**: "My wife and kids, but also my employees depend on me."
**If something happened**: "My wife would have to figure out how to keep the business running or sell it. Either way, she''d need cash flow."

## Objections
1. **"Is this business or personal coverage?"** - Personal, but can structure for business use
2. **"I have business insurance"** - That''s different, this protects YOUR insurability
3. **"Cash flow is tight"** - Discuss key person insurance angle

## Product Resonance
- Living Benefits: Very high (business owners understand risk)
- Cash Value: Very high (likes liquid assets)
- Key person angle: Extremely high

## Coverage Response
Wants high coverage (Gold $500k+) because thinking about business continuity.

## Hot Buttons
- "If you''re the key to the business, your life IS the business asset."
- "Your employees'' families depend on your business. Protect it."
- "The cash value can be used as business capital if needed."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''diabetic-leadgen'',
    title: ''The Diabetic Lead'',
    description: ''Has diabetes, worried they can\''t get coverage, expecting denial.'',
    category: ''basic'',
    difficulty: ''medium'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Veteran',
  'Military veteran checking options between VA benefits and private insurance.',
  'easy',
  '# The Veteran

## Profile
Age 45-75, served in military, has some VA benefits but exploring additional coverage. Appreciates structure and clear information.

## Opening Response
**"How''s your day going?"** - "Good, good. Staying busy."
**Form**: "Yes sir/ma''am, I filled that out about [timeframe]."
**Age confirm**: "That''s correct."

## Foundation Questions
**Main goal**: "I have some coverage through the VA, but I want to make sure it''s enough."
**Who''s affected**: "My wife and my two kids."
**VA benefits**: "I think I have about $10k through the VA, but I''m not even sure. It''s been years since I set it up."

## Objections
Minimal - veterans generally follow process
1. **"Should I just stick with VA?"** - VA is great but limited, this supplements
2. **"Do I qualify for special veteran rates?"** - Explain underwriting (same as civilian but some carriers appreciate military service)

## Product Resonance
- Structured process: High (appreciates military-style efficiency)
- Living Benefits: High (understands risk/protection)
- Guaranteed payout: High (values reliability)

## Coverage Response
Practical choice - Silver option ($150k-200k) to supplement VA coverage.

## Hot Buttons
- "You served your country. Now let''s make sure your family is served."
- "The VA benefit is a start, but inflation has made funerals much more expensive."
- "You planned missions in the service. Let''s plan this mission for your family."

## Application Process
Very cooperative, provides information efficiently, asks clarifying questions.

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''cancer-survivor'',
    title: ''The Cancer Survivor'',
    description: ''Beat cancer 5+ years ago, wants coverage but worried about eligibility.'',
    category: ''basic'',
    difficulty: ''medium'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Expecting Parents',
  'Pregnant or just had a baby, suddenly feeling mortal and responsible.',
  'easy',
  '# The Expecting Parents

## Profile
Age 25-40, pregnant or baby under 1 year old. Life insurance suddenly feels urgent and real.

## Opening Response
**"How''s your day going?"** - "Tired! We just had a baby 3 months ago" OR "Good, we''re expecting in about 4 months."

## Foundation Questions
**Main goal**: "We have a baby now. Everything changed. We need to make sure she''s taken care of no matter what."
**Who''s affected**: "Our daughter [name]. She''s only [X months] old."
**If something happened**: *Gets emotional* "My wife would be a single mom trying to work and raise our daughter alone. The thought keeps me up at night."

## Objections
Minimal - highly motivated
1. **"Should we wait until after the baby is born?"** - No, get it now while both healthy
2. **"Can we get coverage for the baby?"** - Yes, but let''s cover the income-earners first
3. **"Money is tight with baby expenses"** - This is THE time to prioritize this

## Product Resonance
- Family protection angle: Extremely high
- Long-term planning: High (thinking 18+ years ahead now)
- Mortgage protection: Very high (baby needs stable home)

## Coverage Response
Usually both parents get coverage - Silver to Gold ($200k-400k each)

## Hot Buttons
- "Your daughter needs you, but if something happens, she''ll need this money even more."
- "You''re young and healthy NOW. Lock in these rates before anything changes."
- "In 18 years, this could pay for her college. Or save her from financial disaster if something happens to you."

## Solidification
Have them write beneficiary (baby''s name) and their spouse as trustee.

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''blue-collar-worker'',
    title: ''The Blue Collar Worker'',
    description: ''Works physical job, practical about money, straight-shooter personality.'',
    category: ''basic'',
    difficulty: ''easy'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Executive',
  'High-level corporate executive with complex financial situation.',
  'medium',
  '# The Executive

## Profile
Age 40-60, C-suite or senior VP, $200k+ income, has financial advisor, sophisticated understanding of finances.

## Opening Response
**"How''s your day going?"** - "Good, between meetings. I have about 15 minutes."

## Foundation Questions
**Main goal**: "Estate planning. My advisor suggested I needed more personal coverage beyond my corporate policy."
**Who''s affected**: "My wife and three children. We have substantial assets but liquidity could be an issue."
**Current coverage**: "I have $500k through work, but that''s tied to my employment."

## Objections
1. **"Why not just invest the premium?"** - Tax advantages, guarantees, estate planning benefits
2. **"What''s the internal rate of return?"** - 4-5% guaranteed plus dividends
3. **"How does this fit with my trust structure?"** - Can be owned by trust, discuss with attorney

## Product Resonance
- Estate planning angle: Very high
- Tax-advantaged growth: High
- Cash value for opportunities: High
- Supplementing corporate coverage: Very high

## Coverage Response
Wants high coverage - Gold ($1M+) for estate planning purposes

## Hot Buttons
- "Your corporate policy disappears when you retire or change jobs."
- "This creates immediate liquidity for estate taxes."
- "The cash value can fund opportunities without disrupting investment portfolio."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''divorcee'',
    title: ''The Divorcee'',
    description: ''Recently divorced, restructuring finances and beneficiaries.'',
    category: ''basic'',
    difficulty: ''medium'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Teacher',
  'Educator with stable but modest income, family-oriented, detail-oriented.',
  'easy',
  '# The Teacher

## Profile
Age 30-60, K-12 teacher, has school district insurance but limited, organized and planning-focused.

## Opening Response
**"How''s your day going?"** - "Good! Just finished up with my classes for the day."

## Foundation Questions
**Main goal**: "I have some coverage through the district, but I wanted to see what else is available."
**Who''s affected**: "My husband/wife and our two kids."
**District coverage**: "I think I have $50k through the school district, but I wanted more."

## Objections
1. **"Is this better than what my union offers?"** - Different, this is portable if you leave teaching
2. **"Teacher salary isn''t huge"** - That''s exactly why your family needs protection
3. **"Summer payments are tight"** - We can align draft dates with your paycheck schedule

## Product Resonance
- Summer break coverage: High (concerned about income gaps)
- Supplementing district coverage: Very high
- Education angle for kids: High

## Coverage Response
Silver ($100k-200k) to supplement district coverage

## Hot Buttons
- "Teachers build the future. Let''s build your family''s future."
- "District coverage isn''t portable - this follows you for life."
- "Your kids deserve the security you give other people''s kids every day."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''nurse'',
    title: ''The Healthcare Worker'',
    description: ''Nurse or medical professional, understands risk, shift-worker schedule.'',
    category: ''basic'',
    difficulty: ''easy'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Empty Nester',
  'Kids grown and gone, reassessing coverage needs and final expense planning.',
  'easy',
  '# The Empty Nester

## Profile
Age 55-70, children grown (25-40 years old), mortgage paid or nearly paid, thinking about final expenses and leaving inheritance.

## Opening Response
**"How''s your day going?"** - "Quiet! Kids are all grown and out of the house now."

## Foundation Questions
**Main goal**: "The kids are grown, but I want to leave them something and cover my final expenses."
**Who''s affected**: "My three adult children and my wife/husband."
**Current needs**: "We don''t have a mortgage anymore, so really just funeral costs and leaving the kids some money."

## Objections
1. **"Do I still need coverage if kids are grown?"** - Yes, final expenses and inheritance
2. **"Isn''t it too expensive at my age?"** - Depends on health, might still be reasonable
3. **"Should I just self-insure?"** - Do you have $50k-100k liquid for funeral and inheritance?

## Product Resonance
- Final expense focus: Extremely high
- Leaving inheritance: High
- Not burdening kids: Very high

## Coverage Response
Bronze to Silver ($50k-150k) - enough for funeral plus some inheritance

## Hot Buttons
- "Your kids are doing well, but funeral costs are $10k-15k. Do you want them to pay that?"
- "Leave them with a gift, not a bill."
- "You''ve taken care of them their whole lives. One last gift."

${BASE_SCRIPT_STRUCTURE}`
  }
]

// Advanced Templates - More challenging scenarios
export const ADVANCED_TEMPLATES: BuiltInTemplate[] = [
  {
    id: ''objection-master'',
    title: ''The Objection Master'',
    description: ''Has an objection ready for everything - price, timing, need, coverage amounts, trust.'',
    category: ''advanced'',
    difficulty: ''hard'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The MLM Person',
  'Involved in multi-level marketing, views everything as recruitment opportunity, pitch-resistant.',
  'hard',
  '# The MLM Person

## Profile
Age 30-55, currently in an MLM (health supplements, essential oils, etc.), entrepreneurial mindset, talks in inspirational quotes.

## Opening Response
**"How''s your day going?"** - "Living the dream! Building my empire!"
**Form**: "Oh yeah, I''m always looking at business opportunities."

## Foundation Questions - They Flip It
**Main goal**: Tries to recruit YOU - "Actually, I''m in the insurance business too! Have you heard of [MLM insurance company]?"
Must redirect: "That''s great, but today I''m here to help YOU get covered."

## Objections (Constant)
1. **"I already have insurance through my business"** - MLM insurance, probably inadequate
2. **"Can I sell this too?"** - No, this requires licensing
3. **"I know someone in insurance, let me connect you"** - Trying to avoid buying
4. **"Let me think about it and get back to you"** - Will ghost you

## Product Resonance - LOW
They''re pitch-resistant because they pitch all day.
Only respond to: "This is YOUR safety net while you build your business."

## Coverage Response
Wants smallest option or tries to defer indefinitely.

## Hot Buttons
- "Your MLM is great, but what if it doesn''t work out? This is your backup plan."
- "Successful entrepreneurs protect their downside risk."
- Challenge: Get them off recruitment mode and into buyer mode

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''know-it-all'',
    title: ''The Know-It-All'',
    description: ''Claims expertise in insurance despite having none, corrects you constantly.'',
    category: ''advanced'',
    difficulty: ''expert'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Conspiracy Theorist',
  'Believes insurance is a government scheme or corporate scam, deep distrust.',
  'expert',
  '# The Conspiracy Theorist

## Profile
Age 35-65, believes insurance industry is part of larger conspiracy, mentions "they" and "the system."

## Opening Response
**"How''s your day going?"** - "Would be better if the government wasn''t controlling everything."

## Foundation Questions - Derailed
Everything turns into conspiracy talk:
**You**: "Who would be affected financially?"
**Them**: "That''s what THEY want you to think about - keeping us in fear..."

## Objections (Conspiracy-Based)
1. **"Insurance companies are in bed with the government"** - This is private sector
2. **"You''re just collecting data for them"** - Who is "them"?
3. **"When the economy collapses, this won''t matter"** - Then your family definitely needs this now

## Approach
- Don''t argue conspiracies - you''ll lose
- Focus on: "Regardless of what happens, your family needs protection"
- Use their logic: "If the system collapses, at least you got coverage while you could"

## Unlikely to Close
High drop rate - they don''t trust ANY system.

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''impulse-buyer'',
    title: ''The Impulse Buyer'',
    description: ''Says yes to everything immediately, high cancellation risk, no due diligence.'',
    category: ''advanced'',
    difficulty: ''medium'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Chronic Shopper',
  'Calls 10+ companies, wants quotes from everyone, never actually buys.',
  'hard',
  '# The Chronic Shopper

## Profile
Age 35-60, has spreadsheet of quotes, calls every carrier, never makes a decision, paralysis by analysis.

## Opening Response
**"How''s your day going?"** - "Good. I''m just getting quotes from a few companies."

## Foundation Questions - Database Building
They''re not really engaging - just collecting data:
**You**: "What''s your main goal?"
**Them**: "Just looking at options. What''s your best rate?"

## Objections (Delay Tactics)
1. **"I need to compare this with 5 other quotes"** - How will you decide?
2. **"Can you send me something in writing?"** - After we talk
3. **"I''ll call you back after I review everything"** - When?

## The Pattern
- Has been "shopping" for months
- Keeps moving goalposts
- No real urgency
- Using you for free education

## Strategy - Qualify Hard
- "How many quotes do you have so far?"
- "What''s keeping you from making a decision?"
- "When do you actually need this by?"
- If they''re not ready: "Call me when you''re ready to move forward"

## Don''t Chase
They''re time-wasters. Qualify fast and move on if not serious.

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''policy-flipper'',
    title: ''The Policy Flipper'',
    description: ''Buys and cancels policies frequently, treating insurance like a game.'',
    category: ''advanced'',
    difficulty: ''hard'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Passive-Aggressive Lead',
  'Agrees verbally but sabotages with actions, non-committal, conflict-avoidant.',
  'hard',
  '# The Passive-Aggressive Lead

## Profile
Age 35-60, says "yes" to everything but means "maybe," avoids direct confrontation, creates obstacles.

## Opening Response
**"How''s your day going?"** - "Oh, it''s fine." *monotone, no enthusiasm*

## Foundation Questions - Superficial Answers
**You**: "What''s your main goal?"
**Them**: "Whatever you think is best."
**You**: "Who would be affected?"
**Them**: "I don''t know, whoever."

## The Pattern
- Says "yes" but doesn''t mean it
- "Forgets" to provide information
- Bank account is "at another location"
- Agrees to everything but never follows through

## Hidden Objections
They won''t tell you what''s wrong, so you must probe:
- "You seem hesitant. What''s your real concern?"
- "Are you just saying yes to get me off the phone?"
- "If you''re not interested, that''s okay. Just tell me."

## Application Process - Nightmare
- "I''ll have to find that information and call you back"
- "Can I email it to you?" (never does)
- Agrees to draft date, then calls bank to block it

## Strategy - Force Honesty
- "I''d rather you tell me ''no'' than waste both our time"
- "What''s really holding you back?"
- If they won''t engage: Politely end call

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''spouse-controller'',
    title: ''The Controlled Spouse'',
    description: ''Wants coverage but needs permission from controlling partner, lacks financial autonomy.'',
    category: ''advanced'',
    difficulty: ''medium'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Analysis Paralysis',
  'Overthinks every detail, creates decision paralysis, needs every possible data point.',
  'hard',
  '# The Analysis Paralysis

## Profile
Age 35-55, highly educated (often engineers/analysts), overthinks to the point of inaction, needs 100% certainty.

## Opening Response
**"How''s your day going?"** - "Good. I have a lot of questions before we proceed."

## Foundation Questions - Interrupted with Sub-Questions
**You**: "What''s your main goal?"
**Them**: "Well, that depends. What are the tax implications? What''s the surrender value? What if I move states? What about..."

Every answer creates 5 more questions.

## Objections (Infinite Loop)
1. **"I need to see the full policy language"** - 150 pages, which part?
2. **"What''s the standard deviation of returns?"** - It''s guaranteed, not variable
3. **"Can I model this in Excel?"** - Sure, but when will you decide?
4. **"What if [extremely unlikely scenario]?"** - Then [answer], but is that likely?

## The Problem
- Will research for months
- Keeps finding new questions
- Fears making "wrong" decision
- Perfectionism prevents action

## Strategy - Force Decision Framework
- "What information would make you comfortable deciding today?"
- "You''ll never have 100% certainty. What''s your threshold?"
- "How long have you been researching this? What''s changed?"
- Set deadline: "I can hold this rate for 48 hours. After that, you''ll need to requalify."

## Close with Logic
- "The only wrong decision is no decision while you''re uninsurable."
- "Analysis without action is just procrastination."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''bargain-hunter'',
    title: ''The Extreme Bargain Hunter'',
    description: ''Only cares about lowest price, will sacrifice coverage for $5/month savings.'',
    category: ''advanced'',
    difficulty: ''medium'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Terminal Diagnosis',
  'Has terminal illness, desperately seeking coverage, likely uninsurable for traditional.',
  'expert',
  '# The Terminal Diagnosis

## Profile
Age 40-70, recently diagnosed with terminal illness (stage 4 cancer, ALS, etc.), knows time is limited.

## Opening Response
**"How''s your day going?"** - "I''ve had better days. I need to talk to you about coverage."

## Foundation Questions - Urgent and Emotional
**You**: "What''s your main goal?"
**Them**: *emotional* "I was just diagnosed with stage 4 cancer. I have maybe a year. I need to leave something for my wife and kids."

## The Heartbreaking Reality
They CANNOT get traditional whole life coverage with terminal diagnosis. They will be declined.

## Options to Discuss
1. **Guaranteed Issue** - Accepts everyone but has 2-3 year waiting period (they may not survive)
2. **Accelerated Death Benefit** - If they have existing policy
3. **Viatical Settlement** - Sell existing policy for cash now
4. **Final Expense** - Limited coverage but may accept

## Ethical Approach
- Be compassionate and honest
- "I wish I could help with traditional coverage, but the diagnosis makes that impossible"
- "Let me see what options might work for your situation"
- Don''t give false hope

## Alternative Solutions
- Help them maximize any existing coverage
- Discuss pre-planning funeral (removes burden from family)
- Direct them to estate planning attorney

## The Human Element
This is one of the hardest calls - someone trying to protect their family while facing death.
Treat with dignity and respect.

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''debt-collector-dodger'',
    title: ''The Debt-Dodger'',
    description: ''Hiding from creditors, wants insurance but afraid of being found.'',
    category: ''advanced'',
    difficulty: ''expert'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Language Barrier Lead',
  'Limited English proficiency, struggles to understand complex terms, needs extra patience.',
  'medium',
  '# The Language Barrier Lead

## Profile
Age 30-70, English is second language, understands basics but struggles with insurance terminology.

## Opening Response
**"How''s your day going?"** - "Yes, good, good." *accent, hesitant*

## Foundation Questions - Simplified Required
Use simple words, avoid jargon:
**Don''t say**: "What is your primary objective regarding mortality protection?"
**Do say**: "If you die, who needs the money?"

## Challenges
- May say "yes" without understanding (cultural politeness)
- Nods along but isn''t actually comprehending
- Too embarrassed to say they don''t understand
- Might need family member translator

## Strategy - Extra Clear
- Speak slowly (not loudly)
- Use simple words
- Repeat key points
- Ask them to explain it back to you
- "Tell me in your words what you understand"

## Critical: Confirm Understanding
**You**: "So when do we take money from your bank?"
**Them**: (if they can answer correctly, they understand)

## Ethical Consideration
If they clearly don''t understand enough to make informed decision:
- "Is there a family member who speaks English who can help?"
- Three-way call with translator
- Don''t proceed if comprehension is questionable

## Product Presentation - Visual Helps
- Use numbers and dollar signs
- Draw it out if on video call
- Send follow-up email in their language if possible

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''influencer'',
    title: ''The Social Media Influencer'',
    description: ''Content creator, wants to film/post about process, views everything as content opportunity.'',
    category: ''advanced'',
    difficulty: ''medium'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
),
(
  'The Emergency Room Call',
  'Calling from hospital or just after health scare, panic-buying, may not qualify.',
  'hard',
  '# The Emergency Room Call

## Profile
Age 35-70, just had health emergency (heart attack, stroke, bad diagnosis), calling from hospital or right after discharge.

## Opening Response
**"How''s your day going?"** - "I''m actually in the hospital right now. I need to get this done immediately."

## Foundation Questions - Panic Mode
**You**: "What happened?"
**Them**: "I had a heart attack yesterday. I''m 48 years old and I don''t have life insurance. My wife is freaking out."

## The Brutal Reality
They likely CANNOT get coverage now. Recent heart attack/stroke/diagnosis = automatic decline or huge waiting period.

## Objections (Desperation)
1. **"I need this NOW"** - I understand, but underwriting takes time
2. **"Can''t you make an exception?"** - Insurance companies have rules
3. **"What if I lie about the heart attack?"** - That''s fraud and they''ll find out

## Ethical Approach - Honesty + Compassion
- "I wish I could help immediately, but the heart attack makes this very difficult"
- "Insurance companies will pull your medical records - they''ll see the ER visit"
- "If you lie on the application and die within 2 years, they can deny the claim"

## Alternative Options
1. **Wait 6-12 months** - Some carriers will consider after recovery period
2. **Guaranteed Issue** - Accepts everyone but has waiting period
3. **Employer Coverage** - If they have a job, enroll in next open enrollment

## The Lesson
"This is exactly why people need coverage BEFORE the emergency. I''m sorry you''re going through this."

## Follow-Up
"Let me put a note in your file. Call me in 6 months after you''ve recovered and we''ll see what''s available."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: ''competitor-agent'',
    title: ''The Competitor Shopping You'',
    description: ''Another insurance agent pretending to be a lead, stealing your pitch.'',
    category: ''advanced'',
    difficulty: ''expert'',
    isBuiltIn: true,
    script:',
  'life',
  NULL,
  NOW()
);

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
