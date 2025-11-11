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
}

export class VapiService {
  private readonly baseUrl: string
  
  // ElevenLabs voice IDs pool for random selection
  private readonly voiceIds = [
    'DHeSUVQvhhYeIxNUbtj3',
    'vgsapVXnlLvlrWNbPs6y',
    '0JRpJnrcyEVIabsZ4U5I',
    'oWAxZDx7w5VEj9dCyTzz',
    'Tw2LVqLUUWkxqrCfFOpw',
    '7wZG7UyB12X3ndKa4uqi',
    'nm1ZvXYfIcWIwMXCKoBV',
    'VQWIG7jHNSEv826utbm8',
    'uwjrUUgKbezCKJAv5nLd',
    'EP3g1wv2wIp7Hc96Sf4l',
    'ChvixV5Kt063KajV05qE',
    '5lm1mr2qVzTTtc8lNLgo',
    'jqVMajy0TkayOvIB8eCz'
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

  // Randomly select a voice ID from the pool
  private getRandomVoiceId(): string {
    const randomIndex = Math.floor(Math.random() * this.voiceIds.length)
    return this.voiceIds[randomIndex] as string
  }

  private generateSystemPromptFromTemplate(template: Template): string {
    const difficultyInstructions = {
      easy: "You are generally trusting and open to new opportunities. When the topic of insurance comes up, you're interested and ask basic questions. You're polite and don't push back too hard on offers.",
      medium: "You are moderately cautious about sales calls and offers. When insurance is mentioned, you ask some probing questions about coverage, pricing, and terms. You have some natural skepticism but can be convinced with good explanations.",
      hard: "You are quite skeptical of sales calls and don't trust easily. When insurance is discussed, you ask tough questions about exclusions, claim processes, and want to compare with competitors. You raise several objections and concerns.",
      expert: "You are very experienced and analytical. You dislike sales calls and are highly skeptical. When insurance comes up, you ask complex questions about policy details, legal implications, and industry standards. You're difficult to convince and very thorough in your questioning."
    }

    const difficultyInstruction = difficultyInstructions[template.difficulty as keyof typeof difficultyInstructions] || difficultyInstructions.medium

    return `CRITICAL RULES (ALWAYS OBEY THESE FIRST):
- NEVER output actions, emotions, or background descriptions such as *sighs*, *pauses*, *laughs*, *clears throat*, (thinking), [typing], etc.
- Do NOT describe sounds, movements, or emotions. Speak dialogue ONLY.
- Do NOT verbalize your realizations or thought processes out loud (e.g., "Oh, I see what you're saying," "That makes sense now," "I understand"). Real people work things out in their heads silently. Only speak when you have an actual question or response.
- If you want to sound hesitant, use normal filler words like "um," "uh," "I mean," or short pauses written as "…"
- Never say or spell the words "pause," "sigh," "laugh," or "silence."
- Your responses must sound like spoken dialogue from a real person, not a screenplay or text chat.

---

ROLE:
You are a real person (the CUSTOMER) who just answered a phone call from a life insurance agent.

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

REFERENCE SCRIPT (sample flow for tone and context):
${template.script}

---

BEHAVIOR GUIDELINES:
- When the call begins, respond naturally with "Hello?" or "Who is this?"
- Let the salesperson introduce themselves and explain the reason for the call.
- Stay engaged but realistic — you might be polite, mildly distracted, or uncertain.
- Ask reasonable questions ("What kind of coverage is this?" "Is this going to raise my premiums?").
- Do NOT abruptly reject the call or hang up unless the salesperson is rude or incoherent.
- If you're unsure, ask for clarification or say "Yeah, I remember filling that out."

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
Simulate a natural, believable customer conversation for an insurance sales training call — no acting, no narration, no text-based behavior. Speak as though this is a real call happening right now.`
  }

  private generateSystemPrompt(persona: string, difficulty: string, insuranceType: string, script?: string): string {
    const difficultyInstructions = {
      easy: "I am generally trusting and open to new opportunities. When the topic of insurance comes up, I'm interested and ask basic questions. I'm polite and don't push back too hard on offers.",
      medium: "I am moderately cautious about sales calls and offers. When insurance is mentioned, I ask some probing questions about coverage, pricing, and terms. I have some natural skepticism but can be convinced with good explanations.",
      hard: "I am quite skeptical of sales calls and don't trust easily. When insurance is discussed, I ask tough questions about exclusions, claim processes, and want to compare with competitors. I raise several objections and concerns.",
      expert: "I am very experienced and analytical. I dislike sales calls and am highly skeptical. When insurance comes up, I ask complex questions about policy details, legal implications, and industry standards. I'm difficult to convince and very thorough in my questioning."
    }

    if (!script) {
      return `You are a ${persona.toLowerCase()}.

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

    return `You are a ${persona.toLowerCase()} who just answered the phone. Talk like a REAL person, not a polished customer service rep.

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
      
      const systemPrompt = this.generateSystemPromptFromTemplate(template)
      
      console.log('✅ System prompt generated:', {
        promptLength: systemPrompt.length,
        includesScript: systemPrompt.includes('REFERENCE SCRIPT')
      })

      const selectedVoiceId = this.getRandomVoiceId()
      
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
          voiceId: selectedVoiceId
        },
        firstMessage: this.generateFirstMessage('customer', template.type)
      }

      // Create a NEW assistant instead of updating the hardcoded one
      const response = await axios.post(
        `${this.baseUrl}/assistant`,
        assistantData,
        { headers: this.getHeaders() }
      )

      console.log('✅ New assistant created with ID:', (response.data as any)?.id, '| Voice:', selectedVoiceId)

      return response.data as VapiAssistant
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
      
      const script = this.getTemplateScript(request.template)
      const systemPrompt = this.generateSystemPrompt(
        templateConfig.persona,
        templateConfig.difficulty,
        templateConfig.insuranceType,
        script
      )

      const selectedVoiceId = this.getRandomVoiceId()
      
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
          voiceId: selectedVoiceId
        },
        firstMessage: this.generateFirstMessage(templateConfig.persona, templateConfig.insuranceType)
      }

      // Create a NEW assistant instead of updating the hardcoded one
      const response = await axios.post(
        `${this.baseUrl}/assistant`,
        assistantData,
        { headers: this.getHeaders() }
      )

      console.log('✅ New assistant created with ID:', (response.data as any)?.id, '| Voice:', selectedVoiceId)

      return response.data as VapiAssistant
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
