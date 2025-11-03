import { Router } from 'express'
import OpenAI from 'openai'

const router = Router()

interface GenerateScriptRequest {
  title: string
  description: string
  insuranceType: string
  difficulty: string
}

// Generate script using AI
router.post('/generate-script', async (req, res): Promise<void> => {
  try {
    const { title, description, insuranceType, difficulty }: GenerateScriptRequest = req.body

    // Validate required fields
    if (!title || !description || !insuranceType || !difficulty) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'description', 'insuranceType', 'difficulty']
      })
      return
    }

    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({
        error: 'OpenAI API key not configured'
      })
      return
    }

    // Initialize OpenAI client with the API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    // Create the prompt for script generation based on professional life insurance sales methodology
    const prompt = `Generate a comprehensive life insurance sales training persona script for: "${title}"

**Persona Description:** ${description}
**Difficulty Level:** ${difficulty}

**CRITICAL: Follow this exact structure and methodology from professional life insurance sales:**

## Required Script Sections:

### 1. Profile
- Age range, family situation, occupation
- Background & motivations
- Why they filled out the form
- What they're actually trying to accomplish

### 2. Personality & Tone
- How they communicate (warm/defensive/analytical/apathetic)
- Energy level and engagement style
- Emotional drivers

### 3. Opening Response (How They'll Answer)
Provide specific responses to:
- "How's your day going?"
- "I was calling about that form you submitted regarding Insurance Plans"
- Age/DOB confirmation

### 4. Foundation Questions - Expected Responses
Detail how they'll respond to these EXACT questions:
- "What is your main goal with getting life insurance?"
- "Are you just trying to make sure that your funeral/final expenses are taken care of? Or were you looking to leave some money behind for any loved ones?"
- "God forbid, if something were to happen to you, who would be affected by the death financially?"
- "If something happened to you yesterday, walk me through what it would look like for [beneficiary]. Would it be a struggle financially?"
- "Have you ever had to deal with a death in the family before? Did they have life insurance? What did that look like financially?"

### 5. Objection Patterns (3-7 based on difficulty)
List specific objections they'll raise with recommended response strategies:
- Price concerns
- Trust issues  
- "I need to think about it"
- "Let me talk to my spouse"
- Product skepticism

### 6. Medical Review - Expected Answers
- Typical health status for this persona
- Common medications
- Smoking status
- How they'll respond to medical questions

### 7. Product Presentation - What Resonates
How they'll react to:
- **Living Benefits** (access to cash value for illness/emergency)
- **Cash Value Growth** (4.8% interest vs 0% checking, 0.02% savings)
- **Level Premiums** (never increase)
- **Guaranteed Payout** (24-48 hours, tax-free, no waiting period)

### 8. Coverage Options Response
How they'll react to Gold/Silver/Bronze options:
- **Gold**: Maximum coverage (e.g., $250k-$500k)
- **Silver**: State-recommended amount (e.g., $100k-$250k) 
- **Bronze**: Minimum viable coverage (e.g., $50k-$100k)

Which will they likely choose and why?

### 9. Application Process - Likely Reactions
- How cooperative are they?
- Reaction to providing social security number
- Bank account information comfort level
- Draft date preferences

### 10. Hot Buttons to Hit
3-5 emotional or logical triggers that will resonate:
- Family protection
- Procrastination consequences
- Age/health timing
- Peace of mind
- Financial burden on loved ones

### 11. Closing Indicators
Signs they're ready to move forward:
- Questions they ask
- Tone shifts
- Specific behaviors

### 12. Final Solidification Strategy
- What to have them write down
- Policy password selection
- Affordability confirmation approach

### 13. Referral Opportunity
- Success rate (high/moderate/low)
- Best approach for asking
- Who they're likely to refer

**Difficulty Calibration:**
- Easy: Cooperative, emotionally bought-in, minor hesitations only
- Medium: Some genuine objections, needs value building, moderate skepticism
- Hard: Multiple strong objections, defensive, needs persistent handling
- Expert: Sophisticated objections, highly analytical, tests your knowledge

Use professional sales language. Include specific dollar amounts, realistic dialogue examples, and tactical advice for handling this persona. Format in clean markdown with proper headers.`

    console.log('Generating AI script for:', { title, insuranceType, difficulty })

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert life insurance sales trainer who creates comprehensive persona profiles for sales training. You base your training on proven life insurance sales methodologies including foundation questions, objection handling, living benefits explanation, Gold/Silver/Bronze option presentation, and complete application processes. Your personas are realistic, detailed, and provide specific guidance on how to handle each type of prospect throughout the entire sales cycle from introduction through solidification and referral."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3500,
      temperature: 0.8
    })

    const generatedScript = completion.choices[0]?.message?.content

    if (!generatedScript) {
      res.status(500).json({
        error: 'Failed to generate script content'
      })
      return
    }

    console.log('AI script generated successfully')

    res.json({
      success: true,
      script: generatedScript,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0
      }
    })

  } catch (error) {
    console.error('Error generating AI script:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      res.status(500).json({
        error: 'OpenAI API key invalid or missing',
        message: 'Please check your OpenAI API key configuration'
      })
      return
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

export default router
