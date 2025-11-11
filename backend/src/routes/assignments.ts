import { Router, Request, Response } from 'express'
import { supabase } from '../config/supabase'

const router = Router()

// GET /api/assignments/organization/:orgId - Get all assignments for an organization
router.get('/organization/:orgId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgId } = req.params

    console.log('Fetching assignments for organization:', orgId)

    // Fetch all assignments - assignments table doesn't have org_id
    // Filtering is done by user access control (users can only see assignments in their org)
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assignments:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch assignments',
        details: error.message
      })
      return
    }

    res.json({
      success: true,
      data: assignments || []
    })

  } catch (error) {
    console.error('Error in get organization assignments:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// PATCH /api/assignments/:id/status - Update assignment status
router.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    // Validate status
    const validStatuses = ['not started', 'in progress', 'complete']
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        error: 'Invalid status',
        validOptions: validStatuses
      })
      return
    }

    // Update assignment status
    const { data, error } = await supabase
      .from('assignments')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating assignment status:', error)
      res.status(500).json({
        error: 'Failed to update assignment status',
        details: error.message
      })
      return
    }

    res.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error in update assignment status:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/assignments/:id/stats/:userId - Get assignment statistics for a user
router.get('/:id/stats/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params

    if (!userId || !id) {
      res.status(400).json({
        error: 'Missing required parameters'
      })
      return
    }

    const userIdString: string = userId
    const assignmentId: number = parseInt(id)

    console.log('Fetching assignment stats:', { assignmentId, userId: userIdString })

    // Call the database function to get stats
    const { data, error } = await supabase
      .rpc('get_assignment_stats_for_user', {
        p_assignment_id: assignmentId,
        p_user_id: userIdString
      })

    if (error) {
      console.error('Error fetching assignment stats:', error)
      res.status(500).json({
        error: 'Failed to fetch assignment stats',
        details: error.message
      })
      return
    }

    // Extract the first row since RPC returns an array
    const stats = data && data.length > 0 ? data[0] : {
      total_attempts: 0,
      final_grade_percentage: null,
      final_grade_score: null,
      final_grade_max_score: null,
      last_attempt_time: null
    }

    res.json({
      success: true,
      data: {
        totalAttempts: stats.total_attempts || 0,
        finalGrade: {
          percentage: stats.final_grade_percentage,
          score: stats.final_grade_score,
          maxScore: stats.final_grade_max_score
        },
        lastAttemptTime: stats.last_attempt_time
      }
    })

  } catch (error) {
    console.error('Error in get assignment stats:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/assignments/:id/sessions/:userId - Get recent training sessions for an assignment
router.get('/:id/sessions/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params

    if (!userId || !id) {
      res.status(400).json({
        error: 'Missing required parameters'
      })
      return
    }

    const assignmentId: number = parseInt(id)

    // Fetch training sessions with their grades
    const { data: sessions, error } = await supabase
      .from('training_sessions')
      .select(`
        id,
        start_time,
        end_time,
        duration_seconds,
        submitted_for_review,
        session_grades (
          percentage,
          total_score
        )
      `)
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId)
      .order('end_time', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching sessions:', error)
      res.status(500).json({
        error: 'Failed to fetch sessions',
        details: error.message
      })
      return
    }

    // Format the response
    const formattedSessions = (sessions || []).map((session: any) => ({
      id: session.id,
      start_time: session.start_time,
      end_time: session.end_time,
      duration_seconds: session.duration_seconds,
      submitted_for_review: session.submitted_for_review || false,
      grade: session.session_grades && Array.isArray(session.session_grades) && session.session_grades.length > 0 ? {
        percentage: session.session_grades[0].percentage,
        score: session.session_grades[0].total_score
      } : null
    }))

    res.json({
      success: true,
      data: formattedSessions
    })

  } catch (error) {
    console.error('Error in get sessions:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/assignments/:id/complete - Mark assignment as complete with final stats
router.post('/:id/complete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!userId || typeof userId !== 'string' || !id) {
      res.status(400).json({
        error: 'Missing required parameters'
      })
      return
    }

    // Create explicitly typed variables after validation
    const userIdString: string = userId
    const assignmentId: number = parseInt(id)

    // First, get the stats
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_assignment_stats_for_user', {
        p_assignment_id: assignmentId,
        p_user_id: userIdString
      })

    if (statsError) {
      console.error('Error fetching stats before completion:', statsError)
    }

    const stats = statsData && statsData.length > 0 ? statsData[0] : null

    // Update assignment status to complete
    const { data, error } = await supabase
      .from('assignments')
      .update({ status: 'complete' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error completing assignment:', error)
      res.status(500).json({
        error: 'Failed to complete assignment',
        details: error.message
      })
      return
    }

    res.json({
      success: true,
      data: {
        assignment: data,
        stats: stats ? {
          totalAttempts: stats.total_attempts || 0,
          finalGrade: {
            percentage: stats.final_grade_percentage,
            score: stats.final_grade_score,
            maxScore: stats.final_grade_max_score
          }
        } : null
      }
    })

  } catch (error) {
    console.error('Error in complete assignment:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router

