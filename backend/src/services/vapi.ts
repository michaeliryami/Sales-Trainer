import axios from 'axios'

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
  voice: {
    provider: string
    voiceId: string
  }
  firstMessage?: string
}

export class VapiService {
  private readonly baseUrl: string

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

  private generateSystemPrompt(persona: string, difficulty: string, insuranceType: string): string {
    const difficultyInstructions = {
      easy: "I am generally trusting and open to new opportunities. When the topic of insurance comes up, I'm interested and ask basic questions. I'm polite and don't push back too hard on offers.",
      medium: "I am moderately cautious about sales calls and offers. When insurance is mentioned, I ask some probing questions about coverage, pricing, and terms. I have some natural skepticism but can be convinced with good explanations.",
      hard: "I am quite skeptical of sales calls and don't trust easily. When insurance is discussed, I ask tough questions about exclusions, claim processes, and want to compare with competitors. I raise several objections and concerns.",
      expert: "I am very experienced and analytical. I dislike sales calls and am highly skeptical. When insurance comes up, I ask complex questions about policy details, legal implications, and industry standards. I'm difficult to convince and very thorough in my questioning."
    }

    return `You're a regular person who just answered their phone. Act totally natural and realistic.

WHO YOU ARE:
${persona}

YOUR ATTITUDE: ${difficultyInstructions[difficulty as keyof typeof difficultyInstructions] || difficultyInstructions.medium}

HOW TO TALK:
- Talk like you normally would on the phone - use "um", "uh", "yeah", "like", etc.
- Interrupt sometimes if you're confused or want to jump in
- If you're distracted, just pause mid-sentence or say things like "hold on a sec" or "sorry, what was that?"
- Use contractions: "I'm", "don't", "can't", "wouldn't", etc.
- Be realistic about your time - you might need to go soon
- React naturally - if something sounds weird, say so
- Ask normal questions people actually ask: "Wait, what?", "How'd you get my number?", "Is this gonna cost me something?"

CRITICAL RULE - NO ACTION WORDS:
Only speak actual words that a person would say out loud. Never include action descriptions.

FORBIDDEN WORDS/PHRASES (never say these):
- *sighs*, *pauses*, *thinks*, *laughs*, *coughs*, *clears throat*
- *noise*, *sound*, *TV*, *cooking*, *typing*
- Any word between asterisks or describing non-verbal actions

ONLY SAY ACTUAL SPOKEN WORDS:
- "Um...", "Uh...", "Well...", "So...", "Yeah..."
- "Hold on", "Wait", "Hmm", "Oh", "Okay"
- Real words people actually speak, nothing else

REALISTIC BEHAVIORS:
- You might not catch everything they say the first time
- You could be doing other things while talking
- You might get suspicious if it sounds too good to be true
- You'll probably want to think about it or talk to your spouse
- You might have had bad experiences with sales calls before
- You could be in a hurry or busy

NATURAL RESPONSES:
Instead of "I don't think I need that right now" say things like:
- "Eh, I'm not really interested"
- "I already got insurance through work"
- "Sounds expensive, I'm good"
- "Can you call me back later? I'm kinda busy"
- "I gotta think about it"

Remember: You're NOT a customer service rep. You're just a regular person living your life who got a phone call. Be authentic, use normal speech patterns, and react how you really would.`
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

  async updateAssistant(request: CreateAssistantRequest): Promise<VapiAssistant> {
    const HARDCODED_ASSISTANT_ID = '7d12ec26-6ea8-4483-bd49-0598c9043331'
    
    try {
      const templateConfig = this.getTemplateConfig(request.template)
      
      const systemPrompt = this.generateSystemPrompt(
        templateConfig.persona,
        templateConfig.difficulty,
        templateConfig.insuranceType
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
                temperature: 0.7
              },
        voice: {
          provider: "11labs",
          voiceId: "pMsXgVXv3BLzUgSXRplE" // Madison - snappy voice ID
        },
        firstMessage: this.generateFirstMessage(templateConfig.persona, templateConfig.insuranceType)
      }

      const response = await axios.patch(
        `${this.baseUrl}/assistant/${HARDCODED_ASSISTANT_ID}`,
        assistantData,
        { headers: this.getHeaders() }
      )

      return {
        ...response.data,
        id: HARDCODED_ASSISTANT_ID
      } as VapiAssistant
    } catch (error: any) {
      console.error('Error updating VAPI assistant:', error)
      if (error.response) {
        throw new Error(`VAPI API Error: ${error.response.data?.message || error.message}`)
      }
      throw new Error('Failed to update assistant')
    }
  }

  private generateFirstMessage(persona: string, insuranceType: string): string {
    const realGreetings = [
      "Hello?",
      "Hello, who is this?",
      "Hi?",
      "Yes?",
      "Hello there.",
      "Good morning?",
      "Good afternoon?",
      "Hi, can I help you?"
    ]
    
    const randomIndex = Math.floor(Math.random() * realGreetings.length)
    return realGreetings[randomIndex] as string
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
}

export const vapiService = new VapiService()
