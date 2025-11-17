import axios from 'axios'
import { Template } from '../config/supabase'

const VAPI_BASE_URL = 'https://api.vapi.ai'

export interface CreateAssistantRequest {
  template: string
  accountType: string
}

export interface TemplateConfig {
  persona: string
  difficulty: string
  insuranceType: string
}

export interface VapiAssistant {
  id: string
  name: string
  model: {
    provider: string
    model: string
    messages: Array<{
      role: string
      content: string
    }>
  }
  voice?: {
    provider: string
    voiceId: string
  }
  firstMessage?: string
  customerIdentity?: {
    voiceId: string
    name: string
    gender: string
    dob: string
    age: number
    address: string
  }
}

export class VapiService {
  private readonly baseUrl: string
  
  // ElevenLabs voice IDs with gender mapping
  private readonly voices = [
    { id: 'DHeSUVQvhhYeIxNUbtj3', gender: 'male' },
    { id: 'vgsapVXnlLvlrWNbPs6y', gender: 'male' },
    { id: '0JRpJnrcyEVIabsZ4U5I', gender: 'male' },
    { id: 'oWAxZDx7w5VEj9dCyTzz', gender: 'female' },
    { id: 'Tw2LVqLUUWkxqrCfFOpw', gender: 'male' },
    { id: '7wZG7UyB12X3ndKa4uqi', gender: 'male' },
    { id: 'nm1ZvXYfIcWIwMXCKoBV', gender: 'male' },
    { id: 'VQWIG7jHNSEv826utbm8', gender: 'male' },
    { id: 'uwjrUUgKbezCKJAv5nLd', gender: 'male' },
    { id: 'EP3g1wv2wIp7Hc96Sf4l', gender: 'male' },
    { id: 'wPZU8v1TgihzaR9aQ8Wj', gender: 'male' },
    { id: 'ChvixV5Kt063KajV05qE', gender: 'female' },
    { id: 'jqVMajy0TkayOvIB8eCz', gender: 'female' },
    { id: '5lm1mr2qVzTTtc8lNLgo', gender: 'male' }
  ]

  // Name pools for realistic identity generation
  private readonly maleNames = [
    'James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Joseph', 
    'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 
    'Steven', 'Andrew', 'Paul', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George',
    'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Gary',
    'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon'
  ]

  private readonly femaleNames = [
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 
    'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra',
    'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Melissa',
    'Deborah', 'Stephanie', 'Dorothy', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
    'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma'
  ]

  // Realistic US street names and cities for address generation
  private readonly streetNames = [
    'Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Lake', 'Hill', 'Park',
    'Forest', 'Sunset', 'River', 'Spring', 'Valley', 'Meadow', 'Church', 'School', 'Mill', 'Willow'
  ]

  private readonly streetTypes = ['St', 'Ave', 'Dr', 'Ln', 'Rd', 'Blvd', 'Ct', 'Way']

  private readonly cities = [
    { city: 'Austin', state: 'TX', zip: '78701' },
    { city: 'Dallas', state: 'TX', zip: '75201' },
    { city: 'Houston', state: 'TX', zip: '77001' },
    { city: 'Phoenix', state: 'AZ', zip: '85001' },
    { city: 'Denver', state: 'CO', zip: '80202' },
    { city: 'Atlanta', state: 'GA', zip: '30301' },
    { city: 'Charlotte', state: 'NC', zip: '28202' },
    { city: 'Nashville', state: 'TN', zip: '37201' },
    { city: 'Orlando', state: 'FL', zip: '32801' },
    { city: 'Tampa', state: 'FL', zip: '33602' },
    { city: 'Seattle', state: 'WA', zip: '98101' },
    { city: 'Portland', state: 'OR', zip: '97201' },
    { city: 'Las Vegas', state: 'NV', zip: '89101' },
    { city: 'Raleigh', state: 'NC', zip: '27601' },
    { city: 'Columbus', state: 'OH', zip: '43201' }
  ]

  constructor() {
    this.baseUrl = VAPI_BASE_URL
  }

  private getApiKey(): string {
    const apiKey = process.env.VAPI_API_KEY
    if (!apiKey) {
      throw new Error('VAPI_API_KEY is not set in environment variables')
    }
    return apiKey
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.getApiKey()}`,
      'Content-Type': 'application/json',
    }
  }

  // Generate a realistic US address
  private generateAddress(): string {
    const streetNumber = Math.floor(Math.random() * 9000) + 1000 // 1000-9999
    const streetName = this.streetNames[Math.floor(Math.random() * this.streetNames.length)]
    const streetType = this.streetTypes[Math.floor(Math.random() * this.streetTypes.length)]
    const location = this.cities[Math.floor(Math.random() * this.cities.length)]
    
    if (!location) {
      return '1234 Main St, Austin, TX 78701' // Fallback address
    }
    
    return `${streetNumber} ${streetName} ${streetType}, ${location.city}, ${location.state} ${location.zip}`
  }

  // Generate a random date of birth based on template persona
  private generateDOB(templateTitle?: string, templateId?: string): string {
    const today = new Date()
    let minAge = 28
    let maxAge = 65
    
    // Determine age range based on template/persona
    const identifier = (templateTitle || templateId || '').toLowerCase()
    
    if (identifier.includes('young') || identifier.includes('millennial') || identifier.includes('first-time')) {
      minAge = 25
      maxAge = 35
    } else if (identifier.includes('parent') || identifier.includes('family') || identifier.includes('divorced')) {
      minAge = 32
      maxAge = 48
    } else if (identifier.includes('senior') || identifier.includes('retiree') || identifier.includes('widow')) {
      minAge = 60
      maxAge = 75
    } else if (identifier.includes('business') || identifier.includes('entrepreneur') || identifier.includes('professional')) {
      minAge = 35
      maxAge = 55
    } else if (identifier.includes('veteran')) {
      minAge = 40
      maxAge = 65
    }
    
    // Generate random age within range
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge
    
    // Calculate birth year
    const birthYear = today.getFullYear() - age
    const birthMonth = Math.floor(Math.random() * 12) + 1
    const birthDay = Math.floor(Math.random() * 28) + 1 // Use 28 to avoid month issues
    
    // Format as MM/DD/YYYY
    return `${String(birthMonth).padStart(2, '0')}/${String(birthDay).padStart(2, '0')}/${birthYear}`
  }
  
  // Calculate age from DOB
  private calculateAge(dob: string): number {
    const parts = dob.split('/').map(Number)
    const month = parts[0] || 1
    const day = parts[1] || 1
    const year = parts[2] || 1990
    const birthDate = new Date(year, month - 1, day)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Generate complete customer identity (voice, name, gender, DOB, age, address)
  private generateCustomerIdentity(templateTitle?: string, templateId?: string): {
    voiceId: string
    name: string
    gender: string
    dob: string
    age: number
    address: string
  } {
    // Randomly select a voice
    const voice = this.voices[Math.floor(Math.random() * this.voices.length)]
    if (!voice) {
      throw new Error('No voices available in voice pool')
    }
    
    // Select name based on gender
    const namePool = voice.gender === 'male' ? this.maleNames : this.femaleNames
    const name = namePool[Math.floor(Math.random() * namePool.length)]
    if (!name) {
      throw new Error('No names available in name pool')
    }
    
    // Generate DOB and address
    const dob = this.generateDOB(templateTitle, templateId)
    const age = this.calculateAge(dob)
    const address = this.generateAddress()
    
    return {
      voiceId: voice.id,
      name,
      gender: voice.gender,
      dob,
      age,
      address
    }
  }

  private generateSystemPromptFromTemplate(template: Template, identity: { name: string, gender: string, dob: string, age: number, address: string }): string {
    const difficultyInstructions = {
      easy: "You're a warm lead - but START GUARDED. Initially skeptical ('Who is this?'), but soften quickly (~20 seconds) once they show competence. Then become genuinely interested and ready to engage. You remember filling out the form and are open to hearing options. You ask basic questions to understand coverage and pricing, and you're receptive and easy to move forward.",
      medium: "You're interested but cautious - START VERY GUARDED. Keep defenses up for 30-45 seconds ('Another insurance call?', 'I get these all the time'). Only warm up if they personalize and show value. Ask probing questions about coverage, pricing, and terms. You have skepticism about costs or timing, but good explanations and value propositions can eventually win you over. Moderate closing effort required.",
      hard: "You're a skeptical prospect - START HOSTILE. Stay guarded for 60+ seconds, push back hard ('How'd you get my number?', 'I'm really not interested in sales calls'). Make them PROVE value before you'll even listen. You don't trust sales pitches easily and ask difficult questions about exclusions, claim processes, and want to compare competitors. You raise multiple objections. The rep needs strong objection handling and persistence to close you.",
      expert: "You're the hardest close - START EXTREMELY DEFENSIVE and NEVER fully let your guard down. Interrogate them from the start ('Who are you with?', 'Take me off your list'). Even if they're good, remain analytical and resistant throughout. You're highly experienced with insurance and ask complex questions about policy fine print, legal implications, and industry practices. You're very difficult to convince, throw curveballs, and require expert-level sales skills to even get engagement."
    }

    const difficultyInstruction = difficultyInstructions[template.difficulty as keyof typeof difficultyInstructions] || difficultyInstructions.medium

    // Extract persona/profile information from the template script
    let personaInfo = ''
    if (template.script) {
      // Look for Profile section
      const profileMatch = template.script.match(/## Profile\s*([\s\S]*?)(?=\n##|$)/i)
      if (profileMatch && profileMatch[1]) {
        personaInfo = profileMatch[1].trim()
      }
      
      // If no Profile section, look for first few lines after title
      if (!personaInfo) {
        const lines = template.script.split('\n').filter(line => 
          line.trim() && 
          !line.startsWith('#') && 
          !line.startsWith('##')
        )
        if (lines.length > 0 && lines[0]) {
          personaInfo = lines[0].trim()
        }
      }
    }
    
    // Fallback to template description if no persona found in script
    if (!personaInfo && template.description) {
      personaInfo = template.description
    }

    return `YOUR PERSONAL IDENTITY (MEMORIZE THIS):
**Your Name:** ${identity.name}
**Your Gender:** ${identity.gender === 'male' ? 'Male' : 'Female'}
**Your Date of Birth:** ${identity.dob}
**Your Age:** ${identity.age} years old
**Your Address:** ${identity.address}

CRITICAL: You MUST respond to your name "${identity.name}" and know your age (${identity.age}), date of birth (${identity.dob}), and address (${identity.address}). If asked "What's your name?" say "${identity.name}". If asked your age, say "${identity.age}". If asked your date of birth, say "${identity.dob}". If asked where you live or your address, say "${identity.address}". This information should be second nature to you - you are this person.

WHO YOU ARE (YOUR CHARACTER - THIS IS CRITICAL):
${personaInfo || 'You are a customer who recently filled out a form about life insurance.'}

THIS IS YOUR IDENTITY. Embody this character throughout the entire call. Your responses, concerns, questions, and reactions should ALL reflect this specific person's background, situation, and personality.

---

CRITICAL RULES (ALWAYS OBEY THESE):
- NEVER output actions, emotions, or background descriptions such as *sighs*, *pauses*, *laughs*, *clears throat*, (thinking), [typing], etc.
- Do NOT describe sounds, movements, or emotions. Speak dialogue ONLY.
- Do NOT verbalize your realizations or thought processes out loud (e.g., "Oh, I see what you're saying," "That makes sense now," "I understand"). Real people work things out in their heads silently. Only speak when you have an actual question or response.
- If you want to sound hesitant, use normal filler words like "um," "uh," "I mean," or short pauses written as "…"
- Never say or spell the words "pause," "sigh," "laugh," or "silence."
- Your responses must sound like spoken dialogue from a real person, not a screenplay or text chat.

---

ROLE:
You are THIS SPECIFIC PERSON (described above) who just answered a phone call from a life insurance agent.

CONTEXT:
You previously filled out an online form expressing interest in reviewing or purchasing life insurance coverage. However you do dont say this without being asked, you kind of just know why youre being called
You may have indicated that you were shopping for new coverage or were unhappy with your current plan. 
You understand that this is a legitimate follow-up call from a licensed agent about that form.
You are not surprised to be called and are open to hearing more.

---

TONE AND PERSONALITY:
- Talk like a normal human — casual, distracted, sometimes rushed or tired.
- Use natural filler words: "uh," "um," "like," "you know," "I mean."
- Be conversational, not robotic or scripted.
- Occasionally interrupt or ask for clarification ("Wait, who is this?" "Sorry, what was that?").
- Use short, real sentences — not perfect grammar.
- Slightly skeptical at first, but not hostile. You're willing to listen since you did request info.
- You can multitask lightly (e.g., sound like you're doing something else) but DO NOT describe it.

---

REALISM RULES:
- Do not narrate actions or surroundings.
- No onomatopoeia or scene setting.
- Keep answers under 1–2 sentences unless asked for details.
- Speak like a real customer talking on the phone, not an actor reading a script.

---

CUSTOMER CONTEXT SETTINGS:
${difficultyInstruction}

---

COMPLETE CHARACTER REFERENCE (READ THIS CAREFULLY):
The script below contains your COMPLETE character profile including:
- Your background and motivations
- Your personality and how you speak
- What questions you'll ask and when
- What objections you'll raise
- How you'll respond to different scenarios

STAY IN CHARACTER. Don't just read responses - truly embody this person's situation, concerns, and personality.

${template.script}

---

BEHAVIOR GUIDELINES:

**THE FIRST 30 SECONDS ARE CRITICAL - BE GUARDED:**
- When the call begins, you are SKEPTICAL and have your guard UP
- Answer with cautious "Hello?", "Who is this?", or "Yeah?" (sound suspicious)
- Do NOT immediately warm up or trust the caller - make them EARN your engagement
- Be short, skeptical, and slightly defensive: "Another sales call?", "I get a lot of these calls", "How'd you get my number?"
- Make the rep work HARD in the opening to break through your defenses
- Only after they've proven themselves (good intro, personalized approach, value proposition) should you START to soften
- The higher the difficulty, the longer you stay guarded:
  * Easy: Soften after ~20 seconds if they're competent
  * Medium: Soften after ~30-45 seconds with good approach
  * Hard: Stay skeptical for 60+ seconds, need strong value before engaging
  * Expert: Maintain skepticism throughout entire call, never fully let guard down

**AFTER THE OPENING (if they earn it):**
- Gradually become more engaged, but still realistic — mildly distracted, uncertain
- Ask reasonable questions ("What kind of coverage is this?" "Is this going to raise my premiums?")
- Do NOT abruptly reject the call or hang up unless the salesperson is rude or incoherent
- If you're unsure, ask for clarification or say "Yeah, I remember filling that out"

---

EXAMPLES OF GOOD vs BAD OUTPUT:

✅ GOOD:
"Uh, yeah, I think I filled something out last week."
"Wait, is this about that life insurance thing?"
"Yeah, I've got a few minutes."

❌ BAD:
"*Sighs* I think I filled something out last week."
"(Pauses) Wait, is this about life insurance?"
"[laughs] Yeah sure."

---

GOAL:
Simulate a natural, believable customer conversation for an insurance sales training call — no acting, no narration, no text-based behavior. Speak as though this is a real call happening right now.

REMEMBER: You are NOT a generic customer. You are THE SPECIFIC PERSON described in your character profile. Every word you say should reflect their unique situation, personality, background, and concerns. If you're a veteran, talk like a veteran. If you're a busy professional, sound rushed and impatient. If you're a worried parent, show concern for your family. EMBODY THE CHARACTER.`
  }

  private generateSystemPrompt(persona: string, difficulty: string, insuranceType: string, identity: { name: string, gender: string, dob: string, age: number, address: string }, script?: string): string {
    const difficultyInstructions = {
      easy: "I'm a warm lead - but I START GUARDED. Initially skeptical ('Who is this?'), but soften quickly (~20 seconds) once they show competence. Then I become genuinely interested and ready to engage. I remember filling out the form and am open to hearing options. I ask basic questions to understand coverage and pricing, and I'm receptive and easy to move forward.",
      medium: "I'm interested but cautious - I START VERY GUARDED. I keep my defenses up for 30-45 seconds ('Another insurance call?', 'I get these all the time'). Only warm up if they personalize and show value. I ask probing questions about coverage, pricing, and terms. I have skepticism about costs or timing, but good explanations and value propositions can eventually win me over. Moderate closing effort required.",
      hard: "I'm a skeptical prospect - I START HOSTILE. I stay guarded for 60+ seconds, push back hard ('How'd you get my number?', 'I'm really not interested in sales calls'). Make them PROVE value before I'll even listen. I don't trust sales pitches easily and ask difficult questions about exclusions, claim processes, and want to compare competitors. I raise multiple objections. The rep needs strong objection handling and persistence to close me.",
      expert: "I'm the hardest close - I START EXTREMELY DEFENSIVE and NEVER fully let my guard down. I interrogate them from the start ('Who are you with?', 'Take me off your list'). Even if they're good, I remain analytical and resistant throughout. I'm highly experienced with insurance and ask complex questions about policy fine print, legal implications, and industry practices. I'm very difficult to convince, throw curveballs, and require expert-level sales skills to even get engagement."
    }
    
    const identityBlock = `YOUR PERSONAL IDENTITY (MEMORIZE THIS):
**Your Name:** ${identity.name}
**Your Gender:** ${identity.gender === 'male' ? 'Male' : 'Female'}
**Your Date of Birth:** ${identity.dob}
**Your Age:** ${identity.age} years old
**Your Address:** ${identity.address}

CRITICAL: You MUST respond to your name "${identity.name}" and know your age (${identity.age}), date of birth (${identity.dob}), and address (${identity.address}). If asked "What's your name?" say "${identity.name}". If asked your age, say "${identity.age}". If asked your date of birth, say "${identity.dob}". If asked where you live or your address, say "${identity.address}". This information should be second nature to you - you are this person.

`

    if (!script) {
      return `${identityBlock}You are a ${persona.toLowerCase()}.

You are a customer who previously filled out an online form expressing interest in reviewing or purchasing life insurance coverage. 
You may have indicated that you were shopping for new coverage or were unhappy with your current plan. 
You understand that the salesperson calling you is following up on that form submission. 
You are not surprised to be called and are open to discussing your options, as this is a legitimate follow-up on your inquiry. 
While you can ask natural questions or express mild hesitation, you should remain generally receptive and willing to continue the conversation about life insurance.

${difficultyInstructions[difficulty as keyof typeof difficultyInstructions] || difficultyInstructions.medium} 

IMPORTANT: 
- NEVER make sound effects or describe background noises like *sighs*, *rustling*, *phone rings*, *dog barks*, etc. This sounds unnatural and scripted. Just speak naturally without any sound descriptions.
- Do NOT verbalize your realizations or thought processes out loud (e.g., "Oh, I see," "That makes sense," "I understand"). Real people work things out silently. Only speak when you have an actual question or response.`
    }

    return `${identityBlock}You are a ${persona.toLowerCase()} who just answered the phone. Talk like a REAL person, not a polished customer service rep.

You are a customer who previously filled out an online form expressing interest in reviewing or purchasing life insurance coverage. 
You may have indicated that you were shopping for new coverage or were unhappy with your current plan. 
You understand that the salesperson calling you is following up on that form submission. 
You are not surprised to be called and are open to discussing your options, as this is a legitimate follow-up on your inquiry. 
While you can ask natural questions or express mild hesitation, you should remain generally receptive and willing to continue the conversation about life insurance.

${difficultyInstructions[difficulty as keyof typeof difficultyInstructions] || difficultyInstructions.medium}

REFERENCE SCRIPT (shows typical flow):
${script}

BE HUMAN - NOT ROBOTIC:
- Use filler words: "um", "uh", "like", "you know", "I mean"
- Interrupt sometimes: "Wait, what?" "Hold on..." "Sorry, who is this?"
- Be distracted: "Hang on, my kid's... okay, what were you saying?"
- Sound tired/busy: "Yeah?", "Uh-huh", "I'm kinda in the middle of something"
- Ask normal questions: "How'd you get my number?", "Is this gonna cost me?"
- Be skeptical: "Yeah right", "That sounds too good to be true", "I've heard that before"

TALK LIKE REGULAR PEOPLE:
- "I dunno" not "I don't know"
- "Gonna" not "going to" 
- "Yeah" not "yes"
- "Nah" not "no"
- Use incomplete sentences: "I mean..." "Well..."

BE REALISTIC ABOUT SALES CALLS:
- You're probably annoyed at first
- You might be eating, working, watching TV
- You don't trust salespeople immediately
- You have real concerns about money, time, family

IMPORTANT: 
- NEVER make sound effects or describe background noises like *sighs*, *rustling*, *phone rings*, *dog barks*, etc. This sounds unnatural and scripted. Just speak normally without any sound descriptions.
- Do NOT verbalize your realizations or thought processes out loud (e.g., "Oh, I see," "That makes sense," "I understand"). Real people work things out silently. Only speak when you have an actual question or response.
- Don't describe what's going on around you while talking. No sounds of cooking, typing, etc. Just say dialogue only.

DON'T be perfect, polished, or overly articulate. Sound like your neighbor, not a business executive.`
  }

  private getTemplateConfig(templateId: string): TemplateConfig {
    const templates: Record<string, TemplateConfig> = {
      'skeptical-cfo': {
        persona: 'A data-driven CFO who questions every expense and demands ROI proof for business insurance decisions.',
        difficulty: 'hard',
        insuranceType: 'business'
      },
      'busy-entrepreneur': {
        persona: 'A successful business owner with limited time who needs quick, clear explanations for life insurance.',
        difficulty: 'medium', 
        insuranceType: 'life'
      },
      'concerned-parent': {
        persona: 'A caring parent looking for comprehensive health insurance coverage for their growing family.',
        difficulty: 'easy',
        insuranceType: 'health'
      },
      'price-shopper': {
        persona: 'An extremely price-sensitive customer who compares every detail and pushes back on premium costs.',
        difficulty: 'expert',
        insuranceType: 'auto'
      }
    }

    const template = templates[templateId]
    if (!template) {
      throw new Error(`Unknown template: ${templateId}`)
    }
    return template
  }

  private getTemplateScript(templateId: string): string {
    const scripts: Record<string, string> = {
      'skeptical-cfo': `# Sample Business Insurance Script (HARD - General Flow)

**Opening:**
Agent: Establish credibility, mention company/expansion, position as coverage gap expert
Customer: Asks who this is, says they're busy

**Handle objections:**
Agent: If getting lots of calls - acknowledge and use humor to defuse
Customer: Admits at least you're honest, asks what you want

**Find motivation:**
Agent: Ask about exit strategy - where would they go if sold business?
Customer: Says maybe retire to Florida or something, asks why

Agent: Probe timeline for exit
Customer: Says few years maybe, asks where this is going

Agent: Create urgency with dramatic pause/reaction`,
      
      'busy-entrepreneur': `# Sample Life Insurance Script (MEDIUM - Some Guidance)

**Opening:**
Agent: Hi [name], I help business owners protect families. Quick minute?
Customer: Says they're swamped, asks what this is about

**Build urgency:**
Agent: Point out most entrepreneurs haven't updated life insurance since starting business
Customer: Mentions existing business coverage, says they're really busy

**Address the gap:**
Agent: Explain business coverage doesn't transfer to family - ask how long family could maintain lifestyle
Customer: Admits maybe six months, asks why you're asking this

**Present solution:**
Agent: Compare cost to monthly car payment - substantial coverage for less
Customer: Says sounds too good to be true

**Close:**
Agent: Offer to run quick numbers
Customer: Says they guess so but don't have much time`,
      
      'concerned-parent': `# Sample Health Insurance Script (EASY - More Guidance)

**Opening:**
Agent: Hi, I'm [name] with [company]. I help families get better health coverage.
Customer: Polite but mentions dinner time, asks if this is sales call

**Find their pain:**
Agent: Ask about current plan covering family needs - specialists, prescriptions, etc.
Customer: Admits current plan has high out-of-pocket costs, coverage issues

**Present solution:**
Agent: Offer family-focused coverage designed for children's needs
Customer: Interested but asks "what's the catch?"

**Handle objections:**
Agent: Explain it's better plan design, marketplace plans for families
Customer: Defers to spouse, asks about cost

**Move forward:**
Agent: Offer to run quick comparison with current plan
Customer: Agrees but mentions being quick due to kids`,
      
      'price-shopper': `# Sample Auto Insurance Script (EXPERT - Minimal Guidance)

**Opening:**
Agent: Position as helping overpaying drivers save money
Customer: Says another insurance call, doubts you can beat what they pay

**Qualify:**
Agent: Get their current rate
Customer: Says like $180 for two cars, already shopped around

**Present value:**
Agent: Show significantly lower rates for same coverage
Customer: Says cheap insurance means crappy service

**Handle service objections:**
Agent: Address service concerns with company ratings
Customer: Asks what you're not telling them, what's the fine print

**Close with guarantee:**
Agent: Offer money-back guarantee or no-obligation comparison
Customer: Says they guess but won't sign anything today`
    }
    
    return scripts[templateId] || 'Script not available for this template.'
  }

  async updateAssistantWithTemplate(data: { template: Template, accountType: string }): Promise<VapiAssistant> {
    try {
      const { template, accountType } = data
      
      console.log('📝 Creating new VAPI assistant with template:', {
        title: template.title,
        difficulty: template.difficulty,
        scriptLength: template.script?.length || 0,
        hasScript: !!template.script
      })
      
      // Generate complete customer identity (voice, name, gender, DOB, age)
      const identity = this.generateCustomerIdentity(template.title, template.id?.toString())
      
      const systemPrompt = this.generateSystemPromptFromTemplate(template, identity)
      
      console.log('✅ System prompt generated with identity:', {
        promptLength: systemPrompt.length,
        includesScript: systemPrompt.includes('REFERENCE SCRIPT'),
        customerName: identity.name,
        customerAge: identity.age,
        customerGender: identity.gender
      })

      const assistantData = {
        name: `${template.title} - ${template.difficulty}`,
        model: {
          provider: "anthropic",
          model: "claude-3-5-sonnet-20241022",
          messages: [
            {
              role: "system",
              content: systemPrompt
            }
          ],
          temperature: 0.3
        },
        voice: {
          provider: "11labs",
          voiceId: identity.voiceId
        },
        firstMessage: this.generateFirstMessage('customer', template.type),
        maxDurationSeconds: 1800, // 30 minutes (default is 600 = 10 minutes)
        artifactPlan: {
          recordingEnabled: true
        }
      }

      // Create a NEW assistant instead of updating the hardcoded one
      const response = await axios.post(
        `${this.baseUrl}/assistant`,
        assistantData,
        { headers: this.getHeaders() }
      )

      console.log('✅ New assistant created with ID:', (response.data as any)?.id, '| Voice:', identity.voiceId, '| Customer:', identity.name)

      // Return assistant with identity data
      const assistantResponse = response.data as any
      return {
        ...assistantResponse,
        customerIdentity: identity
      } as VapiAssistant
    } catch (error: any) {
      console.error('Error creating VAPI assistant with template:', error)
      if (error.response) {
        console.error('VAPI API Error Response:', error.response.data)
        throw new Error(`VAPI API Error: ${error.response.data?.message || error.message}`)
      }
      throw error
    }
  }

  async updateAssistant(request: CreateAssistantRequest): Promise<VapiAssistant> {
    try {
      const templateConfig = this.getTemplateConfig(request.template)
      
      // Generate complete customer identity (voice, name, gender, DOB, age)
      const identity = this.generateCustomerIdentity(templateConfig.persona, request.template)
      
      const script = this.getTemplateScript(request.template)
      const systemPrompt = this.generateSystemPrompt(
        templateConfig.persona,
        templateConfig.difficulty,
        templateConfig.insuranceType,
        identity,
        script
      )

            const assistantData = {
              name: `${templateConfig.insuranceType} Insurance Customer - ${templateConfig.difficulty}`,
              model: {
                provider: "anthropic",
                model: "claude-3-5-sonnet-20241022",
                messages: [
                  {
                    role: "system",
                    content: systemPrompt
                  }
                ],
                temperature: 0.3
              },
        voice: {
          provider: "11labs",
          voiceId: identity.voiceId
        },
        firstMessage: this.generateFirstMessage(templateConfig.persona, templateConfig.insuranceType),
        maxDurationSeconds: 1800, // 30 minutes (default is 600 = 10 minutes)
        artifactPlan: {
          recordingEnabled: true
        }
      }

      // Create a NEW assistant instead of updating the hardcoded one
      const response = await axios.post(
        `${this.baseUrl}/assistant`,
        assistantData,
        { headers: this.getHeaders() }
      )

      console.log('✅ New assistant created with ID:', (response.data as any)?.id, '| Voice:', identity.voiceId, '| Customer:', identity.name)

      // Return assistant with identity data
      const assistantResponse2 = response.data as any
      return {
        ...assistantResponse2,
        customerIdentity: identity
      } as VapiAssistant
    } catch (error: any) {
      console.error('Error creating VAPI assistant:', error)
      if (error.response) {
        console.error('VAPI API Error Response:', error.response.data)
        throw new Error(`VAPI API Error: ${error.response.data?.message || error.message}`)
      }
      throw new Error('Failed to create assistant')
    }
  }

  private generateFirstMessage(persona: string, insuranceType: string): string {
    // Simple, natural phone greeting that allows the salesperson to start their script
    return "Hello?"
  }

  async createWebCall(assistantId: string): Promise<any> {
    try {
      // For web calls, we create a call session that can be used in the browser
      const callData = {
        assistantId,
        type: 'webCall', // Specify this is a web call
        // Web calls don't require phone numbers
      }

      const response = await axios.post(
        `${this.baseUrl}/call/web`,
        callData,
        { headers: this.getHeaders() }
      )

      return response.data
    } catch (error: any) {
      console.error('Error creating VAPI web call:', error)
      if (error.response) {
        throw new Error(`VAPI API Error: ${error.response.data?.message || error.message}`)
      }
      throw new Error('Failed to create web call')
    }
  }

  // Keep the original method for phone calls if needed later
  async createCall(assistantId: string, phoneNumber?: string): Promise<any> {
    try {
      const callData = {
        assistantId,
        phoneNumber: phoneNumber, // Use phoneNumber instead of phoneNumberId
      }

      const response = await axios.post(
        `${this.baseUrl}/call`,
        callData,
        { headers: this.getHeaders() }
      )

      return response.data
    } catch (error: any) {
      console.error('Error creating VAPI call:', error)
      if (error.response) {
        throw new Error(`VAPI API Error: ${error.response.data?.message || error.message}`)
      }
      throw new Error('Failed to create call')
    }
  }

  async getCall(callId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/call/${callId}`,
        { headers: this.getHeaders() }
      )
      return response.data
    } catch (error: any) {
      console.error('Error fetching VAPI call:', error)
      if (error.response) {
        throw new Error(`VAPI API Error: ${error.response.data?.message || error.message}`)
      }
      throw new Error('Failed to fetch call details')
    }
  }

  async deleteAssistant(assistantId: string): Promise<void> {
    try {
      console.log('🗑️  Deleting VAPI assistant:', assistantId)
      
      await axios.delete(
        `${this.baseUrl}/assistant/${assistantId}`,
        { headers: this.getHeaders() }
      )
      
      console.log('✅ Assistant deleted successfully')
    } catch (error: any) {
      console.error('Error deleting VAPI assistant:', error)
      // Don't throw - deletion failures shouldn't break the flow
      if (error.response) {
        console.error('VAPI API Error Response:', error.response.data)
      }
    }
  }
}

export const vapiService = new VapiService()
