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

    // Create the prompt for script generation
    const prompt = `Generate a professional sales training script for insurance sales practice. 

**Context:**
- Template Title: ${title}
- Description: ${description}
- Insurance Type: ${insuranceType}
- Difficulty Level: ${difficulty}

**Requirements:**
1. Create a realistic sales conversation between a Seller (insurance agent) and a Buyer (potential customer)
2. Use proper markdown formatting:
   - # for the main title
   - ## for major sections (Opening, Introduction, Needs Assessment, Objection Handling, Closing)
   - **Bold text** for emphasis on key points
   - Clear "Seller:" and "Buyer:" labels for all dialogue
3. Make the conversation flow naturally and include realistic objections based on the difficulty level
4. Include specific insurance terminology relevant to ${insuranceType} insurance
5. The script should be appropriate for ${difficulty} difficulty training
6. Include 8-12 exchanges between Seller and Buyer
7. End with a clear call to action or next steps

**Difficulty Guidelines:**
- Easy: Customer is interested, minimal objections
- Medium: Some hesitation and common objections
- Hard: Multiple objections, skeptical customer
- Expert: Complex objections, sophisticated customer

Generate a complete, realistic training script following these guidelines.`

    console.log('Generating AI script for:', { title, insuranceType, difficulty })

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert insurance sales trainer who creates realistic, professional training scripts for sales representatives. Your scripts should be engaging, educational, and include proper objection handling techniques."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
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
