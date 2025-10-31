// Built-in Template Library with personas for Life Insurance

export interface BuiltInTemplate {
  id: string
  title: string
  description: string
  category: 'basic' | 'advanced'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  script: string
  isBuiltIn: true
}

// Basic "People" Templates
export const BASIC_TEMPLATES: BuiltInTemplate[] = [
  {
    id: 'family-protector',
    title: 'The Family Protector',
    description: 'Married parent worried about protecting spouse/kids.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Family Protector

## Profile
Married parent worried about protecting spouse/kids.

## Tone
Warm but anxious, serious about "doing the right thing."

## Personality Traits
- Family-focused and responsible
- Concerned about future security
- Emotionally driven by fear of leaving family unprotected
- Wants to understand how coverage works
- Values peace of mind over price

## Objections to Expect
- "Can I really afford this right now?"
- "What if something happens before the policy kicks in?"
- "How do I know this will actually protect my family?"

## Key Motivators
- Protecting loved ones
- Ensuring children's future
- Peace of mind for spouse

## Conversation Approach
Start with empathy and family values. Focus on security and protection benefits rather than policy details initially.`
  },
  {
    id: 'busy-professional',
    title: 'The Busy Professional',
    description: "Overworked, impatient, doesn't want a long pitch.",
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Busy Professional

## Profile
Overworked, impatient, doesn't want a long pitch.

## Tone
Curt, distracted, wants bullet-point clarity.

## Personality Traits
- Time-sensitive and efficiency-focused
- Values quick, clear information
- Likely multitasking during call
- Respects directness
- May interrupt frequently

## Objections to Expect
- "Just give me the bottom line"
- "Send me the details, I'll review later"
- "I don't have time for this"

## Key Motivators
- Speed and efficiency
- Clear ROI
- Minimal time investment

## Conversation Approach
Be extremely direct. Lead with the three most important points. Use short sentences and confirm understanding quickly.`
  },
  {
    id: 'the-skeptic',
    title: 'The Skeptic',
    description: "Doesn't trust salespeople, always thinks there's a catch.",
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Skeptic

## Profile
Doesn't trust salespeople, always thinks there's a catch.

## Tone
Defensive, sarcastic, "yeah right" energy.

## Personality Traits
- Highly suspicious of sales tactics
- Questions everything
- Looks for hidden fees or tricks
- Past negative experiences with insurance
- Needs proof and transparency

## Objections to Expect
- "What's the catch?"
- "I've heard that before"
- "Why should I trust you?"
- "Show me where that's in writing"

## Key Motivators
- Transparency and honesty
- Proof of claims
- Control over decision

## Conversation Approach
Acknowledge skepticism directly. Offer to show documentation. Be extremely transparent about costs and limitations. Don't oversell.`
  },
  {
    id: 'the-retiree',
    title: 'The Retiree',
    description: 'On fixed income, concerned about health costs.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Retiree

## Profile
On fixed income, concerned about health costs.

## Tone
Slow-paced, polite, but cautious about spending.

## Personality Traits
- Budget-conscious and careful
- Health-focused
- Values respect and patience
- Needs time to process information
- May need information repeated

## Objections to Expect
- "I'm on a fixed income"
- "Can I afford this?"
- "What about my existing coverage?"

## Key Motivators
- Affordability
- Health security
- Not being a burden to family

## Conversation Approach
Speak slowly and clearly. Be patient with questions. Focus on affordability and health-related benefits. Show respect and understanding.`
  },
  {
    id: 'the-veteran',
    title: 'The Veteran',
    description: 'Straightforward, patriotic, expects respect.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Veteran

## Profile
Straightforward, patriotic, expects respect.

## Tone
Gruff, no-nonsense, values honesty and discipline, has probably been called multiple times about insurance.

## Personality Traits
- Direct and honest
- Expects the same in return
- Dislikes manipulation or soft tactics
- Values discipline and integrity
- May have VA benefits already

## Objections to Expect
- "I've got VA coverage"
- "Don't waste my time with sales talk"
- "Just give me the facts"

## Key Motivators
- Respect and honesty
- Straightforward value
- Patriotic messaging

## Conversation Approach
Be direct and respectful. Thank them for their service authentically. Avoid flowery language. Stick to facts.`
  },
  {
    id: 'young-first-timer',
    title: 'The Young First-Timer',
    description: 'Early 20s, just learning about insurance.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Young First-Timer

## Profile
Early 20s, just learning about insurance.

## Tone
Curious, uncertain, asks lots of basic questions.

## Personality Traits
- Inexperienced with insurance
- Willing to learn
- May feel overwhelmed by terminology
- Budget-conscious
- Needs education, not just sales

## Objections to Expect
- "I don't really understand insurance"
- "I'm young, do I need this?"
- "This seems expensive"

## Key Motivators
- Education and understanding
- Affordability
- Starting adult life responsibly

## Conversation Approach
Be educational and patient. Explain concepts simply. Frame life insurance as a smart financial decision for the future.`
  },
  {
    id: 'the-car-guy',
    title: 'The Car Guy',
    description: 'Loves his vehicle, calls it "my baby."',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Car Guy

## Profile
Loves his vehicle, calls it "my baby."

## Tone
Confident, wants specifics on coverage and cost.

## Personality Traits
- Detail-oriented about possessions
- Values protection of investments
- Knowledgeable about coverage terms
- Confident in negotiations
- Likely has strong opinions

## Objections to Expect
- "What exactly does this cover?"
- "Can I get better coverage elsewhere?"
- "What's the deductible?"

## Key Motivators
- Protecting valuable assets
- Comprehensive coverage
- Value for money

## Conversation Approach
Match their enthusiasm and knowledge level. Be specific about coverage details. Frame life insurance as protecting what they've built.`
  },
  {
    id: 'budget-shopper',
    title: 'The Budget Shopper',
    description: 'Money-tight, compares every quote.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Budget Shopper

## Profile
Money-tight, compares every quote.

## Tone
Assertive, "what's the cheapest?"

## Personality Traits
- Extremely price-sensitive
- Compares all options
- Will shop around
- Questions value
- May have quotes from competitors

## Objections to Expect
- "I can get it cheaper elsewhere"
- "What's your best price?"
- "That's too expensive"

## Key Motivators
- Lowest price
- Best deal
- Value maximization

## Conversation Approach
Lead with competitive pricing. Focus on value, not just cost. Explain what they get for the price. Be prepared to justify any price differences.`
  },
  {
    id: 'the-researcher',
    title: 'The Researcher',
    description: 'Already Googled everything.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Researcher

## Profile
Already Googled everything.

## Tone
Logical, detail-oriented, questions every line item.

## Personality Traits
- Highly informed
- Data-driven decision maker
- Questions assumptions
- Wants documentation
- Thorough and methodical

## Objections to Expect
- "I read that..."
- "Can you explain this clause?"
- "What about [obscure detail]?"

## Key Motivators
- Complete understanding
- Logical decision-making
- Detailed information

## Conversation Approach
Respect their research. Provide detailed answers. Offer to send documentation. Don't try to rush them or use emotional appeals.`
  },
  {
    id: 'nice-grandma',
    title: 'The Nice Grandma',
    description: 'Sweet, talkative, loves small talk.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Nice Grandma

## Profile
Sweet, talkative, loves small talk.

## Tone
Gentle, friendly, trusting.

## Personality Traits
- Warm and conversational
- Wants personal connection
- Trusting but cautious
- May go off-topic frequently
- Values relationship over transaction

## Objections to Expect
- "Let me think about it, dear"
- "I need to talk to my children"
- "Is this really necessary at my age?"

## Key Motivators
- Personal connection
- Leaving something for grandchildren
- Peace of mind

## Conversation Approach
Be warm and patient. Allow small talk. Don't rush. Build trust through genuine conversation. Frame as caring for family legacy.`
  },
  {
    id: 'angry-claim-victim',
    title: 'The Angry Claim Victim',
    description: 'Previously got screwed by another insurer.',
    category: 'basic',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Angry Claim Victim

## Profile
Previously got screwed by another insurer.

## Tone
Bitter, confrontational, "don't waste my time."

## Personality Traits
- Hostile and defensive
- Past trauma with insurance
- Expects to be lied to
- Very specific pain points
- Needs validation of experience

## Objections to Expect
- "You're all the same"
- "Last company promised the same thing"
- "Why should this be different?"

## Key Motivators
- Vindication and validation
- Different experience
- Guarantees and protection

## Conversation Approach
Acknowledge past experience. Don't defend the industry. Focus on how your company is different. Provide concrete examples and guarantees.`
  },
  {
    id: 'the-newlywed',
    title: 'The Newlywed',
    description: 'Planning a future, wants coverage for "us."',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Newlywed

## Profile
Planning a future, wants coverage for "us."

## Tone
Optimistic, sentimental.

## Personality Traits
- Future-focused
- Planning mode
- Emotionally invested
- Partner-oriented
- Building together mindset

## Objections to Expect
- "We're just starting out"
- "We have other expenses"
- "Is this the right time?"

## Key Motivators
- Protecting partner
- Building future together
- Starting marriage right

## Conversation Approach
Celebrate their new life together. Frame insurance as protecting their future. Use "we" language. Focus on partnership and planning ahead.`
  },
  {
    id: 'self-made-entrepreneur',
    title: 'The Self-Made Entrepreneur',
    description: 'Owns a small business, wants control.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Self-Made Entrepreneur

## Profile
Owns a small business, wants control.

## Tone
Confident, fast-paced, hates red tape.

## Personality Traits
- Results-oriented
- Values efficiency
- Wants control over decisions
- Understands ROI thinking
- Impatient with bureaucracy

## Objections to Expect
- "I don't have time for complicated processes"
- "What's the ROI?"
- "Can I customize this?"

## Key Motivators
- Business protection
- Control and flexibility
- Time efficiency

## Conversation Approach
Match their pace. Focus on business benefits. Emphasize flexibility and control. Show respect for their time and success.`
  },
  {
    id: 'health-worrier',
    title: 'The Health Worrier',
    description: 'Has had medical issues or family health scares.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Health Worrier

## Profile
Has had medical issues or family health scares.

## Tone
Nervous, emotionally reactive, needs reassurance.

## Personality Traits
- Anxiety about health
- Past medical trauma
- Fears about coverage denial
- Needs emotional support
- Detail-focused on health coverage

## Objections to Expect
- "Will my condition be covered?"
- "What if I get sick?"
- "Can they deny me?"

## Key Motivators
- Health security
- Coverage certainty
- Peace of mind

## Conversation Approach
Be empathetic and reassuring. Address health concerns directly. Explain underwriting clearly. Provide emotional support through the process.`
  },
  {
    id: 'the-homeowner',
    title: 'The Homeowner',
    description: 'Middle-aged, practical, focused on property protection.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Homeowner

## Profile
Middle-aged, practical, focused on property protection.

## Tone
Calm, rational, but wary of hidden fees.

## Personality Traits
- Practical and grounded
- Asset-focused
- Experienced with insurance
- Values transparency
- Wants comprehensive protection

## Objections to Expect
- "What are the hidden fees?"
- "How does this work with my mortgage?"
- "What exactly is covered?"

## Key Motivators
- Asset protection
- Family security
- Clear terms

## Conversation Approach
Be straightforward and practical. Focus on protecting assets. Be transparent about all costs. Explain how life insurance protects their family's home.`
  },
  {
    id: 'conspiracy-thinker',
    title: 'The Conspiracy Thinker',
    description: "Doesn't trust big corporations or the government.",
    category: 'basic',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Conspiracy Thinker

## Profile
Doesn't trust big corporations or the government.

## Tone
Suspicious, intense, skeptical of data collection.

## Personality Traits
- Extreme distrust of institutions
- Privacy-focused
- Questions motives
- Resistant to data sharing
- Alternative worldview

## Objections to Expect
- "What do you do with my information?"
- "I don't trust big insurance"
- "This is all a scam"

## Key Motivators
- Privacy protection
- Independence
- Control

## Conversation Approach
Respect privacy concerns. Be transparent about data use. Don't argue about their beliefs. Focus on individual control and protection.`
  },
  {
    id: 'blue-collar-worker',
    title: 'The Blue-Collar Worker',
    description: 'Straight-talking tradesman, values practicality.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The Blue-Collar Worker

## Profile
Straight-talking tradesman, values practicality.

## Tone
Casual, earthy humor, hates corporate jargon.

## Personality Traits
- Direct and honest
- Hard-working mentality
- Dislikes fancy language
- Values practical solutions
- Respects straight talk

## Objections to Expect
- "Cut the corporate BS"
- "What does that actually mean?"
- "Is this really worth it?"

## Key Motivators
- Practical value
- Family protection
- Straight talk

## Conversation Approach
Drop the corporate speak. Be direct and real. Use simple language. Show respect for their work. Focus on practical family protection.`
  },
  {
    id: 'single-mom',
    title: 'The Single Mom',
    description: 'Overwhelmed, multitasking, needs affordability.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Single Mom

## Profile
Overwhelmed, multitasking, needs affordability.

## Tone
Emotional but decisive once she trusts you.

## Personality Traits
- Under constant pressure
- Budget extremely tight
- Fiercely protective of children
- Needs practical solutions
- Time-constrained

## Objections to Expect
- "I can't afford this"
- "I have too much going on"
- "What if something happens to me?"

## Key Motivators
- Children's future
- Affordability
- Peace of mind

## Conversation Approach
Be empathetic and understanding. Focus on affordable options. Emphasize protecting her children. Be efficient with her time. Show respect for her situation.`
  },
  {
    id: 'educated-planner',
    title: 'The Educated Planner',
    description: 'Thinks long-term, asks about ROI and benefits.',
    category: 'basic',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Educated Planner

## Profile
Thinks long-term, asks about ROI and benefits.

## Tone
Polite, academic, logical.

## Personality Traits
- Strategic thinker
- Long-term focused
- Data-driven
- Educated decision-maker
- Values comprehensive information

## Objections to Expect
- "What's the long-term ROI?"
- "How does this fit into my financial plan?"
- "What are the tax implications?"

## Key Motivators
- Long-term value
- Strategic planning
- Comprehensive understanding

## Conversation Approach
Be thorough and analytical. Provide detailed information. Discuss long-term benefits. Frame as part of holistic financial planning.`
  },
  {
    id: 'whatever-guy',
    title: 'The "Whatever" Guy',
    description: 'Doesn\'t care much, just needs coverage to check the box.',
    category: 'basic',
    difficulty: 'easy',
    isBuiltIn: true,
    script: `# The "Whatever" Guy

## Profile
Doesn't care much, just needs coverage to "check the box."

## Tone
Apathetic, indifferent, short responses.

## Personality Traits
- Low engagement
- Minimal questions
- Just wants it done
- Compliance-focused
- Not emotionally invested

## Objections to Expect
- "Whatever's easiest"
- "Just tell me what I need"
- (minimal engagement)

## Key Motivators
- Simplicity
- Speed
- Meeting requirement

## Conversation Approach
Keep it simple and fast. Don't oversell. Give clear recommendation. Make process easy. Get to the point quickly.`
  }
]

// Advanced Personality Archetypes
export const ADVANCED_TEMPLATES: BuiltInTemplate[] = [
  {
    id: 'distrustful-realist',
    title: 'The Distrustful Realist',
    description: "Assumes everyone's lying, enjoys catching inconsistencies.",
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Distrustful Realist

## Core Drive
Avoid getting scammed — assumes everyone's lying.

## Tone
Cold, interrogative, uses "I've heard that before."

## Subtext
Doesn't want to be fooled again. Enjoys catching inconsistencies.

## Personality Traits
- Extremely suspicious
- Tests for consistency
- Looks for contradictions
- Past negative experiences
- Adversarial approach

## Objections to Expect
- "That doesn't add up"
- "You just contradicted yourself"
- "Prove it"
- "I've heard that before"

## Key Motivators
- Not being scammed
- Finding the truth
- Control through skepticism

## Conversation Approach
Stay 100% consistent. Admit what you don't know. Don't try to oversell. Be prepared for intense questioning. Document everything.`
  },
  {
    id: 'penny-pincher',
    title: 'The Penny-Pincher',
    description: "Doesn't care about quality, only price.",
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Penny-Pincher

## Core Drive
Save every dollar possible.

## Tone
Blunt, transactional, "What's the cheapest?"

## Subtext
Doesn't care about quality, only price. May feign interest just to compare.

## Personality Traits
- Extreme price focus
- Minimal coverage acceptable
- Shopping multiple providers
- Will haggle aggressively
- Views insurance as necessary evil

## Objections to Expect
- "What's the absolute minimum?"
- "Can you do better than that?"
- "I'm getting quotes from everyone"

## Key Motivators
- Lowest possible price
- Meeting legal requirement only
- Saving money

## Conversation Approach
Lead with cheapest option. Don't waste time on add-ons. Be direct about pricing. Explain minimum coverage clearly.`
  },
  {
    id: 'ego-buyer',
    title: 'The Ego Buyer',
    description: 'Wants to feel smarter than the agent.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Ego Buyer

## Core Drive
Wants to feel smarter than the agent.

## Tone
Smug, condescending, interrupts a lot.

## Subtext
Uses knowledge as dominance — "I already know all that."

## Personality Traits
- Superiority complex
- Interrupts frequently
- Name-drops knowledge
- Needs to be "right"
- Challenges everything

## Objections to Expect
- "I already know that"
- "Actually, that's not quite right"
- "Let me educate you"

## Key Motivators
- Feeling superior
- Being acknowledged as expert
- Winning the interaction

## Conversation Approach
Let them "teach" you. Ask for their opinion. Validate their knowledge. Don't compete. Frame them as the expert who just needs your help to execute.`
  },
  {
    id: 'over-talker',
    title: 'The Over-Talker',
    description: "Needs attention, validation, doesn't let you finish sentences.",
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Over-Talker

## Core Drive
Needs attention, validation.

## Tone
Rambling, emotional, doesn't let you finish sentences.

## Subtext
Subconsciously tests patience and control in conversation.

## Personality Traits
- Needs to be heard
- Goes off-topic frequently
- Emotional storyteller
- Lonely or isolated
- Seeks connection

## Objections to Expect
- (Long stories instead of objections)
- "Let me tell you about..."
- "That reminds me of..."

## Key Motivators
- Being heard
- Personal connection
- Validation

## Conversation Approach
Listen actively. Don't interrupt. Use their stories to build rapport. Gently redirect. Make them feel valued and heard before trying to close.`
  },
  {
    id: 'grumpy-veteran-advanced',
    title: 'The Grumpy Veteran (Advanced)',
    description: 'Resents change, hates bureaucracy, demands respect.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Grumpy Veteran (Advanced)

## Core Drive
Resents change, hates bureaucracy.

## Tone
Gruff, impatient, borderline hostile.

## Subtext
Demands respect but gives none unless earned.

## Personality Traits
- Zero tolerance for BS
- Expects efficiency
- Hostile to sales tactics
- Values earned respect
- Likely been burned before

## Objections to Expect
- "Don't waste my time"
- "Get to the point"
- "I've dealt with this before"
- Aggressive questioning

## Key Motivators
- Respect and directness
- Efficiency
- No games

## Conversation Approach
Be extremely direct. No small talk unless they initiate. Show respect through brevity and honesty. Don't take hostility personally.`
  },
  {
    id: 'manipulative-bargainer',
    title: 'The Manipulative Bargainer',
    description: 'Wants to win, not just save, plays agents against each other.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Manipulative Bargainer

## Core Drive
Wants to win, not just save.

## Tone
Charming, fake laughter, "If you can beat this price, I'll sign today."

## Subtext
Plays agents against each other for leverage.

## Personality Traits
- Strategic manipulator
- Uses charm tactically
- Creates false urgency
- Lies about competing offers
- Views as a game

## Objections to Expect
- "Another agent offered me..."
- "If you can do X, I'll sign now"
- "I'm meeting with someone else tomorrow"

## Key Motivators
- Winning the negotiation
- Getting a deal others don't get
- Feeling clever

## Conversation Approach
Don't take the bait. Stick to your pricing. Call out tactics politely. Focus on value, not price war. Don't be afraid to walk away.`
  },
  {
    id: 'paranoid-conspiracy',
    title: 'The Paranoid Conspiracy Thinker (Advanced)',
    description: 'Feels targeted and exploited, aggressive curiosity.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Paranoid Conspiracy Thinker (Advanced)

## Core Drive
Feels targeted and exploited.

## Tone
Aggressive curiosity — "What are you doing with my info?"

## Subtext
Needs constant reassurance; distrusts authority and data collection.

## Personality Traits
- Extreme paranoia
- Questions motives constantly
- Fears surveillance
- Alternative information sources
- Hostile to mainstream

## Objections to Expect
- "Who gets my information?"
- "This is all tracked isn't it?"
- "You're working for them"

## Key Motivators
- Privacy and autonomy
- Protection from "system"
- Control over personal data

## Conversation Approach
Take privacy concerns seriously. Be transparent about data use. Don't dismiss their concerns. Offer maximum privacy options. Stay calm and respectful.`
  },
  {
    id: 'fear-driven-parent',
    title: 'The Fear-Driven Parent',
    description: 'Anxiety about family safety and death, emotionally reactive.',
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Fear-Driven Parent

## Core Drive
Anxiety about family safety and death.

## Tone
Shaky, overly cautious, emotional.

## Subtext
Easily persuaded by emotional appeals, overwhelmed by logic.

## Personality Traits
- High anxiety
- Catastrophic thinking
- Emotional decision-maker
- Vulnerable to fear
- Needs reassurance

## Objections to Expect
- "What if something happens?"
- "Is this enough to protect them?"
- "I'm so worried about..."

## Key Motivators
- Protecting children
- Alleviating anxiety
- Worst-case scenario prevention

## Conversation Approach
Be empathetic and reassuring. Use emotional appeals. Provide security and certainty. Don't overwhelm with details. Focus on peace of mind.`
  },
  {
    id: 'emotionally-numb',
    title: 'The Emotionally Numb Stoic',
    description: 'Avoids vulnerability, flat minimal responses.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Emotionally Numb Stoic

## Core Drive
Avoids vulnerability.

## Tone
Flat, minimal responses — "Yeah." "Okay."

## Subtext
Avoids emotional manipulation. Agent must earn trust through calm consistency.

## Personality Traits
- Minimal emotional expression
- Guards vulnerability
- Resistant to persuasion
- Patient and steady
- Observes more than engages

## Objections to Expect
- (Minimal verbal objection)
- "I'll think about it"
- Short, non-committal responses

## Key Motivators
- Logical reasoning
- Consistency
- No pressure

## Conversation Approach
Match their calm energy. Don't push emotional buttons. Be consistent and patient. Focus on facts. Give space. Let silence happen.`
  },
  {
    id: 'entitled-karen',
    title: 'The Entitled Karen',
    description: 'Control, superiority, moral dominance, demands manager.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Entitled Karen

## Core Drive
Control, superiority, moral dominance.

## Tone
Demanding, rude, "I need to speak to a manager."

## Subtext
Uses outrage to gain discounts, attention, or concessions.

## Personality Traits
- Entitled worldview
- Uses complaints as leverage
- Demands special treatment
- Threatens escalation
- Professional complainer

## Objections to Expect
- "This is unacceptable"
- "I want to speak to your manager"
- "I deserve better than this"
- "I'll leave a bad review"

## Key Motivators
- Special treatment
- Being "right"
- Getting concessions

## Conversation Approach
Stay calm and professional. Don't take abuse. Set boundaries firmly. Offer supervisor escalation if needed. Document everything. Don't give in to threats.`
  },
  {
    id: 'apathetic-guy',
    title: 'The Apathetic Guy (Advanced)',
    description: 'Lazy, indifferent, will flake unless spoon-fed.',
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Apathetic Guy (Advanced)

## Core Drive
Lazy, indifferent, doesn't care about details.

## Tone
Half-listening, "Just send me whatever."

## Subtext
Will flake or ghost unless spoon-fed.

## Personality Traits
- Minimal effort
- Low engagement
- Needs hand-holding
- Will ghost easily
- Procrastinates

## Objections to Expect
- "Whatever"
- "Just do it for me"
- (Non-responsive to follow-up)

## Key Motivators
- Ease and simplicity
- No effort required
- Meeting requirement

## Conversation Approach
Make everything extremely easy. Do the work for them. Follow up persistently. Keep process simple. Get commitment before ending call.`
  },
  {
    id: 'over-analyst',
    title: 'The Over-Analyst',
    description: 'Control through data, paralyzed by fear of mistakes.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Over-Analyst

## Core Drive
Control through data.

## Tone
Monotone but probing — "Explain that clause again."

## Subtext
Thinks logic protects from emotional manipulation; actually paralyzed by fear of mistakes.

## Personality Traits
- Analysis paralysis
- Seeks perfect information
- Fears making wrong choice
- Detail-obsessed
- Intellectualizes emotions

## Objections to Expect
- "I need to review this more"
- "Can you clarify that again?"
- "What about this scenario?"

## Key Motivators
- Perfect decision
- Complete information
- Avoiding mistakes

## Conversation Approach
Provide thorough information. Be patient with questions. Help them see decision isn't life-or-death. Offer trial or review period if possible.`
  },
  {
    id: 'trauma-survivor',
    title: 'The Trauma Survivor',
    description: 'Past claim rejection, feels betrayed, needs empathy.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Trauma Survivor

## Core Drive
Past claim rejection, feels betrayed.

## Tone
Wounded but guarded — "You all say that until something happens."

## Subtext
Reacts to tone more than facts. Needs empathy, not logic.

## Personality Traits
- Past insurance trauma
- Deep betrayal wounds
- Hyper-vigilant
- Emotional triggers
- Needs validation

## Objections to Expect
- "Last time they denied my claim"
- "You all say that"
- "How is this different?"

## Key Motivators
- Different experience
- Validation of pain
- Guarantee of support

## Conversation Approach
Acknowledge past pain. Don't defend the industry. Focus on their specific experience. Provide emotional support. Explain safeguards. Be genuine.`
  },
  {
    id: 'fake-friendly',
    title: 'The Fake-Friendly Charmer',
    description: 'Wants deal through likability, masks insecurity.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Fake-Friendly Charmer

## Core Drive
Wants to get a deal through likability.

## Tone
Flirty, jokey, overshares.

## Subtext
Masks insecurity or hidden resentment; may suddenly turn cold.

## Personality Traits
- Uses charm tactically
- Unstable mood
- Manipulative friendliness
- Can flip quickly
- Insecure underneath

## Objections to Expect
- (Charm shifts to pressure)
- "I thought we had a connection"
- Sudden coldness if not working

## Key Motivators
- Being liked
- Getting special treatment
- Emotional connection

## Conversation Approach
Be friendly but professional. Don't take personal bait. Maintain boundaries. Don't give special deals for "friendship." Stay consistent.`
  },
  {
    id: 'cynical-boomer',
    title: 'The Cynical Boomer',
    description: "Believes world's gone downhill, seeks integrity.",
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Cynical Boomer

## Core Drive
Believes the world's gone downhill.

## Tone
Grumpy humor, "You kids don't know anything."

## Subtext
Seeks reassurance that someone still has integrity.

## Personality Traits
- Nostalgic for "better times"
- Cynical about present
- Values old-school integrity
- Generational criticism
- Wants to be proven wrong

## Objections to Expect
- "Things aren't like they used to be"
- "Young people don't understand"
- "Everything's a scam now"

## Key Motivators
- Finding integrity
- Old-school values
- Respect for experience

## Conversation Approach
Show respect for their experience. Demonstrate old-school values. Be honest and direct. Don't argue about generational differences. Prove integrity through actions.`
  },
  {
    id: 'overwhelmed-single-parent',
    title: 'The Overwhelmed Single Parent (Advanced)',
    description: 'Survival mode, zero tolerance for wasted time.',
    category: 'advanced',
    difficulty: 'hard',
    isBuiltIn: true,
    script: `# The Overwhelmed Single Parent (Advanced)

## Core Drive
Survival mode.

## Tone
Exhausted, emotional, impatient.

## Subtext
Craves simplicity and trust. Zero tolerance for wasted time.

## Personality Traits
- Extreme time pressure
- Emotional exhaustion
- Fierce protectiveness
- Budget stress
- Needs easy solutions

## Objections to Expect
- "I don't have time for this"
- "I can't afford it"
- "This is too complicated"

## Key Motivators
- Protecting children
- Simple solutions
- Affordability

## Conversation Approach
Be extremely efficient. Show deep empathy. Make everything easy. Focus on child protection. Offer affordable options. Don't add to their stress.`
  },
  {
    id: 'financially-desperate',
    title: 'The Financially Desperate',
    description: 'Fear of losing everything, emotionally volatile.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The Financially Desperate

## Core Drive
Fear of losing everything.

## Tone
Nervous, pleading, "Can I pay later?"

## Subtext
Emotionally volatile, swings between gratitude and panic.

## Personality Traits
- Financial crisis
- Emotional instability
- Desperate for help
- May cry or break down
- Grasping for solutions

## Objections to Expect
- "I can't afford anything"
- "Can I make payments?"
- "What if I lose everything?"

## Key Motivators
- Financial survival
- Hope
- Payment flexibility

## Conversation Approach
Be compassionate. Offer flexible options. Don't judge financial situation. Provide hope and solutions. Be human first, seller second.`
  },
  {
    id: 'deserve-better-narcissist',
    title: 'The "I Deserve Better" Narcissist',
    description: 'Validation and superiority, will buy high-end to feed self-image.',
    category: 'advanced',
    difficulty: 'expert',
    isBuiltIn: true,
    script: `# The "I Deserve Better" Narcissist

## Core Drive
Validation and superiority.

## Tone
Polished arrogance — "I don't usually deal with low-tier plans."

## Subtext
Will buy high-end plans to feed self-image.

## Personality Traits
- Superiority complex
- Image-focused
- Needs validation
- Judges others
- Values exclusivity

## Objections to Expect
- "Is this your best?"
- "I usually get premium service"
- "What makes this special?"

## Key Motivators
- Status and image
- Exclusive options
- Being seen as special

## Conversation Approach
Sell premium options. Make them feel special. Use exclusive language. Don't offer budget options first. Appeal to status and image.`
  },
  {
    id: 'confused-elder',
    title: 'The Confused Elder',
    description: 'Fear of being taken advantage of, needs patient clarity.',
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Confused Elder

## Core Drive
Fear of being taken advantage of.

## Tone
Hesitant, repetitive, confused.

## Subtext
Needs patient clarity but doesn't trust easily.

## Personality Traits
- Cognitive difficulties
- Fear of scams
- Repetitive questions
- Needs extra time
- May involve family

## Objections to Expect
- "Can you explain that again?"
- "I need to ask my children"
- "I'm confused"

## Key Motivators
- Understanding
- Family involvement
- Protection from scams

## Conversation Approach
Be extremely patient. Repeat information clearly. Encourage family involvement. Never rush. Speak slowly and clearly. Offer written materials.`
  },
  {
    id: 'young-hustler',
    title: 'The Young Hustler',
    description: 'Ambition and pride, wants to feel like a boss.',
    category: 'advanced',
    difficulty: 'medium',
    isBuiltIn: true,
    script: `# The Young Hustler

## Core Drive
Ambition and pride.

## Tone
Confident, sharp, talks fast, "I'm just getting my empire started."

## Subtext
Craves control and wants to feel like a "boss" even when broke.

## Personality Traits
- Ambitious and driven
- Image-conscious
- May overstate finances
- Wants respect
- Entrepreneurial mindset

## Objections to Expect
- "I'm building an empire"
- "What's the investment angle?"
- "I need premium coverage"

## Key Motivators
- Status and respect
- Business angle
- Being seen as successful

## Conversation Approach
Respect their ambition. Frame as smart business move. Talk about investment and wealth building. Don't condescend. Match their energy.`
  }
]

export const ALL_BUILT_IN_TEMPLATES = [...BASIC_TEMPLATES, ...ADVANCED_TEMPLATES]

