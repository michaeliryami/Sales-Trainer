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

    // Get total sessions (same query as employee endpoint, just filtered by org_id)
    const { data: sessions, error: sessionsError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('org_id', orgId)
      .gte('created_at', startDate.toISOString())

    if (sessionsError) throw sessionsError

    // Filter sessions for Admin Analytics:
    // 1. Include ALL playground sessions (assignment_id is null)
    // 2. For assignments, ONLY include if submitted_for_review is true
    const filteredSessions = sessions?.filter(s => {
      if (!s.assignment_id) return true // Keep playground sessions
      return s.submitted_for_review === true // Only keep submitted assignments
    }) || []

    // Use filteredSessions for all stats calculations
    const sessionsForStats = filteredSessions

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
    const totalSessions = sessionsForStats.length
    const completedSessions = sessionsForStats.filter(s => s.status === 'completed').length
    const activeUsers = new Set(sessionsForStats.map(s => s.user_id)).size

    // Track assignment-only sessions for detailed performance metrics
    const assignmentSessions = sessionsForStats.filter(s => s.assignment_id !== null)
    const playgroundSessionsCount = totalSessions - assignmentSessions.length
    const avgDuration = sessionsForStats.length > 0
      ? sessionsForStats.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessionsForStats.length / 60
      : 0
    // Calculate Cloze Rate (percentage of sessions that were closed)
    const closedSessions = sessionsForStats.filter(s => s.closed === true).length
    const sessionsWithCloseStatus = sessionsForStats.filter(s => s.closed !== null).length
    const clozeRate = sessionsWithCloseStatus > 0 ? (closedSessions / sessionsWithCloseStatus) * 100 : 0

    // Calculate average score
    // We need to filter grades to match the filtered sessions
    const filteredSessionIds = new Set(sessionsForStats.map(s => s.id))
    const filteredGrades = grades?.filter(g => filteredSessionIds.has(g.session_id)) || []

    const avgScore = filteredGrades.length > 0
      ? filteredGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / filteredGrades.length
      : 0

    // Separate stats for practice vs assignment sessions
    const practiceSessions = sessionsForStats.filter(s => !s.assignment_id)
    const assignmentOnlySessions = sessionsForStats.filter(s => s.assignment_id !== null)

    // Practice stats
    const practiceGrades = filteredGrades.filter(g => {
      const session = sessionsForStats.find(s => s.id === g.session_id)
      return session && !session.assignment_id
    })
    const practiceAvgScore = practiceGrades.length > 0
      ? practiceGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / practiceGrades.length
      : 0
    const practiceAvgDuration = practiceSessions.length > 0
      ? practiceSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / practiceSessions.length / 60
      : 0
    const practiceUsers = new Set(practiceSessions.map(s => s.user_id)).size

    // Assignment stats
    const assignmentGrades = filteredGrades.filter(g => {
      const session = sessionsForStats.find(s => s.id === g.session_id)
      return session && session.assignment_id !== null
    })
    const assignmentAvgScore = assignmentGrades.length > 0
      ? assignmentGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / assignmentGrades.length
      : 0
    const assignmentAvgDuration = assignmentOnlySessions.length > 0
      ? assignmentOnlySessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / assignmentOnlySessions.length / 60
      : 0

    // Get users who have been assigned assignments
    const { data: orgAssignments } = await supabase
      .from('assignments')
      .select('assignees')
      .eq('org_id', orgId)

    const usersWithAssignments = new Set<string>()
    orgAssignments?.forEach(assignment => {
      if (assignment.assignees && Array.isArray(assignment.assignees)) {
        assignment.assignees.forEach((userId: string) => usersWithAssignments.add(userId))
      }
    })
    const assignmentUsers = usersWithAssignments.size

    // Get recent sessions with user and template details
    // RECENT SESSIONS LIST: Show ONLY submitted assignments (no playground sessions)
    // This is distinct from stats which include playground sessions
    const recentSessionsData = sessionsForStats
      .filter(s => s.assignment_id && s.submitted_for_review === true)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50)

    // Get profiles for user names - include all users from sessions AND userMetrics
    const recentSessionUserIds = recentSessionsData.map(s => s.user_id)
    const metricsUserIds = userMetrics?.map(m => m.user_id) || []
    const allUserIds = [...new Set([...recentSessionUserIds, ...metricsUserIds])]

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('id', allUserIds)

    // Get assignments for recent sessions
    const assignmentIds = [...new Set(recentSessionsData.map(s => s.assignment_id).filter(Boolean))]
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, title')
      .in('id', assignmentIds)

    const recentSessions = recentSessionsData.map(session => {
      const profile = profiles?.find(p => p.id === session.user_id)
      const assignment = assignments?.find(a => a.id === session.assignment_id)
      const grade = grades?.find(g => g.session_id === session.id)

      // Use assignment name instead of template name
      const assignmentName = assignment?.title || 'Unknown Assignment'

      const isPlayground = !session.assignment_id

      return {
        id: session.id,
        userId: session.user_id,
        assignmentId: session.assignment_id,
        user: profile?.display_name || profile?.email || 'Unknown User',
        template: assignmentName, // This is actually the assignment name now
        duration: session.duration_seconds ? `${Math.round(session.duration_seconds / 60)}m` : 'N/A',
        score: grade ? Math.round(grade.percentage) : null,
        date: session.created_at,
        status: session.status,
        pdfUrl: session.pdf_url,
        hasGrade: !!grade,
        sessionType: session.session_type,
        isPlayground: isPlayground,
        assignment_id: session.assignment_id,
        recordingUrl: session.recording_url,
        closed: session.closed,
        closedEvidence: session.closed_evidence || null
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
          completedSessions: metric.completed_sessions || 0
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

      const daySessions = sessionsForStats.filter(s => {
        const sessionDate = new Date(s.created_at)
        return sessionDate >= dayStart && sessionDate <= dayEnd
      })

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
      clozeRate: parseFloat(clozeRate.toFixed(1)),
      avgScore: parseFloat(avgScore.toFixed(1)),

      // Practice vs Assignment Stats (from ALL sessions)
      practiceStats: {
        totalSessions: practiceSessions.length,
        completedSessions: practiceSessions.filter(s => s.status === 'completed').length,
        avgScore: parseFloat(practiceAvgScore.toFixed(1)),
        avgDuration: parseFloat(practiceAvgDuration.toFixed(1)),
        totalUsers: practiceUsers
      },
      assignmentStats: {
        totalSessions: assignmentOnlySessions.length,
        completedSessions: assignmentOnlySessions.filter(s => s.status === 'completed').length,
        avgScore: parseFloat(assignmentAvgScore.toFixed(1)),
        avgDuration: parseFloat(assignmentAvgDuration.toFixed(1)),
        totalUsers: assignmentUsers
      },

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

    // Filter sessions:
    // 1. Employee View (default): Show ALL sessions (submitted or not)
    // 2. Admin View (adminView=true): Show ONLY submitted assignments (and all playground)
    const { adminView } = req.query
    const filteredSessionsForStats = (sessions || []).filter(s => {
      // Ensure we only use sessions for this specific user (safety check)
      if (s.user_id !== userId) {
        return false
      }

      // If admin view, filter out unsubmitted assignment sessions
      if (adminView === 'true' && s.assignment_id) {
        return s.submitted_for_review === true
      }

      // Otherwise show all sessions (employee viewing their own data)
      return true
    })

    // Calculate stats using filtered sessions
    const totalSessions = filteredSessionsForStats?.length || 0
    const completedSessions = filteredSessionsForStats?.filter(s => s.status === 'completed').length || 0
    const avgDuration = filteredSessionsForStats && filteredSessionsForStats.length > 0
      ? filteredSessionsForStats.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / filteredSessionsForStats.length / 60
      : 0

    // Score stats - only include grades for filtered sessions
    const filteredSessionIds = new Set(filteredSessionsForStats.map(s => s.id))
    const filteredGrades = grades?.filter(g => filteredSessionIds.has(g.session_id)) || []
    const scores = filteredGrades.map(g => g.percentage || 0) || []
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

    // Separate stats for practice vs assignment sessions
    const practiceSessions = filteredSessionsForStats?.filter(s => !s.assignment_id) || []
    const assignmentSessions = filteredSessionsForStats?.filter(s => s.assignment_id !== null) || []

    // Practice stats
    const practiceGrades = filteredGrades.filter(g => {
      const session = filteredSessionsForStats?.find(s => s.id === g.session_id)
      return session && !session.assignment_id
    }) || []
    const practiceAvgScore = practiceGrades.length > 0
      ? practiceGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / practiceGrades.length
      : 0
    const practiceAvgDuration = practiceSessions.length > 0
      ? practiceSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / practiceSessions.length / 60
      : 0

    // Assignment stats
    const assignmentGrades = filteredGrades.filter(g => {
      const session = filteredSessionsForStats?.find(s => s.id === g.session_id)
      return session && session.assignment_id !== null
    }) || []
    const assignmentAvgScore = assignmentGrades.length > 0
      ? assignmentGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / assignmentGrades.length
      : 0
    const assignmentAvgDuration = assignmentSessions.length > 0
      ? assignmentSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / assignmentSessions.length / 60
      : 0

    // Calculate Cloze Rate (percentage of sessions that were closed)
    const closedSessions = filteredSessionsForStats?.filter(s => s.closed === true).length || 0
    const sessionsWithCloseStatus = filteredSessionsForStats?.filter(s => s.closed !== null).length || 0
    const clozeRate = sessionsWithCloseStatus > 0 ? (closedSessions / sessionsWithCloseStatus) * 100 : 0

    // Assignment progress - only count assignment sessions (not playground)
    const assignmentSessionIds = assignmentSessions.map(s => s.id)
    const assignmentsCompleted = grades?.filter(g => assignmentSessionIds.includes(g.session_id)).length || 0
    const assignmentsPending = (userAssignments?.length || 0) - assignmentsCompleted

    // Get recent sessions with details
    const { data: templates } = await supabase
      .from('templates')
      .select('id, title')

    console.log(`📊 Found ${grades?.length || 0} total grades for user`)
    console.log(`📋 Processing ${sessions?.length || 0} total sessions`)

    // Use the same filtered sessions for recent sessions list
    const recentSessions = filteredSessionsForStats
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
          isPlayground: isPlayground,
          assignment_id: session.assignment_id,
          closed: session.closed,
          closedEvidence: session.closed_evidence || null,
          submittedForReview: session.submitted_for_review
        }
      })

    // Score trend over time (most recent 10 sessions, newest first) - use filtered grades
    const scoreTrend = filteredGrades
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Newest first
      .slice(0, 10) // Only show most recent 10
      .map(g => ({
        date: g.created_at,
        score: Math.round(g.percentage || 0)
      })) || []

    // Skills breakdown (from criteria grades) - use filtered grades
    const skillsBreakdown: any = {}
    filteredGrades?.forEach(grade => {
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

    console.log(`📊 Skills breakdown for user ${userId}:`, {
      totalGrades: filteredGrades?.length,
      skillsCount: skills.length,
      skills: skills.slice(0, 3)
    })

    // Group playground sessions by template - use filtered sessions
    const playgroundSessionsByTemplate: any = {}
    filteredSessionsForStats?.forEach(session => {
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

        const grade = filteredGrades?.find(g => g.session_id === session.id)

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

    console.log(`🎮 Playground stats for user ${userId}:`, {
      totalPlaygroundSessions: practiceSessions.length,
      templatesCount: playgroundStats.length,
      templates: playgroundStats.slice(0, 3).map(s => ({ name: s.templateName, count: s.count }))
    })

    const analyticsData = {
      // Overview Stats
      totalSessions,
      completedSessions,
      avgDuration: parseFloat(avgDuration.toFixed(1)),
      avgScore: parseFloat(avgScore.toFixed(1)),
      highestScore: parseFloat(highestScore.toFixed(1)),
      lowestScore: parseFloat(lowestScore.toFixed(1)),

      // Practice vs Assignment Stats (from ALL sessions)
      practiceStats: {
        totalSessions: practiceSessions.length,
        completedSessions: practiceSessions.filter(s => s.status === 'completed').length,
        avgScore: parseFloat(practiceAvgScore.toFixed(1)),
        avgDuration: parseFloat(practiceAvgDuration.toFixed(1))
      },
      assignmentStats: {
        totalSessions: assignmentSessions.length,
        completedSessions: assignmentSessions.filter(s => s.status === 'completed').length,
        avgScore: parseFloat(assignmentAvgScore.toFixed(1)),
        avgDuration: parseFloat(assignmentAvgDuration.toFixed(1))
      },

      // Assignment Progress
      assignmentsCompleted,
      assignmentsPending,
      totalAssignments: userAssignments?.length || 0,

      // Cloze Rate
      clozeRate: parseFloat(clozeRate.toFixed(1)),
      closedSessions,
      totalSessionsWithCloseStatus: sessionsWithCloseStatus,

      // Detailed Data
      recentSessions,
      scoreTrend,
      skills,
      playgroundStats, // Practice sessions grouped by template

      // Performance Metrics
      // scoreTrend is sorted newest first, so improvement = newest - oldest
      improvementRate: scoreTrend.length >= 2
        ? (scoreTrend[0]?.score || 0) - (scoreTrend[scoreTrend.length - 1]?.score || 0)
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

// Background processing function - runs after session is saved
// Handles LLM transcript cleaning, summary generation, auto-grading, and recording URL fetch
async function processSessionInBackground(
  sessionId: number,
  userId: string,
  assignmentId: number | null,
  transcriptClean: string,
  vapiCallId: string | null
): Promise<void> {
  console.log(`🔄 Starting background processing for session ${sessionId}`)

  const OpenAI = require('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    // STEP 0: Fetch recording URL from VAPI (if we have a call ID)
    // VAPI recordings take time to process, so we need to wait and retry
    console.log(`🔍 VAPI Call ID for session ${sessionId}:`, vapiCallId || 'NULL/UNDEFINED')

    if (vapiCallId) {
      console.log(`🎙️ Fetching recording URL for session ${sessionId}...`)
      try {
        const { vapiService } = require('../services/vapi')

        // Helper function to wait
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

        // Retry logic: Try multiple times with increasing delays
        // VAPI needs time to process the recording after call ends
        const maxRetries = 6
        const delays = [10000, 15000, 20000, 30000, 40000, 50000] // 10s, 15s, 20s, 30s, 40s, 50s

        let recordingUrl = null

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          // Wait before checking (give VAPI time to process)
          await wait(delays[attempt] || 30000)

          console.log(`🔄 Attempt ${attempt + 1}/${maxRetries} to fetch recording for session ${sessionId}`)

          const callDetails = await vapiService.getCall(vapiCallId)

          // Check multiple possible locations for recording URL
          recordingUrl = callDetails.artifact?.recordingUrl ||
            callDetails.recordingUrl ||
            callDetails.recording?.url ||
            callDetails.recordingPath ||
            null

          if (recordingUrl) {
            console.log(`✅ Recording URL found on attempt ${attempt + 1}`)
            break
          }

          console.log(`⏳ Recording not ready yet, will retry...`)
        }

        if (recordingUrl) {
          await supabase
            .from('training_sessions')
            .update({ recording_url: recordingUrl })
            .eq('id', sessionId)

          console.log(`✅ Recording URL saved for session ${sessionId}: ${recordingUrl}`)
        } else {
          console.log(`⚠️ No recording URL found after ${maxRetries} attempts for call ${vapiCallId}`)
        }
      } catch (error) {
        console.error(`❌ Failed to fetch recording URL for session ${sessionId}:`, error)
        // Continue with other steps even if this fails
      }
    } else {
      console.log(`⚠️ Skipping recording fetch for session ${sessionId} - no VAPI call ID provided`)
    }

    // STEP 1: Clean transcript with LLM (if we have a transcript)
    let llmCleanedTranscript = null
    if (transcriptClean) {
      console.log(`📝 Cleaning transcript for session ${sessionId}...`)
      try {
        llmCleanedTranscript = await cleanTranscriptWithLLM(transcriptClean)

        // Save cleaned transcript
        await supabase
          .from('training_sessions')
          .update({ transcript_llm_clean: llmCleanedTranscript })
          .eq('id', sessionId)

        console.log(`✅ Transcript cleaned for session ${sessionId}`)
      } catch (error) {
        console.error(`❌ Failed to clean transcript for session ${sessionId}:`, error)
        // Continue with other steps even if this fails
        llmCleanedTranscript = transcriptClean // Fallback to basic clean
      }
    }

    // STEP 2: Generate AI summary
    if (llmCleanedTranscript || transcriptClean) {
      console.log(`📊 Generating summary for session ${sessionId}...`)
      try {
        const transcriptForSummary = llmCleanedTranscript || transcriptClean

        const summaryPrompt = `Analyze this sales call transcript and provide a concise summary focusing on:
1. What the rep did well (strengths in their approach, techniques used effectively)
2. What the rep could improve (missed opportunities, weak points, areas for development)
3. Overall call assessment (how the call went, outcome, key takeaways)

Keep it concise but actionable - 3-4 paragraphs maximum.

TRANSCRIPT:
${transcriptForSummary}

Provide a helpful, constructive summary for the sales rep.`

        const summaryCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a sales training coach providing constructive feedback on training calls."
            },
            {
              role: "user",
              content: summaryPrompt
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        })

        const summary = summaryCompletion.choices[0]?.message?.content

        if (summary) {
          await supabase
            .from('training_sessions')
            .update({ ai_summary: summary })
            .eq('id', sessionId)

          console.log(`✅ Summary generated for session ${sessionId}`)
        }
      } catch (error) {
        console.error(`❌ Failed to generate summary for session ${sessionId}:`, error)
        // Continue with grading even if summary fails
      }
    }

    // STEP 3: Auto-grade the session
    // For assignment sessions, use the assignment's rubric
    // For playground sessions, use the default rubric (ID 1)
    console.log(`🎯 Auto-grading session ${sessionId}...`)
    try {
      let rubricCriteria: any[] = []
      let rubricId: number | null = null

      if (assignmentId) {
        // Fetch assignment to get rubric
        const { data: assignment, error: assignmentError } = await supabase
          .from('assignments')
          .select('rubric_id, rubric:rubrics(criteria)')
          .eq('id', assignmentId)
          .single()

        if (assignmentError || !assignment?.rubric) {
          console.log(`⚠️ No rubric found for assignment ${assignmentId}, skipping grading`)
          return
        }

        rubricCriteria = (assignment.rubric as any).criteria || []
        rubricId = assignment.rubric_id
      } else {
        // For playground sessions, use default rubric (ID 1)
        const { data: defaultRubric, error: rubricError } = await supabase
          .from('rubrics')
          .select('id, criteria')
          .eq('id', 1)
          .single()

        if (rubricError || !defaultRubric) {
          console.log(`⚠️ No default rubric found, skipping grading for playground session ${sessionId}`)
          return
        }

        rubricCriteria = defaultRubric.criteria || []
        rubricId = defaultRubric.id
      }

      // Create rubric text
      const rubricText = rubricCriteria.map((criteria: any) =>
        `- ${criteria.title}: ${criteria.description} (Max: ${criteria.maxPoints} points)`
      ).join('\n')

      const transcriptForGrading = llmCleanedTranscript || transcriptClean

      // Truncate if needed
      const MAX_TRANSCRIPT_CHARS = 200000
      let processedTranscript = transcriptForGrading
      if (transcriptForGrading && transcriptForGrading.length > MAX_TRANSCRIPT_CHARS) {
        processedTranscript = transcriptForGrading.substring(0, MAX_TRANSCRIPT_CHARS) +
          '\n\n[TRANSCRIPT TRUNCATED DUE TO LENGTH]'
      }

      // Grade with AI
      const gradingPrompt = `
You are an objective sales training evaluator. Analyze this sales conversation transcript against the provided rubric criteria and provide accurate, honest grading.

RUBRIC CRITERIA:
${rubricText}

CONVERSATION TRANSCRIPT:
${processedTranscript}

INSTRUCTIONS:
1. For each rubric criterion, objectively analyze the salesperson's performance
2. Award points based on actual demonstration of the skill, not just attempts
3. Provide specific quotes/examples from the transcript as evidence
4. Give detailed reasoning explaining what they did well and where they fell short
5. Be fair but honest - score reflects actual performance, not potential or effort alone
6. If a criterion was not addressed, give 0 points (not applicable) or minimal points if barely touched

SCORING APPROACH:
- Full points: Skill demonstrated excellently with strong execution
- Partial points: Skill attempted with moderate success but clear room for improvement
- Minimal points: Skill barely present or poorly executed
- Zero points: Skill completely absent or not attempted

CLOSE DETECTION:
Determine if the call was "closed" based on these strict rules:
1. IF the salesperson got rejected (customer said no, not interested, hung up in anger) -> Return FALSE
2. IF the salesperson ended the call early (before reaching a conclusion/ask) -> Return FALSE
3. ELSE (if the call finished naturally and wasn't a rejection) -> Return TRUE

Provide specific evidence (quotes from the transcript) that supports your determination.

RESPONSE FORMAT (JSON):
{
  "totalScore": number,
  "maxPossibleScore": number,
  "closed": boolean,
  "closedEvidence": "string - specific quotes/reasoning explaining why the call was or wasn't closed",
  "criteriaGrades": [
    {
      "title": "string",
      "description": "string", 
      "maxPoints": number,
      "earnedPoints": number,
      "evidence": ["specific quote 1", "specific quote 2"],
      "reasoning": "detailed explanation of performance"
    }
  ]
}

Only return the JSON response, nothing else.`

      const gradingCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an objective sales training evaluator. Provide accurate, fair grading based on actual performance demonstrated in the call. Be honest and constructive in your feedback."
          },
          {
            role: "user",
            content: gradingPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      })

      const gradingResponse = gradingCompletion.choices[0]?.message?.content
      if (!gradingResponse) {
        throw new Error('No grading response received')
      }

      const gradingResult = JSON.parse(gradingResponse)

      // Log the full grading result for debugging
      console.log(`📊 Full grading result for session ${sessionId}:`, JSON.stringify(gradingResult, null, 2))

      // Save grade to database
      await supabase
        .from('session_grades')
        .insert([{
          session_id: sessionId,
          user_id: userId,
          assignment_id: assignmentId, // Will be null for playground sessions
          rubric_id: rubricId,
          total_score: gradingResult.totalScore,
          max_possible_score: gradingResult.maxPossibleScore,
          criteria_grades: gradingResult.criteriaGrades,
          grading_model: 'gpt-4o-mini'
        }])

      // Update session with closed status and evidence
      // Handle both boolean and string values, and check for null/undefined
      const closedValue = gradingResult.closed
      let closedBool = false
      let closedEvidence = null

      console.log(`🔍 Closed value from AI:`, {
        raw: closedValue,
        type: typeof closedValue,
        hasClosedField: 'closed' in gradingResult,
        hasEvidenceField: 'closedEvidence' in gradingResult
      })

      if (closedValue !== undefined && closedValue !== null) {
        // Convert string "true"/"false" to boolean if needed
        closedBool = typeof closedValue === 'string'
          ? closedValue.toLowerCase() === 'true'
          : Boolean(closedValue)
        closedEvidence = gradingResult.closedEvidence || null
        console.log(`✅ Using AI closed determination: ${closedBool}`)
      } else {
        // AI didn't return closed status - default to false
        console.warn(`⚠️ No closed status in grading result for session ${sessionId}. Defaulting to false.`)
        closedBool = false
        closedEvidence = 'AI did not provide close determination for this session.'
      }

      console.log(`💾 Updating session ${sessionId} with closed=${closedBool}, evidence="${closedEvidence}"`)

      const { error: updateError, data: updateData } = await supabase
        .from('training_sessions')
        .update({
          closed: closedBool,
          closed_evidence: closedEvidence
        })
        .eq('id', sessionId)
        .select()

      if (updateError) {
        console.error(`❌ Error updating closed status for session ${sessionId}:`, updateError)
      } else {
        console.log(`✅ Successfully updated closed status for session ${sessionId}:`, {
          closed: updateData?.[0]?.closed,
          evidence: updateData?.[0]?.closed_evidence
        })
      }

      console.log(`✅ Session ${sessionId} graded successfully`)
    } catch (error) {
      console.error(`❌ Failed to grade session ${sessionId}:`, error)
      // Don't throw - other steps succeeded
    }

    console.log(`✅ Background processing completed for session ${sessionId}`)
  } catch (error) {
    console.error(`❌ Background processing failed for session ${sessionId}:`, error)
    throw error
  }
}

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
      vapiCallId: vapiCallId || 'NULL',
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

    // START BACKGROUND PROCESSING (non-blocking)
    // This will process transcript cleaning, summary, grading, and recording URL fetch in the background
    // User doesn't have to wait, and it continues even if they leave the page
    processSessionInBackground(session.id, userId, assignmentId, transcriptClean, session.vapi_call_id).catch(err => {
      console.error('Background processing error for session', session.id, ':', err)
      // Don't throw - we already saved the session successfully
    })

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
You are an objective sales training evaluator. Analyze this sales conversation transcript against the provided rubric criteria and provide accurate, honest grading.

RUBRIC CRITERIA:
${rubricText}

CONVERSATION TRANSCRIPT:
${processedTranscript}

INSTRUCTIONS:
1. For each rubric criterion, objectively analyze the salesperson's performance
2. Award points based on actual demonstration of the skill, not just attempts
3. Provide specific quotes/examples from the transcript as evidence
4. Give detailed reasoning explaining what they did well and where they fell short
5. Be fair but honest - score reflects actual performance, not potential or effort alone
6. If a criterion was not addressed, give 0 points (not applicable) or minimal points if barely touched

SCORING APPROACH:
- Full points: Skill demonstrated excellently with strong execution
- Partial points: Skill attempted with moderate success but clear room for improvement
- Minimal points: Skill barely present or poorly executed
- Zero points: Skill completely absent or not attempted

CLOSE DETECTION:
Determine if the call was "closed" based on these strict rules:
1. IF the salesperson got rejected (customer said no, not interested, hung up in anger) -> Return FALSE
2. IF the salesperson ended the call early (before reaching a conclusion/ask) -> Return FALSE
3. ELSE (if the call finished naturally and wasn't a rejection) -> Return TRUE

RESPONSE FORMAT (JSON):
{
  "totalScore": number,
  "maxPossibleScore": number,
  "closed": boolean,
  "criteriaGrades": [
    {
      "title": "string",
      "description": "string", 
      "maxPoints": number,
      "earnedPoints": number,
      "evidence": ["specific quote 1", "specific quote 2"],
      "reasoning": "detailed explanation of performance"
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
            content: "You are an objective sales training evaluator. Provide accurate, fair grading based on actual performance demonstrated in the call. Be honest and constructive in your feedback."
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

    // Log the grading result to debug closed status
    console.log(`📊 Grading result for session ${sessionId}:`, {
      hasClosed: 'closed' in gradingResult,
      closedValue: gradingResult.closed,
      closedType: typeof gradingResult.closed,
      hasEvidence: 'closedEvidence' in gradingResult
    })

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

    // Update session with closed status and evidence
    // Handle both boolean and string values, and check for null/undefined
    const closedValue = gradingResult.closed
    let closedBool = false
    let closedEvidence = null

    if (closedValue !== undefined && closedValue !== null) {
      // Convert string "true"/"false" to boolean if needed
      closedBool = typeof closedValue === 'string'
        ? closedValue.toLowerCase() === 'true'
        : Boolean(closedValue)
      closedEvidence = gradingResult.closedEvidence || null
    } else {
      // AI didn't return closed status - default to false
      console.warn(`⚠️ No closed status in grading result for session ${sessionId}. Defaulting to false.`)
      closedBool = false
      closedEvidence = 'AI did not provide close determination for this session.'
    }

    const { error: updateError, data: updateData } = await supabase
      .from('training_sessions')
      .update({
        closed: closedBool,
        closed_evidence: closedEvidence
      })
      .eq('id', sessionId)
      .select()

    if (updateError) {
      console.error(`❌ Error updating closed status for session ${sessionId}:`, updateError)
    } else {
      console.log(`✅ Updated closed status for session ${sessionId}: ${closedBool}`, updateData?.[0]?.closed)
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

    // Allow multiple submissions per assignment - no need to unsubmit others

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

// DEBUG ENDPOINT: Check sessions for a specific assignment
router.get('/debug-assignment-sessions/:orgId/:assignmentId', async (req, res) => {
  try {
    const { orgId, assignmentId } = req.params

    console.log('🔍 DEBUG: Querying training_sessions for orgId:', orgId, 'assignmentId:', assignmentId)

    // Query 1: Get all sessions for this org
    const { data: allSessions, error: allError } = await supabase
      .from('training_sessions')
      .select('id, user_id, assignment_id, session_type, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50)

    console.log('🔍 DEBUG: All sessions:', allSessions?.length)

    // Query 2: Get sessions specifically for this assignment
    const { data: assignmentSessions, error: assignmentError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('org_id', orgId)
      .eq('assignment_id', parseInt(assignmentId))

    console.log('🔍 DEBUG: Sessions with assignment_id =', assignmentId, ':', assignmentSessions?.length)

    // Query 3: Get sessions with session_type = 'assignment'
    const { data: typeSessions, error: typeError } = await supabase
      .from('training_sessions')
      .select('id, user_id, assignment_id, session_type, created_at')
      .eq('org_id', orgId)
      .eq('session_type', 'assignment')
      .order('created_at', { ascending: false })

    console.log('🔍 DEBUG: Sessions with session_type="assignment":', typeSessions?.length)

    return res.json({
      success: true,
      data: {
        allSessionsCount: allSessions?.length || 0,
        allSessions: allSessions || [],
        assignmentSessionsCount: assignmentSessions?.length || 0,
        assignmentSessions: assignmentSessions || [],
        typeSessionsCount: typeSessions?.length || 0,
        typeSessions: typeSessions || []
      }
    })
  } catch (error) {
    console.error('❌ DEBUG: Error querying sessions:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to query sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// DEBUG ENDPOINT: Check VAPI call details and recording status
router.get('/debug-vapi-call/:callId', async (req, res) => {
  try {
    const { callId } = req.params

    console.log('🔍 DEBUG: Fetching VAPI call details for:', callId)

    const { vapiService } = require('../services/vapi')
    const callDetails = await vapiService.getCall(callId)

    // Extract all possible recording URL locations
    const recordingInfo = {
      callId: callId,
      hasArtifact: !!callDetails.artifact,
      artifactRecordingUrl: callDetails.artifact?.recordingUrl || null,
      recordingUrl: callDetails.recordingUrl || null,
      recordingPath: callDetails.recordingPath || null,
      recordingObject: callDetails.recording || null,
      fullCallDetails: callDetails // Send everything for inspection
    }

    console.log('🔍 DEBUG: Recording info extracted:', JSON.stringify(recordingInfo, null, 2))

    return res.json({
      success: true,
      data: recordingInfo
    })
  } catch (error) {
    console.error('❌ DEBUG: Error fetching VAPI call:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch VAPI call details',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router

