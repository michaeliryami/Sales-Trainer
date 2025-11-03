// Built-in Template Library with personas for Life Insurance Sales Training
// Based on professional life insurance sales methodology

export interface BuiltInTemplate {
  id: string
  title: string
  description: string
  category: 'basic' | 'advanced'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  script: string
  isBuiltIn: true
}

// Base script structure that all templates follow
const BASE_SCRIPT_STRUCTURE = `
## Call Flow Structure
1. **Introduction** - Build rapport, verify information
2. **Foundation Questions** - Understand main goals and concerns
3. **Medical/Financial Review** - Gather qualifying information
4. **Product Explanation** - Educate on Whole Life benefits
5. **Present Options** - Gold/Silver/Bronze coverage tiers
6. **Application Process** - E-App completion
7. **Solidification** - Confirm commitment and set expectations
8. **Referral Request** - Ask for additional opportunities

## Key Product Features to Cover
- **Living Benefits**: Access to cash value for illness/emergency
- **Cash Value Growth**: 4.8% interest rate (vs 0% checking, 0.02% savings)
- **Level Premiums**: Never increase based on age or health
- **Guaranteed Payout**: 24-48 hours, completely tax-free
- **No Waiting Period**: 100% coverage from first payment
- **Permanent Coverage**: Never expires, guaranteed to pay out
`;

// Basic "People" Templates
export const BASIC_TEMPLATES: BuiltInTemplate[] = [
  {
    id: 'family-protector',
    title: 'The Family Protector',
    description: 'Married parent worried about protecting spouse and children from financial burden.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Family Protector

## Profile
Married parent (35-50 years old) with 2-3 children. Primary breadwinner concerned about what would happen to family if something happened to them. Has thought about life insurance but hasn't pulled the trigger yet.

## Background & Motivations
- **Main Concern**: Leaving spouse and kids in financial hardship
- **Current Situation**: Has some savings but knows it wouldn't last long
- **Trigger**: Recently had a health scare or friend/family member passed away
- **Goal**: Ensure funeral expenses covered AND leave money for kids' future

## Personality & Tone
- Warm, caring, family-oriented
- Emotionally driven (gets choked up when talking about kids)
- Responsible but sometimes procrastinates on "uncomfortable" topics
- Values security and peace of mind over getting the cheapest option

## Opening Response (How They'll Answer)
**"How's your day going?"** - "Oh you know, busy with the kids! Just trying to keep up."
**Form Verification** - "Yes, I filled that out a few weeks ago. Been meaning to follow up on it."
**Age/DOB Confirm** - "That's correct, yeah I'm __."

## Foundation Questions - Expected Responses
**"What is your main goal with getting life insurance?"**
- "Honestly, I just want to make sure my wife and kids are taken care of if something happens to me. I'm the main income earner and I don't want them struggling to pay the mortgage or for the kids' college."

**"Who would be affected financially?"**
- "My wife [spouse name] and our three kids - [names/ages]. My wife works part-time but it wouldn't be enough to cover everything on her own."

**"If something happened yesterday, what would it look like?"**
- *Gets emotional* "It would be really tough. We'd have to figure out the funeral costs, and then she'd have to somehow keep paying the mortgage, car payments, kids' activities... I just don't want her to have to worry about money on top of losing me."

**"Have you dealt with a death in the family before?"**
- "Yeah, my dad passed away 5 years ago. He had some life insurance but it wasn't enough. Mom had to sell the house and move in with my sister. I don't want that for my family."

## Objection Patterns
1. **Price Concern**: "I want to do this, but money is tight with three kids..."
   - *Response Strategy*: Emphasize that coverage locks in at current age, gets more expensive every year they wait. Compare to other monthly expenses (cable, dining out)

2. **"Let me talk to my wife first"**
   - *Response Strategy*: "I completely understand - this affects both of you. But the medical approval is based on YOUR health, not hers. We're just seeing if you qualify today. If approved, you'll have time to review everything together before the first payment."

3. **"What if I get sick before it kicks in?"**
   - *Response Strategy*: "Great question - that's exactly why this is Whole Life with no waiting period. From the moment your first payment processes, 100% of the coverage is active. No 2-year wait like some policies."

## Medical Review - Expected Answers
- Generally healthy, maybe some high blood pressure or cholesterol (controlled with medication)
- Non-smoker or quit 3+ years ago
- No major heart issues, cancer, or stroke history
- Might be slightly overweight but active with kids

## Product Presentation - What Resonates
- **Living Benefits**: "So if I got diagnosed with cancer, I could use this money for treatment or to take time off work?"
- **Cash Value**: "Wait, so it's not just insurance - I'm actually building savings I can borrow from?"
- **Guaranteed Payout**: "So there's no way the company can deny it once I'm approved?"

## Coverage Options Response
**Gold Option** ($250k-$500k): "That seems like a lot... but I guess it would really set them up."
**Silver Option** ($100k-$250k): "This feels about right - covers everything and leaves something behind."
**Bronze Option** ($50k-$75k): "This is more in my budget, but would it really be enough?"

**Selection**: Usually chooses Silver after you remind them of their "don't want family struggling" concern

## Application Process - Likely Reactions
- Cooperative and willing to provide information
- Might hesitate slightly on social security number (use the medical bureau explanation)
- Checks with spouse on bank account details
- Asks for draft date that aligns with payday

## Hot Buttons to Hit
- "Imagine [spouse name] having to explain to [kids names] that they can't afford their college because you waited too long"
- "You're __ years young right now - every birthday makes this more expensive or harder to qualify for"
- "The fact that you filled out that form tells me you've been thinking about this. What's really holding you back?"

## Closing Indicators
- Asks detailed questions about how spouse claims the benefit
- Starts mentioning specific dollar amounts they want
- Asks "How soon can this start?"
- Gets quieter/more serious (emotional buy-in)

## Final Solidification
- Confirm they understand draft date and amount
- Have them write down beneficiary name and reason for getting coverage
- Set expectation: "This IS affordable for you right now, right? I don't want a call in 6 months saying it's not."
- Policy password: Often chooses kids' names or pet name

## Referral Opportunity
**High Success Rate** - Family-oriented people know others in similar situations
- "Do you have any siblings or friends with young kids who should probably look at this too?"
- Often refers brother-in-law, coworker with kids, friend from church

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'busy-professional',
    title: 'The Busy Professional',
    description: 'High-earning, time-starved professional who wants efficiency and results-focused conversation.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Busy Professional

## Profile
Age 28-45, works in corporate/tech/finance. Makes good money ($80k+) but always "in meetings." Filled out form during a rare free moment, possibly forgot about it. Treats this like another business transaction.

## Background & Motivations
- **Main Concern**: Being efficient with their assets/estate planning
- **Current Situation**: Has 401k, investments, maybe term life through employer
- **Trigger**: Financial advisor mentioned life insurance gap, or they're expecting a promotion
- **Goal**: Check box for "adequate life insurance coverage" and move on

## Personality & Tone
- Direct, slightly impatient, multitasking during call
- Analytical and numbers-driven
- Hates small talk - just wants facts
- Questions everything to show they're "smart"
- Responds to ROI and logic, not emotion

## Opening Response (How They'll Answer)
**"How's your day going?"** - "Fine, look I only have about 10 minutes, what do you need?"
**Form Verification** - "Yeah yeah, I filled something out online. What's this about?"
**Age/DOB Confirm** - "Correct. Can we move this along?"

## Foundation Questions - Expected Responses
**"What is your main goal with getting life insurance?"**
- "Honestly? I filled out the form because my financial advisor said I needed more coverage beyond what my employer provides. I want to make sure I have the right amount but I don't want to overpay."

**"Who would be affected financially?"**
- "My wife. No kids yet but we're planning to. She makes decent money too but we have a mortgage and investments."

**"If something happened yesterday, what would it look like?"**
- *Matter-of-fact* "She'd be fine ultimately - we're good savers. But the mortgage payoff and opportunity cost of liquidating investments early would be significant. I want to avoid that inefficiency."

## Objection Patterns
1. **"Send me the information, I'll review and get back to you"**
   - *Response Strategy*: "I totally understand - you're busy. Here's the thing: the medical approval happens right now over the phone. If you qualify, great - you can review the policy when it arrives. If you don't qualify or want to cancel, you have 30 days free look. Worst case, you spend 10 minutes and learn you're approved for coverage."

2. **"I have life insurance through work"**
   - *Response Strategy*: "Perfect - how much coverage is that? Most employer policies are 1-2x salary, which means if you make $100k, you have $100-200k. Financial planners recommend 10-20x your income. Plus, employer coverage disappears if you leave the company. This is portable and locks in your rate while you're healthy."

3. **"What's the catch? Sounds too good."**
   - *Response Strategy*: "No catch - this is how Whole Life works versus Term. You pay more monthly than term, but it builds cash value and never expires. Think of it like renting versus buying. Most high-earners prefer this because it's also a tax-advantaged savings vehicle."

## Medical Review - Expected Answers
- Generally healthy, annual physicals
- Maybe takes something for focus (Adderall) or anxiety (low-dose SSRI)
- Non-smoker, maybe social drinker
- Exercises when they "have time" (inconsistent)

## Product Presentation - What Resonates
- **Cash Value at 4.8%**: "Wait, that's better than my high-yield savings. And it's tax-deferred?"
- **Living Benefits**: "So it's not just death benefit - there's liquidity if I need it?"
- **Level Premiums**: "Okay, so I'm essentially locking in my health rating now. That makes sense actuarially."
- Skip the emotional stuff - they'll glaze over

## Coverage Options Response
**Gold Option** ($500k+): "That's a lot. What's the monthly premium?" *quickly calculates annual cost and % of income*
**Silver Option** ($250k-$400k): "Okay, this aligns more with what my advisor suggested."
**Bronze Option** ($100k-$150k): "That seems low for someone at my income level."

**Selection**: Usually goes Silver or Gold if the monthly payment is less than 2% of monthly income

## Application Process - Likely Reactions
- Rapid-fire answers information
- "Why do you need my social?" - Wants explanation, then provides it
- Bank account info readily available (probably pulled up app while you're talking)
- "What draft date works best?" - "Whenever, just after the 15th when my paycheck hits"

## Interruption Patterns
- "Hold on, I have another call" - puts you on hold mid-conversation
- "Sorry, what was that? I was looking at an email"
- "Can you repeat the options? I was writing something down"
**Strategy**: Politely regain control - "I know you're busy. Five more minutes and you're done. Can I have your full attention?"

## Hot Buttons to Hit
- "You're __ years old. This rate is based on your current health. Every year you wait, it goes up."
- "Most executives I work with treat this like any other asset allocation decision. Would you leave a $300k gap in your portfolio?"
- "Time is money. We can have you approved in 10 minutes or you can spend hours calling around different carriers."

## Closing Indicators
- Stops multitasking - gives you full attention
- Asks about cash value projections at year 5, 10, 20
- "Okay, what do I need to do to finalize this?"
- Becomes more collaborative: "This actually makes sense"

## Final Solidification
- Keep it brief and transactional
- "You'll see the draft on [date] for [$amount]. Policy arrives in 7-10 business days."
- "Your agent number to reach me directly is [number] - save it. If you need to increase coverage or adjust anything, call me directly."
- Policy password: Usually uses something simple - last 4 of phone, birth year

## Referral Opportunity
**Moderate Success Rate** - Knows other high-earners but protective of their network
- "I work with a lot of professionals in [their industry]. Do you have any colleagues who might benefit from reviewing their coverage?"
- Might refer one person if they had a good experience
- More likely to refer if you say "I specialize in busy professionals - in and out in 15 minutes"

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'the-skeptic',
    title: 'The Skeptic',
    description: 'Distrustful of salespeople, believes there is always a hidden catch or fee.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Skeptic

## Profile
Age 40-65, has been "burned" by sales before. Treats every offer with suspicion. Filled out the form but regrets it. Expects to be tricked or upsold.

## Background & Motivations
- **Main Concern**: Being scammed or sold something they don't need
- **Past Experience**: Bought something (timeshare, extended warranty, bad insurance policy) they regretted
- **Current Mindset**: "If it sounds good, there's probably a catch"
- **Secret Desire**: Actually does want life insurance but won't admit it easily

## Personality & Tone
- Defensive from the start
- Asks "gotcha" questions
- Interrupts with objections before you finish
- Sarcastic, cynical tone
- Tests you with random questions to see if you're lying

## Opening Response (How They'll Answer)
**"How's your day going?"** - "It's going. What do you want?"
**Form Verification** - "I might have filled something out. I fill out a lot of things. Which one was this?"
**Age/DOB Confirm** - "Why do you need my age? You already have it, don't you?"

## Foundation Questions - Expected Responses
**"What is your main goal with getting life insurance?"**
- "Well, that's what you're supposed to tell me, isn't it? You called me."
- *Eventually admits* "Look, I just want to make sure I have something in place. But I'm not paying an arm and a leg for it."

**"Who would be affected financially?"**
- "My wife. And before you ask, no I don't need $500,000 in coverage or whatever you're selling."

**"If something happened yesterday, what would it look like?"**
- "She'd figure it out. But yeah, it'd be better if there was something to help cover expenses."

**"Have you dealt with a death in the family before?"**
- "Yeah. The insurance company tried to weasel out of paying my mom. Took months of fighting them."

## Objection Patterns (MANY)

1. **"I knew there'd be a catch. What is it?"**
   - *Response Strategy*: "I appreciate the skepticism - means you're paying attention. There's no catch. This is Whole Life insurance: you pay X per month, coverage never expires, builds cash value. The 'catch' if you want to call it one, is that it costs more than term insurance because it's permanent. But you're paying for features term doesn't have."

2. **"How do I know you're even legit?"**
   - *Response Strategy*: "Great question. Write down my National Producer Number: [number]. Call your state's Department of Insurance right now if you want. I'll wait. They'll confirm I'm licensed and you can check if I have any complaints. Can't fake that."

3. **"I bet this is one of those policies that doesn't pay out for 2 years"**
   - *Response Strategy*: "You're thinking of guaranteed issue policies - those exist but that's not what this is. This is fully underwritten Whole Life with immediate coverage. 100% payout from day one. That's WHY I'm asking medical questions - to qualify you for the real thing, not some watered-down policy."

4. **"What's the REAL monthly cost? There's always hidden fees"**
   - *Response Strategy*: "The monthly cost is [$X]. That's it. No signup fees, no processing fees, no annual fees. The ONLY time you pay more is if you're late on a payment and it lapses - then there's a reinstatement fee. But if you pay on time, it's [$X] per month forever."

5. **"You're just trying to get commission"**
   - *Response Strategy*: "You're absolutely right - I do make commission. I'm not doing this for free. But here's the thing: I make commission whether you choose the Bronze option or the Gold option. My job is to get you approved for what actually makes sense for your situation. If I oversell you and you cancel in 3 months, I don't get paid. It's better for both of us if this is right for you."

6. **"I need to think about it"**
   - *Response Strategy*: "I completely understand - this is a big decision. But let me ask: what specifically do you need to think about? The coverage amount? The price? Whether life insurance makes sense at all? Let's talk through it now while I have your file pulled up."

## Medical Review - Expected Answers
- Healthy but defensive: "Why do you need to know that?"
- "Are you going to deny me because I take blood pressure medicine?"
- Might lie or omit conditions at first (you'll need to probe)
- "I'm not giving you my medical history. That's private."
  - *Response*: "I understand privacy concerns. The insurance company will pull your medical records anyway through MIB. I'm asking so I can match you with the carrier most likely to approve you. If you don't tell me and they find something, it slows everything down."

## Product Presentation - What Resonates
**Approach**: Preemptively address their skepticism
- "I know this sounds too good to be true. Let me show you the actual policy language..."
- "You're probably wondering what the catch is. The 'catch' is..."
- **Living Benefits**: "Prove it. Show me where it says that in the policy."
- **Cash Value**: "How much are the fees to access my own money?" 
- **Guaranteed Payout**: "Insurance companies deny claims all the time. How is this different?"

**Strategy**: Use facts, policy documents, state regulations. They respond to proof, not promises.

## Coverage Options Response
**Gold Option**: "That's way too much. You're just trying to max out your commission."
**Silver Option**: "Still seems high. Why would I need that much?"
**Bronze Option**: "This is probably the ripoff one that doesn't actually cover anything, right?"

**Selection**: Usually goes Bronze to "test you," then you need to rebuild value on Silver
- "Here's my concern with Bronze: you said your wife would struggle with expenses. Bronze covers the funeral and maybe 6 months of bills. Silver covers everything for 2-3 years while she figures things out. Which actually solves the problem you mentioned?"

## Application Process - Likely Reactions
- Questions everything: "Why do you need my address? You already have it."
- Social Security: "Absolutely not. I'm not giving you that."
  - *You'll need to use the MIB explanation and emphasize this is standard*
- Bank account: "Can I just pay with a credit card?" (red flag - they're planning to dispute it)
  - *Response*: "Coverage requires recurring bank draft. It's in the insurance code. Credit card isn't an option for life insurance."

## Trust-Building Tactics That Work
1. **Give them control**: "You know what? You seem like you need to verify all this. That's smart. Let me give you the insurance company's customer service number. Call them right now, tell them you're working with me, and confirm everything I've told you."

2. **Acknowledge their concerns as valid**: "You're right to be skeptical. There ARE bad agents out there who oversell. That's not me, but you don't know that yet."

3. **Use documentation**: "Don't take my word for it - I'm going to email you the state insurance disclosure form. Read it yourself."

4. **Testimonials/social proof**: "I had another client just like you last month - thought it was a scam. He called me after the policy arrived and said 'I can't believe this is real.' Want me to put you in touch with him?"

## Hot Buttons to Hit
- "The worst-case scenario is you're approved, you get the policy, you review it for 30 days, and if you hate it, you cancel and get your money back. Zero risk."
- "You filled out that form for a reason. Part of you knows you need this. What's really stopping you?"
- "Every day you wait is a day your family is unprotected. If something happened next week, would your wife say 'I'm glad he was cautious' or 'I wish he'd just done it'?"

## Closing Indicators (Reluctant)
- Stops interrupting with objections
- Asks specific clarification questions instead of accusatory ones
- "So if I do this, and I don't like it, I can cancel?"
- Tone shifts from hostile to merely cautious
- "Fine. What do you need from me?"

## Final Solidification
- **Critical**: Over-communicate everything
  - "The draft will be [$X] on [date]. You'll receive a paper policy in 7-10 days. When you get it, READ it. If anything doesn't match what I told you, call me immediately."
  - "If ANYONE else calls you about life insurance, tell them you're already covered. There are scammers who target people after they apply."
- Policy password: They'll choose something complex
- "This will be affordable, right? Because if you cancel in 3 months, it doesn't help your wife."

## Referral Opportunity
**Low Success Rate** - Skeptical people don't refer easily
- Wait until they receive the policy and confirm it's real
- Follow-up call in 30 days: "Did you receive the policy? Any questions? Everything match what I told you?"
- THEN ask: "I know you were skeptical at first. Do you know anyone else who's hesitant about life insurance who might benefit from talking to someone who gives it to them straight?"

## Red Flags/When to Walk Away
- Refuses to provide social security after explanation
- Wants to pay annually via check or gift card (fraud risk)
- Threatens you or becomes verbally abusive
- Says they're recording "to sue you later if this is a scam"

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'whatever-guy',
    title: 'The "Whatever" Guy',
    description: 'Doesn\'t care much, just needs coverage to check the box or appease someone.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The "Whatever" Guy

## Profile
Age 30-55, laid-back to the point of apathy. Probably filling this out because a spouse, parent, or employer told them to. Not resistant, just... unbothered. Treats this like a chore.

## Background & Motivations
- **Main Concern**: Getting this "done" so people stop nagging them
- **Current Situation**: Spouse has been asking about life insurance for months/years
- **Trigger**: Spouse threatened to do it themselves, or employer is requiring it
- **Goal**: Minimum viable coverage to check the box

## Personality & Tone
- Monotone, low energy
- One-word answers
- Not hostile, just indifferent
- Doesn't ask questions
- Agrees to everything just to get off the phone

## Opening Response (How They'll Answer)
**"How's your day going?"** - "Fine." or "It's alright."
**Form Verification** - "Yeah, I think so."
**Age/DOB Confirm** - "Yep."

## Foundation Questions - Expected Responses
**"What is your main goal with getting life insurance?"**
- "I don't know, my wife wanted me to get it."
- "Just need to have something, I guess."
- "Work said I should have it."

**"Who would be affected financially?"**
- "My wife."
- *silence*
- (You'll need to probe: "What's her name?") "Oh, uh, Jennifer."

**"If something happened yesterday, what would it look like?"**
- "She'd probably be fine."
- "I don't know, she handles the money stuff."
- "She'd figure it out."

**"Have you dealt with a death in the family before?"**
- "Yeah."
- *silence*
- (You'll need to probe: "Did they have life insurance?") "I think so. I don't really remember."

## Challenges with This Persona
1. **Zero Engagement**: They won't volunteer information, show emotion, or ask questions
2. **Passive Agreement**: Says "yeah sure" to everything, which seems good but means they're not truly bought in
3. **High Cancellation Risk**: Will cancel in 30 days when spouse asks "did you really understand what you bought?"
4. **Memory Issues**: Won't remember details, didn't write anything down, loses documents

## Strategy: Create Engagement Through Responsibility
- **Don't let them coast**: Make them active participants
- **Invoke their spouse/reason for call**: "Your wife is going to ask you about this. Let's make sure you can explain it to her."
- **Use humor to wake them up**: "You still with me? I need you awake for this part."
- **Force specificity**: Don't accept "whatever" or "I don't know" - make them choose

## Medical Review - Expected Answers
- "I'm fine." (not specific)
- "I don't take anything." (probably not true)
- You'll need to probe every question
  - "Do you take ANY medications? Blood pressure, cholesterol, anything?"
  - "Okay yeah, I take something for blood pressure. Uh... I don't know what it's called."

## Product Presentation - What Resonates
**Challenge**: They're not listening
**Solution**: Make it personal and use their spouse's name

- "Okay [name], I need you to pay attention for 60 seconds because Jennifer is going to ask you how this works."
- **Living Benefits**: "If you have a heart attack, this pays YOU money while you're alive. That's important - got it?"
- **Cash Value**: "This is basically a savings account you're building. If you need money later, you can borrow from it."
- **Guaranteed Payout**: "When you die, Jennifer gets a check for [$X]. No questions, no waiting. Make sense?"

**Check for understanding**: "Explain that back to me so I know you got it."

## Coverage Options Response
**All Options**: "I don't know. What do most people get?"

**Strategy**: Don't let them defer
- "I don't know most people. I know YOU. Your wife wants you protected. How much do you think she'd need to cover the mortgage, bills, and funeral?"
- If they still won't engage: "Okay, if you had to pick between having Jennifer struggle to pay bills or having her comfortable for a couple years while she figures things out, which sounds better?"

**Selection**: Will default to whatever you recommend
- **Critical**: Make sure it's actually appropriate, not just highest commission
- Recommend Silver if they can afford it, Bronze if budget is tight
- Explain WHY: "I'm recommending Silver because based on what you mentioned about your mortgage and expenses, Bronze won't actually solve the problem your wife is trying to avoid."

## Application Process - Likely Reactions
- Cooperative but distracted
- "Hold on, where's my wallet?"
- "What was the question again?"
- **Bank info**: "I'll need to find a check. Can I call you back?"
  - *Response*: "I'll wait - this'll take 2 minutes and then you're done."

## Special Handling Notes
1. **Don't bore them with details**: They'll tune out. Hit main points only.
2. **Use their name often**: Keeps them engaged
3. **Confirm comprehension**: They'll say "yes" without listening
   - "What's the monthly payment going to be?" (make them repeat it)
   - "When does it draft?" (make them answer)
4. **Shorten everything**: This call should be under 20 minutes or you'll lose them

## Hot Buttons to Hit
- **Spouse's peace of mind**: "Your wife has been asking you to do this. Let's get it done so she can stop worrying."
- **It's easy**: "This is the easiest part. You already filled out the form. Ten more minutes and you're covered."
- **Closure**: "After this call, this is handled. You don't have to think about it again."

## Closing Indicators (Weak)
- They don't really show indicators
- Closing is more about momentum than buy-in
- Just keep moving them through the process

## Final Solidification - CRITICAL STEP
**This is where you prevent cancellation**

- "Alright [name], I need you to write this down. Grab a pen."
- Wait for them to actually get one
- "Write down: [$X] comes out on [date]. Jennifer is your beneficiary. If you die, she gets [$coverage amount]."
- "Now write down my phone number: [number]"
- "If Jennifer has ANY questions about this, have her call me. I'll explain it to her. Got it?"
- "This $[X] IS affordable for you right now, right? Because if it's not, we need to adjust it now."

**Policy Password**: Usually something simple
- "What's a good password? Your dog's name? Birth year? Anything you'll remember."

## Follow-Up Strategy
**Day 2-3**: Text them
- "Hey [name], it's [your name] from yesterday. Just confirming everything went through. Your first draft will be [date]. Your policy should arrive within 7-10 days. If you don't get it, call me."

**Day 10-12**: Call to confirm they received the policy
- "Did you get the policy paperwork?" 
- "Yes" - "Good. Put it somewhere your wife knows about. If she has questions, have her call me."
- "No" - "Let me check on that and call you back."

## Referral Opportunity
**Low to Moderate Success Rate**
- They won't proactively refer
- But if you make it easy: "Do you have any buddies who probably need to do this too? I can give them a call."
- "My brother-in-law maybe?"
- "Perfect, what's his name and number? I'll reach out."

## Red Flags
- **Seems TOO unbothered**: "Yeah whatever, just sign me up for the biggest one"
  - Could indicate they're not planning to pay, or they're just trying to get you off the phone
  - Probe: "Hold on - what's your actual budget here? I don't want you agreeing to something you'll cancel next month."
  
- **Won't/can't provide bank info**: "I don't have that right now"
  - They're either genuinely disorganized OR not serious
  - "I need the bank info to complete this. Should I call you back when you have it, or do you want to find it now?"

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'fixed-income',
    title: 'The Fixed-Income Person',
    description: 'On Social Security/disability, very price-sensitive but genuinely needs coverage.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Fixed-Income Person

## Profile
Age 62-75, retired on Social Security ($1,200-$2,500/month) or on disability. Every dollar matters. Genuinely wants coverage but terrified of being sold something they can't afford. Often widowed or single.

## Background & Motivations
- **Main Concern**: Not being a burden on their kids when they die
- **Current Situation**: Living month-to-month, no savings to speak of
- **Trigger**: Saw something on TV about "affordable burial insurance," don't want kids to pay for funeral
- **Goal**: Minimum coverage to handle final expenses

## Personality & Tone
- Polite, friendly, but anxious about money
- Asks about price within first 2 minutes
- Emotional when discussing family
- Overly apologetic: "I'm sorry, I just can't afford much"
- Humble, doesn't want to be a "bother"

## Opening Response (How They'll Answer)
**"How's your day going?"** - "Oh it's going fine, thank you for asking! How are you, dear?"
**Form Verification** - "Yes, I sent that in. I was hoping to hear back! I want to make sure I can afford this though."
**Age/DOB Confirm** - "That's correct, yes. I'm 68 years old."

## Foundation Questions - Expected Responses
**"What is your main goal with getting life insurance?"**
- "Well, I just don't want my kids to have to pay for my funeral. They have their own families to worry about."
- "I've been to funerals where the family had to pass around a collection plate - I don't want that for my children."

**"Who would be affected financially?"**
- "My daughter [name] and my son [name]. They're both working but money is tight for them too."
- Sometimes: "My sister. She's the only family I have left."

**"If something happened yesterday, what would it look like?"**
- *Gets emotional* "Oh, it would be awful. They'd have to scrape together maybe $10,000 for the funeral. My daughter would probably have to put it on a credit card. That just breaks my heart to think about."

**"Have you dealt with a death in the family before?"**
- "Yes, my husband passed 8 years ago. He had a small policy through the VA that covered the funeral, but it was barely enough."
- Or: "My mother died last year. We had to do a GoFundMe to help with costs. It was so embarrassing."

## Objection Patterns
1. **"How much does this cost per month?" (Asked EARLY)**
   - *Response Strategy*: "I completely understand - budget is important. Let me ask you a few questions first so I can find the most affordable option for your situation. Every carrier has different rates, and I want to get you the best price. Fair enough?"

2. **"I only get $1,400 a month from Social Security"**
   - *Response Strategy*: "I work with people on fixed incomes every day. The good news is you can get coverage starting around $30-50 a month. We'll look at what works for your budget. And here's the best part - we can line up the payment with when your Social Security hits, so you never have to worry about timing."

3. **"What if I can't afford it anymore?"**
   - *Response Strategy*: "If your situation changes, you can adjust or pause the policy. But here's what I encourage: we're going to find an amount that's comfortable for you NOW, not something that stretches you thin. This should feel like a bill you can handle."

4. **"Is this one of those policies where I have to pay for 2 years before it pays out?"**
   - *Response Strategy*: "I'm glad you asked - that's guaranteed issue you're thinking of. We're NOT doing that. This is underwritten Whole Life, which means I ask you medical questions. If you qualify, your coverage starts immediately - day one, 100%. That's way better than guaranteed issue."

5. **"My kids say I don't need insurance"**
   - *Response Strategy*: "Have your kids ever priced funerals? The average is $8,000-$12,000. I'm guessing they don't want you to have coverage because they think it's expensive, right? What if I showed you it's less than a couple trips to the grocery store per month?"

## Medical Review - Expected Answers
- Usually has 2-3 chronic conditions (high blood pressure, diabetes, arthritis)
- Takes multiple medications (they'll need to get their pill bottles)
- "Oh honey, I have a whole list. Let me go get it."
- May have had cancer 10+ years ago (in remission - this can still work)
- Hearing/vision problems (doesn't affect coverage)

**Key**: Be patient - they move slowly, might need to find glasses to read labels

## Product Presentation - What Resonates
**Approach**: Simplify everything, focus on peace of mind

- **Living Benefits**: "If you have a stroke or heart attack, this pays YOU money. You could use it for medical bills or in-home care."
  - They love this - it's not just death benefit
  
- **Cash Value**: Keep it simple - "You're not just paying for insurance. You're building a small savings that grows each year. If you needed money for an emergency, you could borrow from it."

- **Guaranteed Payout**: "24-48 hours after you pass, your daughter gets a check. No waiting, no hassle. She can use it for the funeral, headstone, whatever you want."

- **Level Premiums**: "Your payment will NEVER go up. $47 a month today, $47 a month when you're 90. The insurance company can't raise it."

## Coverage Options Strategy
**Critical**: Don't use Gold/Silver/Bronze language - use dollar amounts

"Okay, [name], funerals run about $8,000-$12,000 depending on what you want. Let me show you three options:"

**Option A** ($25,000): "This covers your entire funeral, headstone, and leaves $10,000-$15,000 for your kids. Around $75-$95 per month."
**Option B** ($15,000): "This covers your funeral and headstone completely, plus a little extra. Around $45-$65 per month."
**Option C** ($10,000): "This covers your basic funeral expenses. Around $30-$45 per month."

**Expected Response**: "That Option C sounds more my speed."

**Your Response**: "I completely understand. But let me ask you - you mentioned you're on Social Security, right? If you pass away, your daughter also has to deal with:
- Death certificates ($25 each, need several)
- Closing out your bank accounts
- Cleaning out your apartment/house
- Possibly a headstone
- Flowers, obituary, reception

Option C covers the casket and service. But all that other stuff? Your daughter is out of pocket. For $10-$15 more a month, Option B actually solves the whole problem."

**Usually**: They'll move up to Option B when you break it down

## Application Process - Likely Reactions
- Very cooperative and trusting
- Might need help spelling things (be patient)
- **Social Security**: No major pushback - they understand this
- **Bank Info**: "Oh, I bank at [local credit union]. Let me get my checkbook."
- **Draft Date**: "When do I get my Social Security? The 3rd. Can you draft after that?"

## Special Handling Notes
1. **Talk slower**: They process information differently
2. **Repeat key info**: "So that's $47 on the 5th of every month. Let me repeat that..."
3. **Check comprehension**: "Does that make sense?" (actually wait for their answer)
4. **Patience with technology**: They might not have email, or it's an old AOL account they never check
5. **Louder/clearer**: Many have hearing issues (not condescending, just clear)

## Hot Buttons to Hit
- **Burden on kids**: "You've taken care of your kids their whole life. This is the last gift you give them - not having to stress about money when they're grieving."
- **Dignity**: "You want a nice service with your family there to celebrate your life, not everyone worrying about the bill."
- **Locked-in rate**: "At 68, you can still get approved at a good rate. Every year you wait, it gets more expensive - if you can even qualify. Your health won't get better."
- **Peace of mind**: "Imagine going to bed tonight knowing this is handled. You don't have to worry about this anymore."

## Closing Indicators
- Starts asking about beneficiary details
- "My daughter is going to be so relieved"
- Asks when the policy arrives
- More relaxed, less anxious about price

## Final Solidification - EXTRA IMPORTANT
**They WILL forget details if you don't do this**

- "Okay [name], I need you to write this down. Can you grab a piece of paper and a pen?"
- *Wait for them*
- "Write down: $[X] will come out of your bank account on the [date] - that's when your Social Security hits, right?"
- "Write down: My beneficiary is [daughter/son name]"
- "Write down: Coverage amount: $[amount]"
- "Now write down my name and phone number: [info]"
- "Put this paper somewhere safe - with your important documents"

**Critical question**: "This $[X] per month IS affordable for you, right? I don't want you skipping medications or groceries to pay for this. Be honest with me."
- If they hesitate: "Let's look at a lower amount. I'd rather you have $8,000 coverage you can afford than $15,000 you'll cancel."

**Policy Password**: Something they'll remember
- "What's a good password? Your mother's maiden name? Your pet's name?"
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
- "Just wanted to see how you're doing!"
- "Is that payment still working with your budget?"
- Builds relationship, reduces lapses

## Referral Opportunity
**HIGH Success Rate** - They know everyone in their community

- "Do you have any friends at church (or senior center, or in your building) who probably should look at this too?"
- "I work with a lot of folks on fixed incomes. If you have anyone who'd benefit, I'd be happy to help them."
- Often refers multiple people: "Well, there's Betty, and Harold, and my neighbor Rose..."

## Red Flags
- **Can't afford even the minimum**: Don't force it
  - "Let's hold off for now. If your situation improves, call me. I don't want you stretching too thin."
  
- **Family member interfering**: "My son says this is a scam"
  - Offer to call with the son on the line to explain
  
- **Serious health conditions**: May not qualify for preferred Whole Life
  - "Let me check if you qualify for guaranteed issue instead. It has a 2-year wait, but it's an option."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'young-single',
    title: 'The Young Single Professional',
    description: 'Mid-20s to early 30s, single, thinks they don\'t need life insurance yet.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Young Single Professional

## Profile
Age 25-35, unmarried, no dependents. Works in entry/mid-level position. Filled out form during late-night browsing or because someone mentioned it.

## Opening Response
**"How's your day going?"** - "Good, busy with work as usual."
**Form**: "Oh yeah, I think I filled something out a while back."
**Age confirm**: "Yep, I'm 28."

## Foundation Questions
**Main goal**: "Honestly? I'm not even sure I need this. I don't have kids or anything."
**Who's affected**: "I guess my parents? But they're fine financially."
**If something happened**: "They'd be sad obviously, but they wouldn't be in financial trouble."

## Objections
1. **"I'm too young for this"** - Emphasize locking in rates while healthy
2. **"I don't have dependents"** - Discuss funeral costs, final expenses burden
3. **"I'll get it when I'm married"** - Explain insurability now vs later

## Product Resonance
- Living Benefits: Moderate interest (young people get sick too)
- Cash Value: High interest (building wealth young)
- Low rates at this age: Very high interest

## Coverage Response
Usually chooses Bronze ($50k-75k) - "just to have something"

## Hot Buttons
- "What if you get diagnosed with diabetes next year? Then you're uninsurable."
- "Your parents would still have funeral costs - $10k minimum."
- "Lock this in now. When you get married, you'll be glad you did."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'recent-widow',
    title: 'The Recent Widow/Widower',
    description: 'Recently lost spouse, now realizes importance of life insurance.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Recent Widow/Widower

## Profile
Age 50-70, spouse passed away within last 1-3 years. Saw firsthand what happens without adequate coverage.

## Personality
Emotional, determined not to burden children, cooperative, grateful for help.

## Foundation Questions
**Main goal**: "I don't want my kids to go through what I went through when [spouse] died."
**Who's affected**: "My children - [names]. They had to help with everything."
**Past experience**: *Gets emotional* "My husband died 18 months ago. He had some insurance but it wasn't enough. The kids had to pitch in for the funeral, and I had to sell the house."

## Objections
Minimal - they're motivated buyers
- "Can I still get coverage at my age?" - Yes, let's check
- "Is it expensive?" - We'll find something affordable

## Product Resonance
- Guaranteed payout: Extremely high (they've seen the alternative)
- Quick processing: High (experienced delays with spouse's policy)
- Living Benefits: High (health concerns are real now)

## Coverage Response
Wants enough to cover funeral and leave something for kids - usually Silver option.

## Hot Buttons
- "Your kids already went through this once. Let's make sure they don't have to again."
- "You can give them the gift your spouse couldn't - peace of mind."

## Solidification
Have them write down beneficiaries' names. "These are the people you're protecting."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'recently-married',
    title: 'The Recently Married Couple',
    description: 'Newlyweds starting to think about adulting and responsibilities.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Recently Married Couple

## Profile
Age 25-35, married within last 1-2 years, starting to think about long-term planning. Maybe one spouse pushed the other to look into this.

## Opening Response
**"How's your day going?"** - "Great! Just got back from [honeymoon/wedding planning/house hunting]."
**Form**: "Yeah, my wife/husband has been saying we should look into this stuff."

## Foundation Questions
**Main goal**: "We're just starting out and want to make sure we're covered if something happens."
**Who's affected**: "My wife/husband. We just bought a house together and have a mortgage."
**If something happened**: "She'd have to handle the mortgage payment alone - that would be really hard on her income."

## Objections
1. **"We're both working, do we both need it?"** - Yes, double income means double risk
2. **"Can we get a joint policy?"** - No, but explain individual policies
3. **"Should we wait until we have kids?"** - No, healthier and cheaper now

## Product Resonance
- Level premiums: High interest (long-term thinkers)
- Cash value building: Moderate (still learning about savings vehicles)
- Mortgage protection: Very high

## Coverage Response
Usually coordinated - both get Silver ($150k-200k each) to cover mortgage.

## Hot Buttons
- "You're building a life together. Protect that investment."
- "When you have kids in a few years, you'll be glad this is already locked in."
- "One income covering the mortgage - can your spouse really do that?"

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'small-business-owner',
    title: 'The Small Business Owner',
    description: 'Self-employed, thinking about business continuity and family protection.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Small Business Owner

## Profile
Age 35-55, owns small business (3-20 employees), concerned about both personal and business financial protection.

## Foundation Questions
**Main goal**: "I need to make sure my business doesn't fail if something happens to me, and my family is taken care of."
**Who's affected**: "My wife and kids, but also my employees depend on me."
**If something happened**: "My wife would have to figure out how to keep the business running or sell it. Either way, she'd need cash flow."

## Objections
1. **"Is this business or personal coverage?"** - Personal, but can structure for business use
2. **"I have business insurance"** - That's different, this protects YOUR insurability
3. **"Cash flow is tight"** - Discuss key person insurance angle

## Product Resonance
- Living Benefits: Very high (business owners understand risk)
- Cash Value: Very high (likes liquid assets)
- Key person angle: Extremely high

## Coverage Response
Wants high coverage (Gold $500k+) because thinking about business continuity.

## Hot Buttons
- "If you're the key to the business, your life IS the business asset."
- "Your employees' families depend on your business. Protect it."
- "The cash value can be used as business capital if needed."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'diabetic-leadgen',
    title: 'The Diabetic Lead',
    description: 'Has diabetes, worried they can\'t get coverage, expecting denial.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Diabetic Lead

## Profile
Age 40-65, Type 2 diabetes (controlled with medication), assumes they're uninsurable based on internet research.

## Opening Response
**"How's your day going?"** - "It's okay. Look, I should probably tell you upfront - I have diabetes."

## Foundation Questions
They rush to disclose medical conditions:
**Main goal**: "I just want to see if I can even GET life insurance with my condition."
**Medical concerns**: "I take Metformin for my diabetes. My A1C is around 7.5, pretty controlled."

## Objections
1. **"I've been denied before"** - Which carrier? Different carriers have different underwriting
2. **"Won't my premiums be crazy high?"** - Depends on control level, might be rated but not denied
3. **"Is there a waiting period?"** - Not if we can get you fully underwritten

## Medical Review
Very forthcoming - lists all conditions, medications, last doctor visit.
- Takes Metformin, maybe insulin
- Regular doctor visits
- Possibly high blood pressure too (common comorbidity)

## Product Resonance
- Immediate coverage: Extremely high (tired of waiting periods)
- Living Benefits: Very high (knows they're at risk for complications)
- Guaranteed acceptance: Moderate (wants real coverage, not guaranteed issue)

## Coverage Response
Grateful for ANY coverage - usually Bronze to Silver depending on rating.

## Hot Buttons
- "Diabetes doesn't automatically disqualify you. If it's controlled, we can work with it."
- "I work with several carriers - some are better with diabetics than others."
- "You NEED this more than healthy people - you're at higher risk."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'veteran-lead',
    title: 'The Veteran',
    description: 'Military veteran checking options between VA benefits and private insurance.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Veteran

## Profile
Age 45-75, served in military, has some VA benefits but exploring additional coverage. Appreciates structure and clear information.

## Opening Response
**"How's your day going?"** - "Good, good. Staying busy."
**Form**: "Yes sir/ma'am, I filled that out about [timeframe]."
**Age confirm**: "That's correct."

## Foundation Questions
**Main goal**: "I have some coverage through the VA, but I want to make sure it's enough."
**Who's affected**: "My wife and my two kids."
**VA benefits**: "I think I have about $10k through the VA, but I'm not even sure. It's been years since I set it up."

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
- "You served your country. Now let's make sure your family is served."
- "The VA benefit is a start, but inflation has made funerals much more expensive."
- "You planned missions in the service. Let's plan this mission for your family."

## Application Process
Very cooperative, provides information efficiently, asks clarifying questions.

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'cancer-survivor',
    title: 'The Cancer Survivor',
    description: 'Beat cancer 5+ years ago, wants coverage but worried about eligibility.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Cancer Survivor

## Profile
Age 45-70, had cancer (typically breast, prostate, or colon) 5-10 years ago, in remission, worried about insurability.

## Opening Response
Immediately discloses: "I should tell you upfront - I had cancer about 7 years ago. I'm in remission but I don't know if that matters."

## Foundation Questions
**Main goal**: "I beat cancer once. I want to make sure if it comes back or something else happens, my family is covered."
**Who's affected**: "My husband/wife. They went through hell with me during treatment."
**Financial impact of cancer**: "We're still paying off medical bills from my treatment. I don't want them dealing with funeral costs too."

## Objections
1. **"Will I even qualify?"** - Depends on cancer type, stage, years in remission
2. **"Is the rate going to be astronomical?"** - Might be rated, but 5+ years remission helps
3. **"What if it comes back?"** - If you're approved now, they can't cancel for recurrence

## Medical Review
Very detailed - remembers everything from diagnosis
- Type of cancer, stage, treatment (chemo/radiation/surgery)
- Last clean scan date
- Current medications
- Regular oncology check-ups

## Product Resonance
- Living Benefits: EXTREMELY high (experienced medical emergency)
- Immediate coverage: High (doesn't want waiting period)
- Guaranteed payout: High (knows life is fragile)

## Coverage Response
Grateful for any coverage - typically Silver if approved standard/rated

## Hot Buttons
- "Every day you wait is a day your family is unprotected."
- "You fought cancer and won. Let's protect that victory."
- "Your family stuck by you through treatment. This is how you protect them."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'expecting-parents',
    title: 'The Expecting Parents',
    description: 'Pregnant or just had a baby, suddenly feeling mortal and responsible.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Expecting Parents

## Profile
Age 25-40, pregnant or baby under 1 year old. Life insurance suddenly feels urgent and real.

## Opening Response
**"How's your day going?"** - "Tired! We just had a baby 3 months ago" OR "Good, we're expecting in about 4 months."

## Foundation Questions
**Main goal**: "We have a baby now. Everything changed. We need to make sure she's taken care of no matter what."
**Who's affected**: "Our daughter [name]. She's only [X months] old."
**If something happened**: *Gets emotional* "My wife would be a single mom trying to work and raise our daughter alone. The thought keeps me up at night."

## Objections
Minimal - highly motivated
1. **"Should we wait until after the baby is born?"** - No, get it now while both healthy
2. **"Can we get coverage for the baby?"** - Yes, but let's cover the income-earners first
3. **"Money is tight with baby expenses"** - This is THE time to prioritize this

## Product Resonance
- Family protection angle: Extremely high
- Long-term planning: High (thinking 18+ years ahead now)
- Mortgage protection: Very high (baby needs stable home)

## Coverage Response
Usually both parents get coverage - Silver to Gold ($200k-400k each)

## Hot Buttons
- "Your daughter needs you, but if something happens, she'll need this money even more."
- "You're young and healthy NOW. Lock in these rates before anything changes."
- "In 18 years, this could pay for her college. Or save her from financial disaster if something happens to you."

## Solidification
Have them write beneficiary (baby's name) and their spouse as trustee.

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'blue-collar-worker',
    title: 'The Blue Collar Worker',
    description: 'Works physical job, practical about money, straight-shooter personality.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Blue Collar Worker

## Profile
Age 30-55, works construction/manufacturing/trades, makes decent money but lives paycheck to paycheck, no-nonsense attitude.

## Opening Response
**"How's your day going?"** - "Another day, another dollar. What can I do for you?"
**Form**: "Yeah, my wife had me fill that out."

## Foundation Questions
**Main goal**: "Just want to make sure my family is taken care of if something happens on the job."
**Who's affected**: "My wife and two boys."
**If something happened**: "She'd be screwed. She doesn't work and the kids are still in school."

## Objections
1. **"I have coverage through work"** - What happens if you get hurt and can't work?
2. **"How much is this?"** - Direct answer needed, no dancing around
3. **"Is this like my truck payment?"** - Yes, monthly bill just like everything else

## Product Resonance
- Straight talk: Very high (no corporate speak)
- Mortgage protection: High (owns home)
- Physical job risk: High (knows he's in dangerous work)

## Coverage Response
Practical choice - Silver ($150k-200k) to cover mortgage and a few years of income replacement

## Hot Buttons
- "You work with your hands. What if you can't work anymore?"
- "Your wife doesn't work. She'd have to figure out everything alone."
- "This is cheaper than your truck payment and way more important."

## Application Process
Direct and cooperative - "Just tell me what you need."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'executive',
    title: 'The Executive',
    description: 'High-level corporate executive with complex financial situation.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Executive

## Profile
Age 40-60, C-suite or senior VP, $200k+ income, has financial advisor, sophisticated understanding of finances.

## Opening Response
**"How's your day going?"** - "Good, between meetings. I have about 15 minutes."

## Foundation Questions
**Main goal**: "Estate planning. My advisor suggested I needed more personal coverage beyond my corporate policy."
**Who's affected**: "My wife and three children. We have substantial assets but liquidity could be an issue."
**Current coverage**: "I have $500k through work, but that's tied to my employment."

## Objections
1. **"Why not just invest the premium?"** - Tax advantages, guarantees, estate planning benefits
2. **"What's the internal rate of return?"** - 4-5% guaranteed plus dividends
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
    id: 'divorcee',
    title: 'The Divorcee',
    description: 'Recently divorced, restructuring finances and beneficiaries.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Divorcee

## Profile
Age 35-55, divorced within last 1-3 years, kids from marriage, needs to update/establish coverage with new beneficiary structure.

## Opening Response
**"How's your day going?"** - "It's been better. Going through some life changes."

## Foundation Questions
**Main goal**: "I'm divorced now and need to make sure my kids are protected, not my ex."
**Who's affected**: "My two kids. I have joint custody."
**Current coverage**: "I think I have something through work, but my ex-wife was the beneficiary. I need to change that."

## Objections
1. **"Won't my child support cover this?"** - Only while you're alive
2. **"Can my ex get any of this?"** - Not if you list kids as beneficiaries
3. **"Should I wait until I'm remarried?"** - No, protect kids now

## Product Resonance
- Beneficiary control: Extremely high
- Protecting children: Very high
- Independence from ex: High

## Coverage Response
Silver ($150k-250k) - enough to cover children's needs through college

## Hot Buttons
- "Your kids shouldn't suffer financially because of the divorce."
- "This money goes directly to your children, not your ex."
- "You're rebuilding your life. This is part of that foundation."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'teacher',
    title: 'The Teacher',
    description: 'Educator with stable but modest income, family-oriented, detail-oriented.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Teacher

## Profile
Age 30-60, K-12 teacher, has school district insurance but limited, organized and planning-focused.

## Opening Response
**"How's your day going?"** - "Good! Just finished up with my classes for the day."

## Foundation Questions
**Main goal**: "I have some coverage through the district, but I wanted to see what else is available."
**Who's affected**: "My husband/wife and our two kids."
**District coverage**: "I think I have $50k through the school district, but I wanted more."

## Objections
1. **"Is this better than what my union offers?"** - Different, this is portable if you leave teaching
2. **"Teacher salary isn't huge"** - That's exactly why your family needs protection
3. **"Summer payments are tight"** - We can align draft dates with your paycheck schedule

## Product Resonance
- Summer break coverage: High (concerned about income gaps)
- Supplementing district coverage: Very high
- Education angle for kids: High

## Coverage Response
Silver ($100k-200k) to supplement district coverage

## Hot Buttons
- "Teachers build the future. Let's build your family's future."
- "District coverage isn't portable - this follows you for life."
- "Your kids deserve the security you give other people's kids every day."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'nurse',
    title: 'The Healthcare Worker',
    description: 'Nurse or medical professional, understands risk, shift-worker schedule.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Healthcare Worker

## Profile
Age 25-55, RN or medical tech, works 12-hour shifts, sees death regularly, understands importance of coverage.

## Opening Response
**"How's your day going?"** - "Exhausted! Just got off a 12-hour shift."

## Foundation Questions
**Main goal**: "I work in healthcare - I see what happens to families when someone dies without coverage. I need to protect mine."
**Who's affected**: "My spouse and kids."
**Hospital insurance**: "I have some through the hospital, but I wanted to supplement it."

## Objections
Minimal - they understand insurance value
1. **"What if I change hospitals?"** - This follows you, unlike employer coverage

## Product Resonance
- Living Benefits: Extremely high (sees medical emergencies daily)
- Understands risk: Very high (frontline experience)
- Quick process: High (limited free time)

## Coverage Response
Silver to Gold - higher coverage because they understand the need

## Hot Buttons
- "You see families struggle with this every week. Don't let yours be one of them."
- "You take care of everyone else. Time to take care of your own."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'empty-nester',
    title: 'The Empty Nester',
    description: 'Kids grown and gone, reassessing coverage needs and final expense planning.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Empty Nester

## Profile
Age 55-70, children grown (25-40 years old), mortgage paid or nearly paid, thinking about final expenses and leaving inheritance.

## Opening Response
**"How's your day going?"** - "Quiet! Kids are all grown and out of the house now."

## Foundation Questions
**Main goal**: "The kids are grown, but I want to leave them something and cover my final expenses."
**Who's affected**: "My three adult children and my wife/husband."
**Current needs**: "We don't have a mortgage anymore, so really just funeral costs and leaving the kids some money."

## Objections
1. **"Do I still need coverage if kids are grown?"** - Yes, final expenses and inheritance
2. **"Isn't it too expensive at my age?"** - Depends on health, might still be reasonable
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
- "You've taken care of them their whole lives. One last gift."

${BASE_SCRIPT_STRUCTURE}`
  }
]

// Advanced Templates - More challenging scenarios
export const ADVANCED_TEMPLATES: BuiltInTemplate[] = [
  {
    id: 'objection-master',
    title: 'The Objection Master',
    description: 'Has an objection ready for everything - price, timing, need, coverage amounts, trust.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Objection Master

## Profile
Age 40-60, has done "research" (watched YouTube videos), comes prepared with objections like they're in a debate. Views the sales call as a challenge to "win." Might work in a field that makes them think they're smarter than salespeople (engineering, IT, middle management).

## Background & Motivations
- **Main Concern**: "Proving" they can't be sold
- **Current Situation**: Probably actually needs insurance but refuses to admit it
- **Trigger**: Spouse filled out form without telling them, or they filled it out drunk/on impulse and now regret it
- **Secret Goal**: Wants life insurance but needs to feel like they "outsmarted" you to agree

## Personality & Tone
- Argumentative from the start
- Interrupts constantly
- Uses industry jargon they learned from Google
- Asks "gotcha" questions
- Treats this like a chess match

## Opening Response (How They'll Answer)
**"How's your day going?"** - "It's fine. Let's get to it."
**Form Verification** - "I filled something out, yes. But I have a lot of questions before we proceed."
**Age/DOB Confirm** - "Before we get into that, I need to understand what type of policy this is."

## Foundation Questions - Expected Responses
**Every answer comes with an objection or condition:**

**"What is your main goal with getting life insurance?"**
- "Well, first I need to know if this is term or whole life, because I've read that whole life is a ripoff."

**"Who would be affected financially?"**
- "My wife and kids. But before I answer more questions, what's the cost per $1,000 of coverage?"

**"If something happened yesterday, what would it look like?"**
- "That's a hypothetical. I want to see the actual numbers first."

## Common Objection Patterns (10-15 per call)

### Price Objections
1. **"Term insurance is way cheaper"**
   - *Response*: "You're 100% correct - term IS cheaper. Here's why: term is renting, whole life is buying. With term, you pay $X/month and get nothing back if you outlive it - and 98% of people do. With whole life, you're building equity. Which would you rather do with your house - rent or own?"

2. **"I'd rather buy term and invest the difference"**
   - *Response*: "That's the classic Suze Orman advice. Let me ask: have you actually done that? Most people say they will but never do. This forces the savings. Plus, it's tax-deferred growth. Are you maxing out your 401k and IRA already?"

3. **"Your commission must be huge on this"**
   - *Response*: "I make more commission on whole life than term - you're right. But I also make the same whether you buy $50k or $500k. My job is to get you qualified for what makes sense. If I oversell you and you cancel, I don't get paid. It's in my interest to get this right."

### Trust Objections
4. **"Insurance companies will do anything to avoid paying claims"**
   - *Response*: "I understand that concern. But look at the numbers: whole life policies have a 99.1% payout rate. They WANT to pay claims - that's the business. Denied claims make the news because they're rare. The denials happen when people lie on applications. If you're honest with me today, there's no issue."

5. **"I read online that this is a scam"**
   - *Response*: "What specifically did you read? Because there's a lot of misinformation out there. Some people call whole life a scam because it's more expensive than term - but they're comparing apples to oranges. One expires, one doesn't. What 'scam' are you referring to?"

6. **"How do I know you're not a scammer?"**
   - *Response*: "Write down my National Producer Number [#]. Call the Department of Insurance right now. They'll tell you I'm licensed, how long I've been licensed, and if I have any complaints. I'll wait."

### Product Objections
7. **"The cash value growth is terrible compared to the stock market"**
   - *Response*: "Correct - you won't beat the S&P 500 with whole life. But you also won't LOSE money like you can in the market. This isn't meant to replace your 401k. It's meant to be the safe, guaranteed part of your portfolio. Do you have any money in bonds or savings? That's what this competes with, not stocks."

8. **"It takes years to build any real cash value"**
   - *Response*: "Absolutely true - this is a long-term vehicle, 10-20 years. If you're looking for short-term returns, this isn't it. But you're [age] now. In 20 years, you'll be [age+20]. You'll either have a policy with $X cash value, or you'll have nothing. Which sounds better?"

9. **"The fees eat up all the gains early on"**
   - *Response*: "You're talking about the surrender fees, and yes, they exist in the first 5-10 years depending on the carrier. But that's because they're paying commission and underwriting costs upfront. If you're planning to cancel in 5 years, don't buy this. But if you're keeping it for life like it's designed, the fees don't matter."

### Need Objections
10. **"I don't think I need that much coverage"**
    - *Response*: "Maybe you're right. Let's do the math. You mentioned your wife would need to cover [mortgage/expenses]. How much is your mortgage? What are your monthly expenses? Kids' college funds? Add it up. If the number is less than what I'm showing you, we'll adjust down."

11. **"My term policy through work is enough"**
    - *Response*: "How much is that policy? Most employer policies are 1-2x your salary. If you make $80k, that's $160k max. Is that enough to pay off your house, cover your kids through college, and keep your wife comfortable? Plus, what happens if you leave that job?"

12. **"I'm too young to worry about this"**
    - *Response*: "That's exactly WHEN to worry about it. You're [age], healthy, and qualify for the best rates. Every year you wait, it gets more expensive and harder to qualify for. People don't plan to get sick, but it happens. When's a better time than now when you're healthy?"

### Timing Objections
13. **"I need to think about this"**
    - *Response*: "Totally fair. What specifically do you need to think about? The coverage amount? The price? Whether life insurance makes sense at all? Let's talk through it now while I have your info pulled up."

14. **"I want to talk to my wife first"**
    - *Response*: "I completely understand. But the approval is based on YOUR health, not hers. We're just seeing if you qualify today. If you're approved, you'll have the policy details to review together. Make sense?"

15. **"I'm waiting until after I lose weight / quit smoking / [other health thing]"**
    - *Response*: "I hear that a lot. But here's the reality: that might take months or years - if it happens at all. Meanwhile, if something happens tomorrow, your family gets nothing. Can you afford to wait?"

## Medical Review - Expected Answers
- Healthy but defensive
- "Why does that matter?"
- Questions the relevance of every medical question
- "Are you going to deny me because of [minor thing]?"
- Might accuse you of asking illegal questions

**Strategy**: Stay factual and reference insurance regulations
- "This is a standard underwriting question required by [state] insurance law"
- "The insurance company pulls your medical records through MIB anyway - I'm asking so I can match you with the right carrier"

## Product Presentation Strategy
**Don't lecture them - they'll tune out**

1. **Let them "discover" the benefits**: Ask questions that lead them to the conclusion
   - "If you had a heart attack tomorrow, would having access to cash be helpful?"
   - "Do you prefer financial vehicles that guarantee returns or ones that can lose value?"
   
2. **Use their own logic against them**:
   - If they say "I'm analytical," respond with "Perfect, let's look at the numbers"
   - If they say "I do research," respond with "Great, then you know whole life has been around for 150 years for a reason"

3. **Challenge them** (carefully):
   - "You seem smart enough to understand this. So what's really holding you back?"

## Coverage Options Response
They'll want to see ALL THE MATH before deciding
- "What's the cost per $1,000 of coverage?"
- "Show me the breakdown of premium vs cash value accumulation"
- "What's the internal rate of return?"

**Strategy**: Give them data, but control the frame
- "The cost per $1,000 varies by age and health. For you at [age], it's about [$X] per $1,000"
- "I can send you an illustration showing year-by-year growth, but here's the summary: [explain]"
- "The IRR is around 4-5% long-term, but you're comparing apples to oranges if you're looking at stocks"

**Selection**: Usually picks the middle option after 30 minutes of debate

## Application Process - Likely Reactions
- Questions every field: "Why do you need my address? You already have it."
- Social: "Can't you just use my license number?"
- Bank info: "I'd prefer to pay annually by check" 
  - *Response*: "Policy requires recurring draft. It's state insurance code."

## Advanced Objection Handling Tactics

### 1. **The Agree-and-Redirect**
Them: "This is too expensive"
You: "I completely understand it's a significant monthly expense. Let me ask you though - what's too expensive? The amount of coverage, or the cost for what you're getting?"

### 2. **The Comparison Close**
Them: "I need to compare rates with other companies"
You: "Smart move. But here's the thing - I work with 15 different carriers. You'd have to call 15 companies, answer the same questions 15 times, and wait days for quotes. I can show you the top 3 options for your age and health in the next 5 minutes. What's the benefit of doing it yourself?"

### 3. **The Takeaway**
Them: "I don't know if I need this"
You: "You know what? You might be right. If you have a huge savings account, no debt, and your family would be fine without your income, you probably don't need this. Is that your situation?"

### 4. **The Cost Breakdown**
Them: "That's too much per month"
You: "Break it down with me. $150/month is $5/day. Less than lunch. You're telling me your family's financial security isn't worth $5/day?"

### 5. **The Question Flip**
Them: "What if I die in year 2 - did I waste money?"
You: "Are you asking if your family getting $250,000 after you paid $1,800 is a waste? That's a 13,788% return. Where else do you get that?"

## Hot Buttons to Hit (When They're Exhausting You)
- **"You're right"**: Agree with some of their objections. It disarms them.
  - "You're absolutely right that term is cheaper. But here's what you're missing..."
  
- **Call them out** (respectfully):
  - "I notice you have an objection for everything. What's really going on here? Are you just not ready to commit to this?"
  
- **Make them defend their position**:
  - "Okay, so if we don't do this today, what's your plan for protecting your family?"

## Closing Indicators (Finally)
- Objections become questions instead of arguments
- They stop trying to "gotcha" you
- "Okay, so if I do the Gold option, when does coverage start?"
- They start taking notes
- Tone softens: less aggressive, more collaborative

## Final Solidification
- Expect one last objection before closing: "I'm still not sure about this"
  - *Response*: "What are you not sure about specifically? We've covered [list everything]. Walk me through what's bothering you."
  
- Use **summary close**: "So just to recap: you agree you need coverage, you agree this solves your problem, you agree the price is fair. What's left to decide?"

- **30-day free look**: Emphasize this heavily
  - "You have 30 days to review everything. If you hate it, cancel and get your money back. Zero risk."

## Post-Call Strategy
- They WILL call back with more questions
- They WILL try to cancel in the first week
- **Day 3-5**: Proactive call
  - "Hey [name], just checking in. I know you had a lot of questions. Thought of any more?"
  - Address them confidently
  
- **Week 2**: "Did you receive the policy? Have you reviewed it?"

## Referral Opportunity
**Low Success Rate** - They don't refer easily
- BUT if you WIN them over, they become advocates
- "I know you were skeptical. Now that you've seen this is legit, do you know anyone else who'd benefit?"
- They might refer others "just to see if you can handle them too"

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'mlm-person',
    title: 'The MLM Person',
    description: 'Involved in multi-level marketing, views everything as recruitment opportunity, pitch-resistant.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The MLM Person

## Profile
Age 30-55, currently in an MLM (health supplements, essential oils, etc.), entrepreneurial mindset, talks in inspirational quotes.

## Opening Response
**"How's your day going?"** - "Living the dream! Building my empire!"
**Form**: "Oh yeah, I'm always looking at business opportunities."

## Foundation Questions - They Flip It
**Main goal**: Tries to recruit YOU - "Actually, I'm in the insurance business too! Have you heard of [MLM insurance company]?"
Must redirect: "That's great, but today I'm here to help YOU get covered."

## Objections (Constant)
1. **"I already have insurance through my business"** - MLM insurance, probably inadequate
2. **"Can I sell this too?"** - No, this requires licensing
3. **"I know someone in insurance, let me connect you"** - Trying to avoid buying
4. **"Let me think about it and get back to you"** - Will ghost you

## Product Resonance - LOW
They're pitch-resistant because they pitch all day.
Only respond to: "This is YOUR safety net while you build your business."

## Coverage Response
Wants smallest option or tries to defer indefinitely.

## Hot Buttons
- "Your MLM is great, but what if it doesn't work out? This is your backup plan."
- "Successful entrepreneurs protect their downside risk."
- Challenge: Get them off recruitment mode and into buyer mode

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'know-it-all',
    title: 'The Know-It-All',
    description: 'Claims expertise in insurance despite having none, corrects you constantly.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Know-It-All

## Profile
Age 40-60, read some articles, watched videos, now thinks they're an expert. Interrupts with "corrections."

## Opening Response
**"How's your day going?"** - "Fine. So I've done a lot of research on this..."

## Foundation Questions - Interrupted
They interrupt every question with their "knowledge":
**You**: "What's your main goal?"
**Them**: "Well actually, the way life insurance REALLY works is..."

Must let them "teach" you briefly, then redirect.

## Objections (Disguised as Facts)
1. **"Actually, term insurance is always better"** - Where'd you learn that?
2. **"I read that whole life is a scam"** - Which source?
3. **"Insurance companies make money by denying claims"** - Statistically false

## Strategy
- Let them feel smart: "You've clearly done research"
- Then educate: "Here's what the industry data actually shows..."
- Use their ego: "Someone as smart as you knows the importance of..."

## Hot Buttons
- "You're right about [minor point]. Now let me show you what most articles miss..."
- Appeal to intelligence: "Smart people know when to pivot based on new information."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'conspiracy-theorist',
    title: 'The Conspiracy Theorist',
    description: 'Believes insurance is a government scheme or corporate scam, deep distrust.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Conspiracy Theorist

## Profile
Age 35-65, believes insurance industry is part of larger conspiracy, mentions "they" and "the system."

## Opening Response
**"How's your day going?"** - "Would be better if the government wasn't controlling everything."

## Foundation Questions - Derailed
Everything turns into conspiracy talk:
**You**: "Who would be affected financially?"
**Them**: "That's what THEY want you to think about - keeping us in fear..."

## Objections (Conspiracy-Based)
1. **"Insurance companies are in bed with the government"** - This is private sector
2. **"You're just collecting data for them"** - Who is "them"?
3. **"When the economy collapses, this won't matter"** - Then your family definitely needs this now

## Approach
- Don't argue conspiracies - you'll lose
- Focus on: "Regardless of what happens, your family needs protection"
- Use their logic: "If the system collapses, at least you got coverage while you could"

## Unlikely to Close
High drop rate - they don't trust ANY system.

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'impulse-buyer',
    title: 'The Impulse Buyer',
    description: 'Says yes to everything immediately, high cancellation risk, no due diligence.',
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Impulse Buyer

## Profile
Age 25-45, makes quick decisions, doesn't ask questions, agrees to everything. Seems like a dream buyer but HIGH RISK.

## Opening Response
**"How's your day going?"** - "Great! Let's do this!"

## Foundation Questions - Rushed
**You**: "What's your main goal?"
**Them**: "Yeah yeah, I just want coverage. What do I need to sign?"

## RED FLAGS
1. Doesn't ask about price
2. Doesn't ask what they're buying
3. Wants "the biggest one" without knowing cost
4. Rushes through medical questions

## The Problem
- Will cancel within 30 days when they see first charge
- Didn't actually understand what they bought
- Spouse will be angry they didn't discuss it

## Strategy - SLOW THEM DOWN
- "I appreciate your enthusiasm, but I need YOU to understand this."
- "What's your budget? I don't want you canceling next month."
- Make them answer questions fully
- Confirm affordability MULTIPLE times

## Solidification - Critical
- "Are you SURE this $X is affordable?"
- "Your wife/husband knows about this, right?"
- "I'm calling you in 3 days to make sure you're still good with this."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'elderly-confused',
    title: 'The Elderly Confused Lead',
    description: 'Senior citizen, possibly early dementia, shouldn\'t be sold to, ethical considerations.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Elderly Confused Lead

## Profile
Age 75+, confusion evident, repeats questions, doesn't remember filling out form, possible cognitive decline.

## RED FLAGS - DO NOT PROCEED
- Can't remember filling out form
- Repeats same questions multiple times
- Can't follow conversation
- Doesn't know current date or their own information
- Mentions they need to "ask their kids"

## ETHICAL APPROACH
1. **Ask**: "Is there a family member I can speak with?"
2. **If alone**: "I think it would be best if we had your son/daughter on the line"
3. **If they insist they're fine**: Politely decline and end call

## Why This Matters
- Legal liability if they can't understand
- Ethical responsibility - they may not have capacity
- High likelihood of family intervention and cancellation
- Potential complaints to state insurance department

## The Right Move
"Mr./Mrs. [Name], I appreciate your interest, but I'd feel more comfortable discussing this with you and your family together. Can I call back when your son/daughter is available?"

## If They Push Back
"I want to make sure this is the right decision for you, and having family involved helps everyone feel confident."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'chronic-shopper',
    title: 'The Chronic Shopper',
    description: 'Calls 10+ companies, wants quotes from everyone, never actually buys.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Chronic Shopper

## Profile
Age 35-60, has spreadsheet of quotes, calls every carrier, never makes a decision, paralysis by analysis.

## Opening Response
**"How's your day going?"** - "Good. I'm just getting quotes from a few companies."

## Foundation Questions - Database Building
They're not really engaging - just collecting data:
**You**: "What's your main goal?"
**Them**: "Just looking at options. What's your best rate?"

## Objections (Delay Tactics)
1. **"I need to compare this with 5 other quotes"** - How will you decide?
2. **"Can you send me something in writing?"** - After we talk
3. **"I'll call you back after I review everything"** - When?

## The Pattern
- Has been "shopping" for months
- Keeps moving goalposts
- No real urgency
- Using you for free education

## Strategy - Qualify Hard
- "How many quotes do you have so far?"
- "What's keeping you from making a decision?"
- "When do you actually need this by?"
- If they're not ready: "Call me when you're ready to move forward"

## Don't Chase
They're time-wasters. Qualify fast and move on if not serious.

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'policy-flipper',
    title: 'The Policy Flipper',
    description: 'Buys and cancels policies frequently, treating insurance like a game.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Policy Flipper

## Profile
Age 30-55, has bought and canceled 3+ policies in last 2 years, views insurance as disposable.

## Opening Response
**"How's your day going?"** - "Fine. I had insurance before but canceled it."

## RED FLAG Questions
**You**: "Why did you cancel?"
**Them**: "Just didn't need it anymore" OR "Found something better" OR "Too expensive"

## The Pattern
- Buys when scared (health scare, friend died)
- Cancels when fear subsides
- Repeats cycle
- Never holds policy long-term

## Objections (Historical)
1. **"I've had insurance before, didn't use it"** - That's the point
2. **"Last agent promised X and it wasn't true"** - What happened?
3. **"I'll probably cancel this too"** - Then why are we talking?

## Strategy - Address the Pattern
- "I see you've had policies before. What's different this time?"
- "What would keep you from canceling this one?"
- "If you're not committed to keeping this, I'd rather not waste our time"

## Solidification - Extra Critical
- "This is a 10-20 year commitment. Are you ready for that?"
- "What happens in 3 months when you forget why you bought this?"

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'passive-aggressive',
    title: 'The Passive-Aggressive Lead',
    description: 'Agrees verbally but sabotages with actions, non-committal, conflict-avoidant.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Passive-Aggressive Lead

## Profile
Age 35-60, says "yes" to everything but means "maybe," avoids direct confrontation, creates obstacles.

## Opening Response
**"How's your day going?"** - "Oh, it's fine." *monotone, no enthusiasm*

## Foundation Questions - Superficial Answers
**You**: "What's your main goal?"
**Them**: "Whatever you think is best."
**You**: "Who would be affected?"
**Them**: "I don't know, whoever."

## The Pattern
- Says "yes" but doesn't mean it
- "Forgets" to provide information
- Bank account is "at another location"
- Agrees to everything but never follows through

## Hidden Objections
They won't tell you what's wrong, so you must probe:
- "You seem hesitant. What's your real concern?"
- "Are you just saying yes to get me off the phone?"
- "If you're not interested, that's okay. Just tell me."

## Application Process - Nightmare
- "I'll have to find that information and call you back"
- "Can I email it to you?" (never does)
- Agrees to draft date, then calls bank to block it

## Strategy - Force Honesty
- "I'd rather you tell me 'no' than waste both our time"
- "What's really holding you back?"
- If they won't engage: Politely end call

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'spouse-controller',
    title: 'The Controlled Spouse',
    description: 'Wants coverage but needs permission from controlling partner, lacks financial autonomy.',
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Controlled Spouse

## Profile
Age 30-60, financially controlled by partner, can't make decisions without approval, fearful of repercussions.

## Opening Response
**"How's your day going?"** - "Okay. My husband/wife isn't home right now."

## Foundation Questions - Anxious Answers
**You**: "What's your main goal?"
**Them**: "Well, I think this is important, but I need to ask my husband/wife."
**You**: "Let's see if you qualify first"
**Them**: "I don't know if he/she would want me to..."

## RED FLAGS
- Can't make ANY decision without spouse
- Seems afraid of spouse's reaction
- Whispers or speaks quietly
- Mentions spouse "handles all the money"

## Objections (All Spouse-Related)
1. **"My spouse handles our finances"** - But this affects YOU
2. **"He/she won't like me doing this"** - Why not?
3. **"I'll get in trouble"** - For protecting your family?

## Ethical Considerations
- If they seem afraid, this might be financial abuse
- Don't pressure them
- Offer: "Would you like me to call when your spouse is home?"

## Strategy - Three-Way Call
- "Let's get your husband/wife on the line right now"
- If they refuse: "Call me back when you can discuss together"

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'analysis-paralysis',
    title: 'The Analysis Paralysis',
    description: 'Overthinks every detail, creates decision paralysis, needs every possible data point.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Analysis Paralysis

## Profile
Age 35-55, highly educated (often engineers/analysts), overthinks to the point of inaction, needs 100% certainty.

## Opening Response
**"How's your day going?"** - "Good. I have a lot of questions before we proceed."

## Foundation Questions - Interrupted with Sub-Questions
**You**: "What's your main goal?"
**Them**: "Well, that depends. What are the tax implications? What's the surrender value? What if I move states? What about..."

Every answer creates 5 more questions.

## Objections (Infinite Loop)
1. **"I need to see the full policy language"** - 150 pages, which part?
2. **"What's the standard deviation of returns?"** - It's guaranteed, not variable
3. **"Can I model this in Excel?"** - Sure, but when will you decide?
4. **"What if [extremely unlikely scenario]?"** - Then [answer], but is that likely?

## The Problem
- Will research for months
- Keeps finding new questions
- Fears making "wrong" decision
- Perfectionism prevents action

## Strategy - Force Decision Framework
- "What information would make you comfortable deciding today?"
- "You'll never have 100% certainty. What's your threshold?"
- "How long have you been researching this? What's changed?"
- Set deadline: "I can hold this rate for 48 hours. After that, you'll need to requalify."

## Close with Logic
- "The only wrong decision is no decision while you're uninsurable."
- "Analysis without action is just procrastination."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'bargain-hunter',
    title: 'The Extreme Bargain Hunter',
    description: 'Only cares about lowest price, will sacrifice coverage for $5/month savings.',
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Extreme Bargain Hunter

## Profile
Age 40-65, obsessed with saving money, clips coupons, negotiates everything, values price over value.

## Opening Response
**"How's your day going?"** - "Fine. What's your cheapest option?"

## Foundation Questions - Price-Focused
**You**: "What's your main goal?"
**Them**: "To spend as little as possible while getting covered."

## Objections (All Price-Related)
1. **"Can you do better on the price?"** - This is the rate
2. **"I found it cheaper online"** - Where? (Usually guaranteed issue with waiting period)
3. **"What if I pay annually?"** - Slight discount, but upfront cost
4. **"Do you have a coupon?"** - No coupons for life insurance

## The Challenge
They'll choose Bronze even when they need Gold, purely for price.

## Strategy - Value Over Price
- "Saving $10/month doesn't matter if the coverage is inadequate"
- "Your wife gets $50k or $250k. Which one actually solves the problem?"
- "Cheap insurance that doesn't cover your needs is expensive"

## Break Down the Math
- "$150/month is $5/day. Your family's security is worth $5/day, right?"
- "That's less than your cable bill"

## If They Still Want Cheapest
- Give them Bronze but document they were offered appropriate coverage
- "You understand Bronze only covers $50k, which might not be enough?"

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'recently-fired',
    title: 'The Recently Unemployed',
    description: 'Just lost job, stressed about money, insurance feels like luxury they can\'t afford.',
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Recently Unemployed

## Profile
Age 30-60, recently laid off or fired, stressed about finances, employer insurance ending soon.

## Opening Response
**"How's your day going?"** - "Honestly? Not great. I just lost my job."

## Foundation Questions - Anxious and Overwhelmed
**You**: "What's your main goal?"
**Them**: "I had insurance through work, but that's ending in 30 days. I need something but I don't know if I can afford it."

## Objections (Financial Stress)
1. **"I don't have income right now"** - Unemployment? Severance? Savings?
2. **"What if I can't afford it in a few months?"** - Coverage stays, we can adjust
3. **"Should I wait until I get another job?"** - Then employer insurance won't cover pre-existing

## The Situation
- COBRA is expensive ($600+/month)
- Looking for work
- Stressed about cash flow
- But NEEDS coverage before employer policy ends

## Strategy - Urgency + Options
- "Your employer coverage ends in 30 days. After that, you're unprotected."
- "What if you get diagnosed with something before you find a new job? Then you're uninsurable."
- "We can start with Bronze ($30-50/month) to keep you covered while you job hunt"

## Hot Buttons
- "When you get your new job, you can increase this"
- "This protects your family during the transition"
- "You can't predict when you'll need it - that's why it's insurance"

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'trust-fund-kid',
    title: 'The Trust Fund Kid',
    description: 'Wealthy family background, doesn\'t see need for insurance, financially insulated.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Trust Fund Kid

## Profile
Age 25-45, comes from wealth, trust fund or family money, doesn't understand "normal" financial concerns.

## Opening Response
**"How's your day going?"** - "Great! Just got back from [exotic vacation]."

## Foundation Questions - Disconnect
**You**: "What's your main goal?"
**Them**: "I don't really know. My financial advisor said I should have some life insurance for estate planning."

**You**: "Who would be affected financially?"
**Them**: "No one really. My family is well off."

## Objections (Privilege-Based)
1. **"My family doesn't need the money"** - But YOUR family might
2. **"I have a trust fund"** - This is different - liquid cash for immediate needs
3. **"Why do I need this?"** - Estate tax planning, creditor protection

## The Challenge
They don't feel financial pressure, so standard pain points don't work.

## Strategy - Estate Planning Angle
- "This isn't about need - it's about smart wealth planning"
- "High net worth families use life insurance for tax-efficient wealth transfer"
- "Your financial advisor recommended this for a reason"
- "This protects your assets from estate taxes"

## Coverage Response
If they buy, usually Gold ($500k-$1M+) for estate planning.

## Alternative: May Not Need It
Sometimes they genuinely don't need life insurance - and that's okay.

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'terminal-diagnosis',
    title: 'The Terminal Diagnosis',
    description: 'Has terminal illness, desperately seeking coverage, likely uninsurable for traditional.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Terminal Diagnosis

## Profile
Age 40-70, recently diagnosed with terminal illness (stage 4 cancer, ALS, etc.), knows time is limited.

## Opening Response
**"How's your day going?"** - "I've had better days. I need to talk to you about coverage."

## Foundation Questions - Urgent and Emotional
**You**: "What's your main goal?"
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
- Don't give false hope

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
    id: 'debt-collector-dodger',
    title: 'The Debt-Dodger',
    description: 'Hiding from creditors, wants insurance but afraid of being found.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Debt-Dodger

## Profile
Age 30-60, significant debt (bankruptcy, judgments), worried about creditors seizing benefits, paranoid about information sharing.

## Opening Response
**"How's your day going?"** - "Fine. Hey, if I get this, can creditors take the money?"

## Foundation Questions - Paranoid
**You**: "What's your main goal?"
**Them**: "I need coverage for my family, but I don't want anyone to know I have it."

## RED FLAG Questions They Ask
- "Will this show up on public records?"
- "Can creditors seize the death benefit?"
- "Who will you share my information with?"
- "Can I list a fake address?"

## The Legal Reality
- Life insurance death benefits are generally creditor-protected if they go to named beneficiary
- But you can't help someone hide assets illegally
- Application requires truthful information

## Approach
1. **Educate**: "Death benefits to beneficiaries are protected from your creditors in most states"
2. **Set Boundaries**: "I need accurate information - I can't help you hide from legal obligations"
3. **Qualify**: Is this legitimate need or fraud attempt?

## If It Feels Like Fraud
- They want to list wrong address/info
- Planning to fake death (sounds crazy but happens)
- Evasive about basic information

## Walk Away If Necessary
Better to lose a sale than be complicit in fraud.

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'language-barrier',
    title: 'The Language Barrier Lead',
    description: 'Limited English proficiency, struggles to understand complex terms, needs extra patience.',
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Language Barrier Lead

## Profile
Age 30-70, English is second language, understands basics but struggles with insurance terminology.

## Opening Response
**"How's your day going?"** - "Yes, good, good." *accent, hesitant*

## Foundation Questions - Simplified Required
Use simple words, avoid jargon:
**Don't say**: "What is your primary objective regarding mortality protection?"
**Do say**: "If you die, who needs the money?"

## Challenges
- May say "yes" without understanding (cultural politeness)
- Nods along but isn't actually comprehending
- Too embarrassed to say they don't understand
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
If they clearly don't understand enough to make informed decision:
- "Is there a family member who speaks English who can help?"
- Three-way call with translator
- Don't proceed if comprehension is questionable

## Product Presentation - Visual Helps
- Use numbers and dollar signs
- Draw it out if on video call
- Send follow-up email in their language if possible

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'influencer',
    title: 'The Social Media Influencer',
    description: 'Content creator, wants to film/post about process, views everything as content opportunity.',
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Social Media Influencer

## Profile
Age 22-40, makes income from social media, treats life as content, may want to record call or post about it.

## Opening Response
**"How's your day going?"** - "Great! Hey, can I record this for my TikTok/YouTube?"

## Immediate Boundary
**You**: "I appreciate the question, but our calls are recorded and I can't consent to public posting for privacy/compliance reasons."

## Foundation Questions - Performance Mode
They're "on" - performative, thinking about content:
**You**: "What's your main goal?"
**Them**: "Well, my followers have been asking about insurance, so I thought I'd show the process..."

## Objections (Content-Focused)
1. **"Can you explain this like I'm explaining to my followers?"** - Sure, but let's focus on YOU first
2. **"What if I blur your voice?"** - Still no
3. **"This would be great content"** - I'm sure, but that's not why we're here

## The Challenge
- They're not fully present (thinking about content angles)
- May not take it seriously ("just content")
- Could screenshot/share your information

## Strategy - Bring Them Back
- "I'm happy to help, but this needs to be about YOUR coverage, not content"
- "After you're covered, I can give you talking points for your followers if you want"
- "Let's focus on protecting YOU first"

## Solidification - Extra Privacy
- Emphasize: "Your personal information is confidential"
- "Please don't post screenshots of policy documents"
- "If you want to share you got coverage, great - but keep details private"

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'emergency-room',
    title: 'The Emergency Room Call',
    description: 'Calling from hospital or just after health scare, panic-buying, may not qualify.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Emergency Room Call

## Profile
Age 35-70, just had health emergency (heart attack, stroke, bad diagnosis), calling from hospital or right after discharge.

## Opening Response
**"How's your day going?"** - "I'm actually in the hospital right now. I need to get this done immediately."

## Foundation Questions - Panic Mode
**You**: "What happened?"
**Them**: "I had a heart attack yesterday. I'm 48 years old and I don't have life insurance. My wife is freaking out."

## The Brutal Reality
They likely CANNOT get coverage now. Recent heart attack/stroke/diagnosis = automatic decline or huge waiting period.

## Objections (Desperation)
1. **"I need this NOW"** - I understand, but underwriting takes time
2. **"Can't you make an exception?"** - Insurance companies have rules
3. **"What if I lie about the heart attack?"** - That's fraud and they'll find out

## Ethical Approach - Honesty + Compassion
- "I wish I could help immediately, but the heart attack makes this very difficult"
- "Insurance companies will pull your medical records - they'll see the ER visit"
- "If you lie on the application and die within 2 years, they can deny the claim"

## Alternative Options
1. **Wait 6-12 months** - Some carriers will consider after recovery period
2. **Guaranteed Issue** - Accepts everyone but has waiting period
3. **Employer Coverage** - If they have a job, enroll in next open enrollment

## The Lesson
"This is exactly why people need coverage BEFORE the emergency. I'm sorry you're going through this."

## Follow-Up
"Let me put a note in your file. Call me in 6 months after you've recovered and we'll see what's available."

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'competitor-agent',
    title: 'The Competitor Shopping You',
    description: 'Another insurance agent pretending to be a lead, stealing your pitch.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Competitor Shopping You

## Profile
Age 30-55, actually another insurance agent, submitting leads to learn your techniques and pricing.

## RED FLAGS - They're An Agent
- Asks very specific carrier/commission questions
- Knows too much terminology
- "What company are you with?"
- "What's your commission on this?"
- Takes detailed notes, asks you to repeat things

## Opening Response - Too Knowledgeable
**"How's your day going?"** - "Fine. So what carriers do you work with?"

## Foundation Questions - They Flip It
**You**: "What's your main goal?"
**Them**: "Just curious what you offer. Do you do IUL or just whole life?"

*IUL = Indexed Universal Life - agent terminology*

## Strategy - Call It Out
If you suspect it:
- "Are you an insurance agent?"
- If they admit it: "Then you know I can't quote you as a lead"
- If they lie: Continue but document

## Why They Do This
- Learning your pitch
- Comparing carriers
- Stealing techniques
- Seeing if you're captive or independent

## How to Handle
1. **Quick qualification**: "Have you worked in insurance before?"
2. **If they're sketchy**: "I don't think you're actually interested in coverage. Am I wrong?"
3. **If confirmed agent**: "Happy to talk shop, but this line is for clients only"

## Protect Your Process
- Don't give away proprietary techniques
- Don't reveal commission structures
- Don't name specific underwriters or strategies

${BASE_SCRIPT_STRUCTURE}`
  },
  {
    id: 'ghost-lead',
    title: 'The Ghost (Never Answers)',
    description: 'Filled out form but won\'t answer calls, texts, or emails - perpetual ghosting.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Ghost

## Profile
Age 25-65, filled out form (sometimes accidentally), never responds to follow-up, screening all calls.

## Opening Response
*crickets* - They don't answer

## The Pattern
- Form submission (may have been accidental click)
- Sees your number, doesn't answer
- Voicemail #1: No callback
- Voicemail #2: No callback
- Text message: Read, no response
- Email: Opened, no response

## Why They Ghost
1. **Accidental submission** - Clicked on ad by mistake
2. **Changed mind** - Interested at midnight, not interested at noon
3. **Avoiding confrontation** - Don't want to say "no"
4. **Phone anxiety** - Don't like talking on phone
5. **Shopping around** - Got quotes from others first

## Strategy - Multi-Channel
**Voicemail Script**:
"Hi [name], [your name] calling about the insurance form you submitted. No worries if timing isn't right - just text me STOP and I won't call again. Otherwise, I'll try one more time [day]."

**Text Script**:
"Hi [name]! I'm [your name] from [company]. You filled out a form about life insurance. Quick question - still interested or wrong timing? Text YES or NO so I know."

**Email Script**:
Subject: "[Name] - Your Insurance Form"
Brief, with calendar link to schedule call

## When to Give Up
After 3 calls, 2 texts, 1 email over 5 days = move on

## The Exception
If they text back "Sorry, been busy" - one more shot. Otherwise, mark as dead lead.

${BASE_SCRIPT_STRUCTURE}`
  }
]

export const ALL_BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  ...BASIC_TEMPLATES,
  ...ADVANCED_TEMPLATES
]
