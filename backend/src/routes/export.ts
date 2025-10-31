import express from 'express'
import OpenAI from 'openai'
import { jsPDF } from 'jspdf'
import { supabase } from '../config/supabase'

const router = express.Router()

interface TranscriptChunk {
  speaker: string
  text: string
  timestamp: Date
  messageId?: string
  confidence?: number
  duration?: number
}

interface ExportData {
  callId: string | null
  templateTitle: string
  templateDescription: string
  startTime: Date
  endTime: Date
  duration: number
  chunks: TranscriptChunk[]
  script: string
  // User and organization
  userId?: string
  orgId?: number
  templateId?: number
  // Assignment-related fields
  assignmentId?: number
  assignmentTitle?: string
  rubricId?: number
  rubricTitle?: string
  rubricCriteria?: Array<{
    title: string
    description: string
    maxPoints: number
  }>
}

// Grade transcript against rubric criteria using LLM
async function gradeTranscriptWithRubric(exportData: ExportData, cleanedTranscript: string): Promise<{
  totalScore: number
  maxPossibleScore: number
  criteriaGrades: Array<{
    title: string
    description: string
    maxPoints: number
    earnedPoints: number
    evidence: string[]
    reasoning: string
  }>
}> {
  if (!exportData.rubricCriteria || exportData.rubricCriteria.length === 0) {
    return {
      totalScore: 0,
      maxPossibleScore: 0,
      criteriaGrades: []
    }
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const rubricText = exportData.rubricCriteria.map(criteria => 
      `- ${criteria.title}: ${criteria.description} (Max: ${criteria.maxPoints} points)`
    ).join('\n')

    const prompt = `
You are an expert sales training evaluator. Analyze this sales conversation transcript against the provided rubric criteria and provide detailed grading.

RUBRIC CRITERIA:
${rubricText}

CONVERSATION TRANSCRIPT:
${cleanedTranscript}

INSTRUCTIONS:
1. For each rubric criterion, analyze the salesperson's performance
2. Award points based on evidence found in the transcript
3. Provide specific quotes/examples from the transcript as evidence
4. Give detailed reasoning for each grade
5. Be strict and fair - only award points for demonstrated skills
6. If a criterion is not addressed, award 0 points

RESPONSE FORMAT (JSON):
{
  "totalScore": number,
  "maxPossibleScore": number,
  "criteriaGrades": [
    {
      "title": "string",
      "description": "string", 
      "maxPoints": number,
      "earnedPoints": number,
      "evidence": ["specific quote 1", "specific quote 2"],
      "reasoning": "detailed explanation of why this grade was given"
    }
  ]
}

Only return the JSON response, nothing else.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert sales training evaluator. Analyze sales conversations against rubric criteria and provide detailed, evidence-based grading."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No grading response received')
    }

    // Parse the JSON response
    const gradingResult = JSON.parse(response)
    return gradingResult

  } catch (error) {
    console.error('Error grading transcript with rubric:', error)
    // Return default grading if LLM fails
    return {
      totalScore: 0,
      maxPossibleScore: exportData.rubricCriteria.reduce((sum, criteria) => sum + criteria.maxPoints, 0),
      criteriaGrades: exportData.rubricCriteria.map(criteria => ({
        title: criteria.title,
        description: criteria.description,
        maxPoints: criteria.maxPoints,
        earnedPoints: 0,
        evidence: [],
        reasoning: "Unable to evaluate due to technical error"
      }))
    }
  }
}

// Clean up transcript with LLM to remove duplicates and create natural conversation flow
async function cleanTranscriptWithLLM(exportData: ExportData): Promise<string> {
  try {
    // Initialize OpenAI client only when needed
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const rawTranscript = exportData.chunks.map(chunk => `${chunk.speaker}: ${chunk.text}`).join('\n')

    const prompt = `
Please clean up this raw conversation transcript by removing duplicates, merging overlapping text, and creating one natural conversation flow.

Raw transcript:
${rawTranscript}

Instructions:
1. Remove duplicate lines and repeated phrases
2. Merge overlapping or fragmented sentences into complete thoughts
3. Keep the natural conversation flow between "You" and "AI Customer"
4. Remove timestamps and unnecessary repetition
5. Present as a clean, readable conversation
6. Keep all the actual content, just clean up the formatting and duplicates

Format the output as:
You: [clean message]
AI Customer: [clean message]
You: [clean message]
etc.

Only return the cleaned conversation, nothing else.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a transcript editor. Clean up conversations by removing duplicates and creating natural flow while preserving all actual content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    })

    return completion.choices[0]?.message?.content || "Could not clean transcript."
  } catch (error) {
    console.error('Error cleaning transcript with LLM:', error)
    return exportData.chunks.map(chunk => `${chunk.speaker}: ${chunk.text}`).join('\n')
  }
}

// Export transcript as PDF
router.post('/transcript-pdf', async (req, res) => {
  try {
    const exportData: ExportData = req.body

    if (!exportData.chunks || exportData.chunks.length === 0) {
      return res.status(400).json({ error: 'No transcript data provided' })
    }

    // Convert string dates to Date objects
    exportData.startTime = new Date(exportData.startTime)
    exportData.endTime = new Date(exportData.endTime)
    exportData.chunks = exportData.chunks.map(chunk => ({
      ...chunk,
      timestamp: new Date(chunk.timestamp)
    }))

    console.log(`Processing transcript export for ${exportData.chunks.length} chunks`)

    // Clean the transcript with LLM first
    const cleanedTranscript = await cleanTranscriptWithLLM(exportData)
    
    // Use rubricCriteria if passed in (from analytics page), otherwise fetch from DB
    let gradingResult = null
    
    if (exportData.rubricCriteria && exportData.rubricCriteria.length > 0) {
      // Calculate totals from the passed criteria
      const totalScore = exportData.rubricCriteria.reduce((sum: number, c: any) => sum + (c.earnedPoints || 0), 0)
      const maxPossibleScore = exportData.rubricCriteria.reduce((sum: number, c: any) => sum + (c.maxPoints || 0), 0)
      
      console.log('Using rubric criteria passed from frontend:', { totalScore, maxPossibleScore, criteriaCount: exportData.rubricCriteria.length })
      gradingResult = {
        totalScore,
        maxPossibleScore,
        criteriaGrades: exportData.rubricCriteria
      }
    } else if (exportData.assignmentId && exportData.userId) {
      try {
        // Try to find existing session and grade
        const { data: sessions } = await supabase
          .from('training_sessions')
          .select('id')
          .eq('user_id', exportData.userId)
          .eq('assignment_id', exportData.assignmentId)
          .eq('call_id', exportData.callId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (sessions && sessions.length > 0) {
          const sessionId = sessions[0]?.id
          console.log('Found existing session:', sessionId)

          // Fetch existing grade
          const { data: grades } = await supabase
            .from('session_grades')
            .select('*')
            .eq('session_id', sessionId)
            .single()

          if (grades) {
            console.log('Found existing grade from DB, using it for PDF')
            gradingResult = {
              totalScore: grades.total_score,
              maxPossibleScore: grades.max_possible_score,
              criteriaGrades: grades.criteria_grades
            }
          }
        }
      } catch (error) {
        console.error('Error fetching existing grade:', error)
      }
    }

    // Create PDF using jsPDF - Clean conversation transcript
    const doc = new jsPDF()
    
    // Set font
    doc.setFont('helvetica')
    
    // Title
    doc.setFontSize(18)
    doc.text('Call Transcript', 20, 30)
    
    // Basic session info
    doc.setFontSize(10)
    let yPos = 45
    doc.text(`Template: ${exportData.templateTitle}`, 20, yPos)
    yPos += 8
    doc.text(`Date: ${exportData.startTime.toLocaleDateString()} | Duration: ${Math.floor(exportData.duration / 60)}m ${exportData.duration % 60}s`, 20, yPos)
    
    // Add assignment info if this is an assignment
    if (exportData.assignmentId && exportData.assignmentTitle) {
      yPos += 8
      doc.text(`Assignment: ${exportData.assignmentTitle}`, 20, yPos)
    }
    
    yPos += 20

    // Clean conversation transcript
    doc.setFontSize(12)
    doc.text('Conversation', 20, yPos)
    yPos += 15
    
    doc.setFontSize(10)
    
    // Split the cleaned transcript into lines and format
    const conversationLines = cleanedTranscript.split('\n').filter(line => line.trim() !== '')
    
    for (const line of conversationLines) {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      
      // Check if line starts with speaker name
      if (line.startsWith('You:') || line.startsWith('AI Customer:')) {
        const [speaker, ...messageParts] = line.split(':')
        const message = messageParts.join(':').trim()
        
        // Speaker name in bold
        doc.setFont('helvetica', 'bold')
        doc.text(`${speaker}:`, 20, yPos)
        yPos += 7
        
        // Message text
        doc.setFont('helvetica', 'normal')
        const splitText = doc.splitTextToSize(message, 170)
        doc.text(splitText, 25, yPos)
        yPos += splitText.length * 5 + 8
      } else {
        // Handle any other formatting
        const splitText = doc.splitTextToSize(line, 170)
        doc.text(splitText, 20, yPos)
        yPos += splitText.length * 5 + 5
      }
    }
    
    // Add grading report if this is an assignment with rubric
    if (gradingResult && exportData.assignmentId) {
      // Add new page for grading report
      doc.addPage()
      yPos = 20
      
      // Grading Report Title
      doc.setFontSize(16)
      doc.text('Grading Report', 20, yPos)
      yPos += 20
      
      // Overall Score
      doc.setFontSize(12)
      doc.text(`Overall Score: ${gradingResult.totalScore}/${gradingResult.maxPossibleScore} (${Math.round((gradingResult.totalScore / gradingResult.maxPossibleScore) * 100)}%)`, 20, yPos)
      yPos += 15
      
      // Individual Criteria Grades
      doc.setFontSize(14)
      doc.text('Detailed Evaluation:', 20, yPos)
      yPos += 15
      
      doc.setFontSize(10)
      
      for (const criteria of gradingResult.criteriaGrades) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }
        
        // Criteria title and score
        doc.setFont('helvetica', 'bold')
        doc.text(`${criteria.title}: ${criteria.earnedPoints}/${criteria.maxPoints} points`, 20, yPos)
        yPos += 8
        
        // Criteria description
        doc.setFont('helvetica', 'normal')
        const descriptionLines = doc.splitTextToSize(`Description: ${criteria.description}`, 170)
        doc.text(descriptionLines, 20, yPos)
        yPos += descriptionLines.length * 5 + 5
        
        // Evidence from transcript
        if (criteria.evidence && criteria.evidence.length > 0) {
          doc.setFont('helvetica', 'bold')
          doc.text('Evidence from transcript:', 20, yPos)
          yPos += 8
          
          doc.setFont('helvetica', 'normal')
          for (const evidence of criteria.evidence) {
            const evidenceLines = doc.splitTextToSize(`• "${evidence}"`, 160)
            doc.text(evidenceLines, 25, yPos)
            yPos += evidenceLines.length * 5 + 3
          }
        }
        
        // Reasoning
        doc.setFont('helvetica', 'bold')
        doc.text('Evaluation reasoning:', 20, yPos)
        yPos += 8
        
        doc.setFont('helvetica', 'normal')
        const reasoningLines = doc.splitTextToSize(criteria.reasoning, 170)
        doc.text(reasoningLines, 20, yPos)
        yPos += reasoningLines.length * 5 + 10
      }
    }
    
    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Set response headers for PDF download
    const filename = `training-session-${exportData.templateTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', pdfBuffer.length)

    return res.send(pdfBuffer)

  } catch (error) {
    console.error('Error exporting transcript to PDF:', error)
    return res.status(500).json({ 
      error: 'Failed to export transcript',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router