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

    // Get template stats
    const templateStats: any = {}
    sessions?.forEach(session => {
      if (session.template_id) {
        if (!templateStats[session.template_id]) {
          templateStats[session.template_id] = { count: 0, completed: 0, totalScore: 0, scores: 0 }
        }
        templateStats[session.template_id].count++
        if (session.status === 'completed') {
          templateStats[session.template_id].completed++
        }
      }
    })

    // Add grade data to template stats
    grades?.forEach(grade => {
      const session = sessions?.find(s => s.id === grade.session_id)
      if (session?.template_id) {
        if (templateStats[session.template_id]) {
          templateStats[session.template_id].totalScore += grade.percentage || 0
          templateStats[session.template_id].scores++
        }
      }
    })

    // Get template details
    const { data: templates } = await supabase
      .from('templates')
      .select('id, title')

    const topTemplates = templates?.map(template => {
      const stats = templateStats[template.id]
      return stats ? {
        id: template.id,
        name: template.title,
        sessions: stats.count,
        successRate: stats.scores > 0 ? Math.round(stats.totalScore / stats.scores) : 0
      } : null
    }).filter(Boolean).sort((a: any, b: any) => b.sessions - a.sessions).slice(0, 5)

    // Get recent sessions with user and template details
    // Filter out playground sessions (assignment_id is null) for admin view
    const recentSessionsData = sessions
      ?.filter(s => s.assignment_id !== null) // Only show assignment sessions to admin
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
      topTemplates: topTemplates || [],
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

    // Assignment progress
    const assignmentsCompleted = grades?.length || 0
    const assignmentsPending = (userAssignments?.length || 0) - assignmentsCompleted

    // Get recent sessions with details
    const { data: templates } = await supabase
      .from('templates')
      .select('id, title')

    const recentSessions = (sessions || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(session => {
        const grade = grades?.find(g => g.session_id === session.id)
        const isPlayground = !session.assignment_id // Playground if no assignment
        
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
      status
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

    // Import OpenAI for grading
    const OpenAI = require('openai')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    // Create rubric text
    const rubricText = rubricCriteria.map((criteria: any) => 
      `- ${criteria.title}: ${criteria.description} (Max: ${criteria.maxPoints} points)`
    ).join('\n')

    // Grade with AI
    const prompt = `
You are an expert sales training evaluator. Analyze this sales conversation transcript against the provided rubric criteria and provide detailed grading.

RUBRIC CRITERIA:
${rubricText}

CONVERSATION TRANSCRIPT:
${transcript}

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

    // Save to database
    const { data: grade, error: gradeError } = await supabase
      .from('session_grades')
      .insert([{
        session_id: sessionId,
        user_id: userId,
        assignment_id: assignmentId,
        rubric_id: rubricId,
        total_score: gradingResult.totalScore,
        max_possible_score: gradingResult.maxPossibleScore,
        criteria_grades: gradingResult.criteriaGrades,
        grading_model: 'gpt-4o-mini'
      }])
      .select()
      .single()

    if (gradeError) throw gradeError

    console.log('Grade saved successfully')

    return res.json({
      success: true,
      data: grade,
      message: 'Transcript graded and saved successfully'
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

    // Update or insert the grade with manual override
    if (existingGrade) {
      // Update existing grade - only update score fields, percentage will be auto-calculated
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

    // Insert grade
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

