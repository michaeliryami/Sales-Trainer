import express from 'express'
import { supabase } from '../config/supabase'
import { getTemplateName } from '../config/builtInTemplates'

const router = express.Router()

// GET /api/analytics/admin/:orgId - Get admin analytics for organization
router.get('/admin/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params
    const { period = '7d' } = req.query

    console.log(`Fetching admin analytics for org ${orgId}, period: ${period}`)

    // Calculate date range
    const startDate = new Date()
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        startDate.setFullYear(2000) // All time
    }

    // Get total sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('org_id', orgId)
      .gte('created_at', startDate.toISOString())

    if (sessionsError) throw sessionsError

    // Get session grades
    const { data: grades, error: gradesError } = await supabase
      .from('session_grades')
      .select('*')
      .gte('created_at', startDate.toISOString())

    if (gradesError) throw gradesError

    // Get user performance metrics for this org
    const { data: userMetrics, error: metricsError } = await supabase
      .from('user_performance_metrics')
      .select('*')
      .eq('org_id', orgId)

    if (metricsError) throw metricsError

    // Calculate stats (includes both assignment and playground sessions for usage metrics)
    const totalSessions = sessions?.length || 0
    const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0
    const activeUsers = new Set(sessions?.map(s => s.user_id)).size
    
    // Track assignment-only sessions for detailed performance metrics
    const assignmentSessions = sessions?.filter(s => s.assignment_id !== null) || []
    const playgroundSessionsCount = totalSessions - assignmentSessions.length
    const avgDuration = sessions && sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length / 60
      : 0
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
    
    // Calculate average score
    const avgScore = grades && grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length
      : 0

    // Get recent sessions with user and template details
    // For admin: Only show SUBMITTED assignment sessions (not playground or unsubmitted)
    const recentSessionsData = sessions
      ?.filter(s => s.assignment_id !== null && s.submitted_for_review === true) // Only submitted assignments
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10) || []

    // Get profiles for user names - include all users from sessions AND userMetrics
    const recentSessionUserIds = recentSessionsData.map(s => s.user_id)
    const metricsUserIds = userMetrics?.map(m => m.user_id) || []
    const allUserIds = [...new Set([...recentSessionUserIds, ...metricsUserIds])]
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('id', allUserIds)

    // Get templates for recent sessions
    const { data: templates } = await supabase
      .from('templates')
      .select('id, title')

    const recentSessions = recentSessionsData.map(session => {
      const profile = profiles?.find(p => p.id === session.user_id)
      const template = templates?.find(t => t.id === session.template_id)
      const grade = grades?.find(g => g.session_id === session.id)
      
      // Get template name - check database first, then metadata for built-in templates
      let templateName = template?.title
      if (!templateName && session.metadata?.builtInTemplateTitle) {
        // Built-in template stored in metadata (template_id is null due to FK constraint)
        templateName = session.metadata.builtInTemplateTitle
      }
      if (!templateName) {
        templateName = 'Unknown Template'
      }
      
      return {
        id: session.id,
        userId: session.user_id,
        assignmentId: session.assignment_id,
        user: profile?.display_name || profile?.email || 'Unknown User',
        template: templateName,
        duration: session.duration_seconds ? `${Math.round(session.duration_seconds / 60)}m` : 'N/A',
        score: grade ? Math.round(grade.percentage) : null,
        date: session.created_at,
        status: session.status,
        pdfUrl: session.pdf_url,
        hasGrade: !!grade,
        sessionType: session.session_type
      }
    })

    // Top performers
    const topPerformers = userMetrics
      ?.sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0))
      .slice(0, 5)
      .map(metric => {
        const profile = profiles?.find(p => p.id === metric.user_id)
        return {
          userId: metric.user_id,
          name: profile?.display_name || profile?.email || 'Unknown User',
          avgScore: Math.round(metric.avg_score || 0),
          completedSessions: metric.completed_sessions || 0,
          streak: metric.current_streak_days || 0
        }
      })

    // Weekly trends (last 7 days)
    const weeklyTrends = {
      sessions: new Array(7).fill(0),
      completion: new Array(7).fill(0)
    }

    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const daySessions = sessions?.filter(s => {
        const sessionDate = new Date(s.created_at)
        return sessionDate >= dayStart && sessionDate <= dayEnd
      }) || []

      weeklyTrends.sessions[i] = daySessions.length
      const dayCompleted = daySessions.filter(s => s.status === 'completed').length
      weeklyTrends.completion[i] = daySessions.length > 0
        ? Math.round((dayCompleted / daySessions.length) * 100)
        : 0
    }

    const analyticsData = {
      totalSessions: Math.round(totalSessions),
      assignmentSessions: assignmentSessions.length,
      playgroundSessions: playgroundSessionsCount,
      totalUsers: activeUsers,
      avgSessionDuration: parseFloat(avgDuration.toFixed(1)),
      completionRate: parseFloat(completionRate.toFixed(1)),
      avgScore: parseFloat(avgScore.toFixed(1)),
      recentSessions,
      topPerformers: topPerformers || [],
      weeklyTrends
    }

    return res.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error('Error fetching admin analytics:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/analytics/employee/:userId - Get employee-specific analytics
router.get('/employee/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { period = '30d' } = req.query

    console.log(`Fetching employee analytics for user ${userId}, period: ${period}`)

    // Calculate date range
    const startDate = new Date()
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        startDate.setFullYear(2000) // All time
    }

    // Get user's sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    if (sessionsError) throw sessionsError

    // Get user's grades
    const { data: grades, error: gradesError } = await supabase
      .from('session_grades')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    if (gradesError) throw gradesError

    // Get user performance metrics
    const { data: userMetrics, error: metricsError } = await supabase
      .from('user_performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (metricsError && metricsError.code !== 'PGRST116') { // Ignore "not found" error
      throw metricsError
    }

    // Get user's assignments
    const { data: assignments } = await supabase
      .from('assignments')
      .select('*')

    const userAssignments = assignments?.filter(a => {
      try {
        const assigned = JSON.parse(a.assigned || '[]')
        return assigned.includes(userId)
      } catch {
        return false
      }
    })

    // Calculate stats
    const totalSessions = sessions?.length || 0
    const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0
    const avgDuration = sessions && sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length / 60
      : 0
    
    // Score stats
    const scores = grades?.map(g => g.percentage || 0) || []
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

    // Assignment progress - only count assignment sessions (not playground)
    const assignmentSessionIds = sessions?.filter(s => s.assignment_id !== null).map(s => s.id) || []
    const assignmentsCompleted = grades?.filter(g => assignmentSessionIds.includes(g.session_id)).length || 0
    const assignmentsPending = (userAssignments?.length || 0) - assignmentsCompleted

    // Get recent sessions with details
    const { data: templates } = await supabase
      .from('templates')
      .select('id, title')

    console.log(`📊 Found ${grades?.length || 0} total grades for user`)
    console.log(`📋 Processing ${sessions?.length || 0} total sessions`)
    
    const recentSessions = (sessions || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(session => {
        const grade = grades?.find(g => g.session_id === session.id)
        const isPlayground = !session.assignment_id // Playground if no assignment
        
        if (isPlayground) {
          console.log(`🎮 Playground session ${session.id}:`, {
            hasGrade: !!grade,
            gradeId: grade?.id,
            percentage: grade?.percentage,
            totalScore: grade?.total_score,
            maxScore: grade?.max_possible_score
          })
        }
        
        // Get template name - check database first, then metadata for built-in templates
        let templateName: string | null = null
        
        if (session.template_id) {
          const template = templates?.find(t => t.id === session.template_id)
          templateName = template?.title || null
        }
        
        if (!templateName && session.metadata?.builtInTemplateTitle) {
          // Built-in template stored in metadata (template_id is null due to FK constraint)
          templateName = session.metadata.builtInTemplateTitle
        }
        
        if (!templateName) {
          templateName = 'Unknown Template'
        }
        
        return {
          id: session.id,
          template: templateName,
          templateId: session.template_id || session.metadata?.builtInTemplateId || null,
          duration: session.duration_seconds ? `${Math.round(session.duration_seconds / 60)}m` : 'N/A',
          score: grade ? Math.round(grade.percentage) : null,
          date: session.created_at,
          status: session.status,
          type: session.session_type,
          pdfUrl: session.pdf_url,
          hasGrade: !!grade,
          isPlayground: isPlayground
        }
      })

    // Score trend over time
    const scoreTrend = grades
      ?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(g => ({
        date: g.created_at,
        score: Math.round(g.percentage || 0)
      })) || []

    // Skills breakdown (from criteria grades)
    const skillsBreakdown: any = {}
    grades?.forEach(grade => {
      if (grade.criteria_grades) {
        const criteria = Array.isArray(grade.criteria_grades) 
          ? grade.criteria_grades 
          : []
        
        criteria.forEach((c: any) => {
          if (!skillsBreakdown[c.title]) {
            skillsBreakdown[c.title] = { scores: [], total: 0, count: 0 }
          }
          const percentage = (c.earnedPoints / c.maxPoints) * 100
          skillsBreakdown[c.title].scores.push(percentage)
          skillsBreakdown[c.title].total += percentage
          skillsBreakdown[c.title].count++
        })
      }
    })

    const skills = Object.entries(skillsBreakdown).map(([skill, data]: [string, any]) => ({
      skill,
      avgScore: Math.round(data.total / data.count),
      sessions: data.count
    })).sort((a, b) => b.avgScore - a.avgScore)

    // Group playground sessions by template
    const playgroundSessionsByTemplate: any = {}
    sessions?.forEach(session => {
      if (!session.assignment_id) { // Playground session
        // Get template name - check database first, then metadata for built-in templates
        let templateName: string | null = null
        
        if (session.template_id) {
          const template = templates?.find(t => t.id === session.template_id)
          templateName = template?.title || null
        }
        
        if (!templateName && session.metadata?.builtInTemplateTitle) {
          // Built-in template stored in metadata (template_id is null due to FK constraint)
          templateName = session.metadata.builtInTemplateTitle
        }
        
        if (!templateName) {
          templateName = 'Unknown Template'
        }
        
        const grade = grades?.find(g => g.session_id === session.id)
        
        if (!playgroundSessionsByTemplate[templateName]) {
          playgroundSessionsByTemplate[templateName] = {
            templateName,
            templateId: session.template_id || session.metadata?.builtInTemplateId || null,
            count: 0,
            scores: [],
            avgScore: 0,
            lastPlayed: session.created_at
          }
        }
        
        playgroundSessionsByTemplate[templateName].count++
        if (grade) {
          playgroundSessionsByTemplate[templateName].scores.push(grade.percentage)
        }
        
        // Update last played if this session is more recent
        if (new Date(session.created_at) > new Date(playgroundSessionsByTemplate[templateName].lastPlayed)) {
          playgroundSessionsByTemplate[templateName].lastPlayed = session.created_at
        }
      }
    })

    // Calculate average scores for each template
    const playgroundStats = Object.values(playgroundSessionsByTemplate).map((stat: any) => ({
      ...stat,
      avgScore: stat.scores.length > 0 
        ? Math.round(stat.scores.reduce((a: number, b: number) => a + b, 0) / stat.scores.length)
        : null
    })).sort((a: any, b: any) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())

    const analyticsData = {
      // Overview Stats
      totalSessions,
      completedSessions,
      avgDuration: parseFloat(avgDuration.toFixed(1)),
      avgScore: parseFloat(avgScore.toFixed(1)),
      highestScore: parseFloat(highestScore.toFixed(1)),
      lowestScore: parseFloat(lowestScore.toFixed(1)),
      
      // Assignment Progress
      assignmentsCompleted,
      assignmentsPending,
      totalAssignments: userAssignments?.length || 0,
      
      // Streak
      currentStreak: userMetrics?.current_streak_days || 0,
      longestStreak: userMetrics?.longest_streak_days || 0,
      lastSessionDate: userMetrics?.last_session_date,
      
      // Detailed Data
      recentSessions,
      scoreTrend,
      skills,
      playgroundStats, // Practice sessions grouped by template
      
      // Performance Metrics
      improvementRate: scoreTrend.length >= 2 
        ? (scoreTrend[scoreTrend.length - 1]?.score || 0) - (scoreTrend[0]?.score || 0)
        : 0
    }

    return res.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error('Error fetching employee analytics:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/analytics/session - Save training session data
router.post('/session', async (req, res) => {
  try {
    const {
      userId,
      orgId,
      sessionType,
      templateId,
      assignmentId,
      callId,
      vapiCallId,
      startTime,
      endTime,
      durationSeconds,
      transcript,
      transcriptClean,
      status,
      metadata
    } = req.body

    console.log('Saving training session:', {
      userId,
      sessionType,
      templateId,
      assignmentId,
      status,
      transcriptLength: transcript?.length || 0,
      transcriptCleanLength: transcriptClean?.length || 0
    })

    // Insert session (don't include status if not provided - let DB handle default)
    const sessionInsert: any = {
      user_id: userId,
      org_id: orgId,
      session_type: sessionType,
      template_id: templateId,
      assignment_id: assignmentId,
      call_id: callId,
      vapi_call_id: vapiCallId,
      start_time: startTime,
      end_time: endTime,
      duration_seconds: durationSeconds,
      transcript: transcript,
      transcript_clean: transcriptClean,
      // Don't run LLM here - will run on first view (lazy load)
      metadata: metadata || {}
    }

    // Only add status if provided (otherwise let DB use default)
    if (status) {
      sessionInsert.status = status
    }

    const { data: session, error: sessionError } = await supabase
      .from('training_sessions')
      .insert([sessionInsert])
      .select()
      .single()

    if (sessionError) throw sessionError

    return res.json({
      success: true,
      data: session,
      message: 'Training session saved successfully'
    })

  } catch (error) {
    console.error('Error saving training session:', error)
    console.error('Full error details:', JSON.stringify(error, null, 2))
    return res.status(500).json({
      success: false,
      error: 'Failed to save training session',
      details: error instanceof Error ? error.message : 'Unknown error',
      fullError: error
    })
  }
})

// POST /api/analytics/grade-transcript - Grade transcript with AI and save
// Supports both assignment sessions (assignmentId provided) and playground sessions (assignmentId = null)
router.post('/grade-transcript', async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      assignmentId, // Can be null for playground practice sessions
      rubricId,
      rubricCriteria,
      transcript
    } = req.body

    console.log('Grading transcript for session:', sessionId, assignmentId ? `(Assignment ${assignmentId})` : '(Playground Practice)')
    console.log('Transcript length (characters):', transcript?.length || 0)
    console.log('Estimated tokens (rough):', Math.ceil((transcript?.length || 0) / 4))

    // Import OpenAI for grading
    const OpenAI = require('openai')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    // Create rubric text
    const rubricText = rubricCriteria.map((criteria: any) => 
      `- ${criteria.title}: ${criteria.description} (Max: ${criteria.maxPoints} points)`
    ).join('\n')

    // For very long transcripts, we need to truncate to fit within token limits
    // GPT-4o-mini has 128k context, but we need room for prompt + response
    // Rough estimate: 4 chars = 1 token, so ~100k tokens = 400k chars
    const MAX_TRANSCRIPT_CHARS = 200000 // ~50k tokens, leaving room for rubric and response
    let processedTranscript = transcript
    let wasTruncated = false
    
    if (transcript && transcript.length > MAX_TRANSCRIPT_CHARS) {
      console.warn(`⚠️ Transcript too long (${transcript.length} chars), truncating to ${MAX_TRANSCRIPT_CHARS}`)
      processedTranscript = transcript.substring(0, MAX_TRANSCRIPT_CHARS) + '\n\n[TRANSCRIPT TRUNCATED DUE TO LENGTH - Grading based on first portion of call]'
      wasTruncated = true
    }

    // Grade with AI
    const prompt = `
You are a supportive sales training evaluator. Analyze this sales conversation transcript against the provided rubric criteria and provide CONSTRUCTIVE, ENCOURAGING grading.

RUBRIC CRITERIA:
${rubricText}

CONVERSATION TRANSCRIPT:
${processedTranscript}

GRADING PHILOSOPHY:
- These are TRAINEES who are LEARNING and PRACTICING - not seasoned professionals
- Award points generously for effort, attempts, and partial demonstrations of skills
- Give credit for the RIGHT DIRECTION even if execution wasn't perfect
- Reserve very low scores (below 40%) ONLY for calls where the rep made NO ATTEMPT at a skill
- A typical learning call should score 60-75% - room to improve but showing solid effort
- Only truly disastrous calls with no redeeming qualities should score below 50%

SCORING GUIDELINES:
- 90-100%: Excellent demonstration of the skill with minor room for improvement
- 70-89%: Good attempt, skill was present but could be stronger/more polished
- 50-69%: Partial attempt, skill was attempted but needs significant work
- 30-49%: Minimal attempt, skill barely present or very poorly executed
- 0-29%: No attempt at all, skill completely absent from the conversation

INSTRUCTIONS:
1. For each rubric criterion, analyze the salesperson's performance
2. Award points GENEROUSLY for any evidence of attempting the skill
3. Give PARTIAL CREDIT liberally - even 40-60% of max points shows they tried
4. Provide specific quotes/examples from the transcript as evidence
5. Give detailed reasoning that is CONSTRUCTIVE and identifies what they did well
6. If a criterion was not addressed at all, award 20-30% of points for basic professionalism/effort
7. Focus on what they DID do, not just what they missed

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
      "reasoning": "detailed explanation emphasizing what they did well and where to improve"
    }
  ]
}

Only return the JSON response, nothing else.`

    let completion
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a supportive sales training coach who grades constructively. Remember these are trainees learning and practicing - be encouraging and generous with scoring while providing helpful feedback. Typical scores should be 60-75% for solid learning efforts."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 4000, // Increased for detailed grading output
        temperature: 0.1
      })
    } catch (openaiError: any) {
      console.error('OpenAI API Error:', openaiError)
      console.error('Error details:', {
        message: openaiError.message,
        type: openaiError.type,
        code: openaiError.code,
        status: openaiError.status
      })
      
      // Check if it's a token limit error
      if (openaiError.message?.includes('maximum context length') || 
          openaiError.code === 'context_length_exceeded') {
        throw new Error(`Transcript too long for AI processing. Please try a shorter training session. (${transcript?.length || 0} characters)`)
      }
      
      throw new Error(`AI grading failed: ${openaiError.message || 'Unknown error'}`)
    }

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No grading response received')
    }

    // Parse the JSON response
    let gradingResult
    try {
      gradingResult = JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse grading response:', response)
      throw new Error('AI returned invalid grading format')
    }

    // Save to database (percentage is auto-calculated as a generated column)
    const { data: grade, error: gradeError } = await supabase
      .from('session_grades')
      .insert([{
        session_id: sessionId,
        user_id: userId,
        assignment_id: assignmentId, // Can be null for playground sessions
        rubric_id: rubricId,
        total_score: gradingResult.totalScore,
        max_possible_score: gradingResult.maxPossibleScore,
        criteria_grades: gradingResult.criteriaGrades,
        grading_model: 'gpt-4o-mini'
      }])
      .select()
      .single()

    if (gradeError) {
      console.error('Error saving grade:', gradeError)
      throw gradeError
    }

    console.log('Grade saved successfully')

    return res.json({
      success: true,
      data: grade,
      message: wasTruncated 
        ? 'Transcript graded successfully (Note: Very long call - graded based on first portion)' 
        : 'Transcript graded and saved successfully',
      wasTruncated
    })

  } catch (error) {
    console.error('Error grading transcript:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to grade transcript',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/analytics/session-grade/:sessionId - Get grade details for a session
router.get('/session-grade/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params

    console.log('Fetching grade for session:', sessionId)

    const { data: grade, error } = await supabase
      .from('session_grades')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No grade found
        return res.json({
          success: true,
          data: null
        })
      }
      throw error
    }

    return res.json({
      success: true,
      data: grade
    })

  } catch (error) {
    console.error('Error fetching session grade:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch session grade',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Clean transcript with LLM (same as PDF export)
async function cleanTranscriptWithLLM(rawTranscript: string): Promise<string> {
  try {
    const OpenAI = require('openai')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

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

    const cleanedTranscript = completion.choices[0]?.message?.content || rawTranscript
    return cleanedTranscript.trim()

  } catch (error) {
    console.error('Error cleaning transcript with LLM:', error)
    return rawTranscript // Fallback to raw if LLM fails
  }
}

// GET /api/analytics/session-transcript/:sessionId - Get transcript for a session
router.get('/session-transcript/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params

    console.log('Fetching transcript for session:', sessionId)

    const { data: session, error } = await supabase
      .from('training_sessions')
      .select('transcript, transcript_clean, transcript_llm_clean, call_id, start_time, end_time, duration_seconds')
      .eq('id', sessionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.json({
          success: true,
          data: null
        })
      }
      throw error
    }

    let cleanedTranscript = session.transcript_llm_clean

    // LAZY LOAD: If no LLM-cleaned version exists, run it NOW and save it
    if (!cleanedTranscript && session.transcript_clean) {
      console.log('No LLM-cleaned transcript found. Running LLM cleaning for first time...')
      
      try {
        cleanedTranscript = await cleanTranscriptWithLLM(session.transcript_clean)
        console.log('LLM cleaning completed. Saving to database...')
        
        // Save the LLM-cleaned transcript to the database for future use
        const { error: updateError } = await supabase
          .from('training_sessions')
          .update({ transcript_llm_clean: cleanedTranscript })
          .eq('id', sessionId)
        
        if (updateError) {
          console.error('Error saving LLM-cleaned transcript:', updateError)
          // Don't fail - still return the cleaned transcript even if save fails
        } else {
          console.log('LLM-cleaned transcript saved successfully!')
        }
      } catch (error) {
        console.error('Error in LLM cleaning:', error)
        // Fallback to basic clean if LLM fails
        cleanedTranscript = session.transcript_clean
      }
    } else if (cleanedTranscript) {
      console.log('Using cached LLM-cleaned transcript from database')
    } else {
      // No transcript at all
      cleanedTranscript = session.transcript_clean
    }

    return res.json({
      success: true,
      data: {
        ...session,
        transcript_clean: cleanedTranscript // Return LLM-cleaned version (cached or freshly generated)
      }
    })

  } catch (error) {
    console.error('Error fetching session transcript:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch session transcript',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/analytics/session-summary/:sessionId - Generate/get AI summary for a session
router.get('/session-summary/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params

    console.log('Generating summary for session:', sessionId)

    // First check if summary already exists
    const { data: existingSession, error: fetchError } = await supabase
      .from('training_sessions')
      .select('ai_summary, transcript_clean, transcript_llm_clean')
      .eq('id', sessionId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // If summary already exists, return it
    if (existingSession.ai_summary) {
      return res.json({
        success: true,
        data: { summary: existingSession.ai_summary }
      })
    }

    // Use LLM-cleaned transcript if available, otherwise fall back to basic clean
    const transcriptToSummarize = existingSession.transcript_llm_clean || existingSession.transcript_clean

    // Generate new summary using OpenAI
    if (!transcriptToSummarize) {
      return res.status(400).json({
        success: false,
        error: 'No transcript available for this session'
      })
    }

    const OpenAI = require('openai')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const prompt = `Analyze this sales call transcript and provide a concise summary focusing on:
1. What the rep did well (strengths in their approach, techniques used effectively)
2. What the rep could improve (missed opportunities, weak points, areas for development)
3. Overall call assessment (how the call went, outcome, key takeaways)

Keep the summary professional, actionable, and around 150-200 words.

Transcript:
${transcriptToSummarize}

Provide the summary in a clear, paragraph format.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert sales coach analyzing training calls. Provide constructive, specific feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    const summary = completion.choices[0]?.message?.content

    if (!summary) {
      throw new Error('No summary generated')
    }

    // Save summary to database
    const { error: updateError } = await supabase
      .from('training_sessions')
      .update({ ai_summary: summary })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error saving summary:', updateError)
      // Don't fail - still return the summary even if save fails
    }

    return res.json({
      success: true,
      data: { summary }
    })

  } catch (error) {
    console.error('Error generating session summary:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to generate session summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/analytics/session-data/:sessionId - Get full session data for PDF generation
router.get('/session-data/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params

    console.log('Fetching session data for:', sessionId)

    const { data: session, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      throw error
    }

    return res.json({
      success: true,
      data: session
    })

  } catch (error) {
    console.error('Error fetching session data:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch session data'
    })
  }
})

// POST /api/analytics/manual-grade - Save manual grade override
router.post('/manual-grade', async (req, res) => {
  try {
    const { userId, assignmentId, totalScore, maxScore, criteriaGrades, isManualOverride } = req.body

    console.log('Saving manual grade override:', { userId, assignmentId, totalScore, maxScore })

    // Find the most recent session for this user and assignment
    const { data: sessions, error: sessionError } = await supabase
      .from('training_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (sessionError) throw sessionError

    if (!sessions || sessions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No session found for this user and assignment'
      })
    }

    const sessionId = sessions[0]?.id
    
    if (!sessionId) {
      return res.status(404).json({
        success: false,
        error: 'Session ID not found'
      })
    }

    // Check if grade already exists
    const { data: existingGrade, error: checkError } = await supabase
      .from('session_grades')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    // Update or insert the grade with manual override (percentage is auto-calculated)
    if (existingGrade) {
      // Update existing grade
      const { error: updateError } = await supabase
        .from('session_grades')
        .update({
          total_score: totalScore,
          max_possible_score: maxScore,
          criteria_grades: criteriaGrades || [],
          is_manual_override: isManualOverride,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingGrade.id)

      if (updateError) throw updateError
    } else {
      // Insert new grade
      const { error: insertError } = await supabase
        .from('session_grades')
        .insert({
          session_id: sessionId,
          user_id: userId,
          assignment_id: assignmentId,
          total_score: totalScore,
          max_possible_score: maxScore,
          criteria_grades: criteriaGrades || [],
          is_manual_override: isManualOverride
        })

      if (insertError) throw insertError
    }

    return res.json({
      success: true,
      message: 'Manual grade saved successfully'
    })

  } catch (error) {
    console.error('Error saving manual grade:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to save manual grade',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/analytics/grade - Save session grade (manual)
router.post('/grade', async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      assignmentId,
      rubricId,
      totalScore,
      maxPossibleScore,
      criteriaGrades,
      gradingModel
    } = req.body

    console.log('Saving session grade:', {
      sessionId,
      userId,
      assignmentId,
      totalScore,
      maxPossibleScore
    })

    // Insert grade (percentage is auto-calculated as a generated column)
    const { data: grade, error: gradeError } = await supabase
      .from('session_grades')
      .insert([{
        session_id: sessionId,
        user_id: userId,
        assignment_id: assignmentId,
        rubric_id: rubricId,
        total_score: totalScore,
        max_possible_score: maxPossibleScore,
        criteria_grades: criteriaGrades,
        grading_model: gradingModel || 'gpt-4o-mini'
      }])
      .select()
      .single()

    if (gradeError) throw gradeError

    return res.json({
      success: true,
      data: grade,
      message: 'Grade saved successfully'
    })

  } catch (error) {
    console.error('Error saving grade:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to save grade',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/analytics/session/:id/submit - Submit a session for admin review
router.post('/session/:id/submit', async (req, res): Promise<void> => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({
        error: 'Missing session ID'
      })
      return
    }

    // First, get the session to find its assignment_id
    const { data: session, error: fetchError } = await supabase
      .from('training_sessions')
      .select('assignment_id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !session) {
      res.status(404).json({
        error: 'Session not found'
      })
      return
    }

    // If this is an assignment session, unsubmit all other sessions for this assignment
    if (session.assignment_id) {
      const { error: unsubmitError } = await supabase
        .from('training_sessions')
        .update({ submitted_for_review: false })
        .eq('assignment_id', session.assignment_id)
        .eq('user_id', session.user_id)
        .neq('id', id)

      if (unsubmitError) {
        console.error('Error unsubmitting other sessions:', unsubmitError)
      }
    }

    // Now submit this session
    const { data, error } = await supabase
      .from('training_sessions')
      .update({ submitted_for_review: true })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error submitting session:', error)
      res.status(500).json({
        error: 'Failed to submit session',
        details: error.message
      })
      return
    }

    res.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error in submit session:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router

