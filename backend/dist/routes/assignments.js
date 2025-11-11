"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const router = (0, express_1.Router)();
router.get('/organization/:orgId', async (req, res) => {
    try {
        const { orgId } = req.params;
        console.log('Fetching assignments for organization:', orgId);
        const { data: assignments, error } = await supabase_1.supabase
            .from('assignments')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching assignments:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch assignments',
                details: error.message
            });
            return;
        }
        res.json({
            success: true,
            data: assignments || []
        });
    }
    catch (error) {
        console.error('Error in get organization assignments:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['not started', 'in progress', 'complete'];
        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({
                error: 'Invalid status',
                validOptions: validStatuses
            });
            return;
        }
        const { data, error } = await supabase_1.supabase
            .from('assignments')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Error updating assignment status:', error);
            res.status(500).json({
                error: 'Failed to update assignment status',
                details: error.message
            });
            return;
        }
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error in update assignment status:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/:id/stats/:userId', async (req, res) => {
    try {
        const { id, userId } = req.params;
        if (!userId || !id) {
            res.status(400).json({
                error: 'Missing required parameters'
            });
            return;
        }
        const userIdString = userId;
        const assignmentId = parseInt(id);
        console.log('Fetching assignment stats:', { assignmentId, userId: userIdString });
        const { data, error } = await supabase_1.supabase
            .rpc('get_assignment_stats_for_user', {
            p_assignment_id: assignmentId,
            p_user_id: userIdString
        });
        if (error) {
            console.error('Error fetching assignment stats:', error);
            res.status(500).json({
                error: 'Failed to fetch assignment stats',
                details: error.message
            });
            return;
        }
        const stats = data && data.length > 0 ? data[0] : {
            total_attempts: 0,
            final_grade_percentage: null,
            final_grade_score: null,
            final_grade_max_score: null,
            last_attempt_time: null
        };
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
        });
    }
    catch (error) {
        console.error('Error in get assignment stats:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/:id/sessions/:userId', async (req, res) => {
    try {
        const { id, userId } = req.params;
        if (!userId || !id) {
            res.status(400).json({
                error: 'Missing required parameters'
            });
            return;
        }
        const assignmentId = parseInt(id);
        const { data: sessions, error } = await supabase_1.supabase
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
            .limit(10);
        if (error) {
            console.error('Error fetching sessions:', error);
            res.status(500).json({
                error: 'Failed to fetch sessions',
                details: error.message
            });
            return;
        }
        const formattedSessions = (sessions || []).map((session) => ({
            id: session.id,
            start_time: session.start_time,
            end_time: session.end_time,
            duration_seconds: session.duration_seconds,
            submitted_for_review: session.submitted_for_review || false,
            grade: session.session_grades && Array.isArray(session.session_grades) && session.session_grades.length > 0 ? {
                percentage: session.session_grades[0].percentage,
                score: session.session_grades[0].total_score
            } : null
        }));
        res.json({
            success: true,
            data: formattedSessions
        });
    }
    catch (error) {
        console.error('Error in get sessions:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        if (!userId || typeof userId !== 'string' || !id) {
            res.status(400).json({
                error: 'Missing required parameters'
            });
            return;
        }
        const userIdString = userId;
        const assignmentId = parseInt(id);
        const { data: statsData, error: statsError } = await supabase_1.supabase
            .rpc('get_assignment_stats_for_user', {
            p_assignment_id: assignmentId,
            p_user_id: userIdString
        });
        if (statsError) {
            console.error('Error fetching stats before completion:', statsError);
        }
        const stats = statsData && statsData.length > 0 ? statsData[0] : null;
        const { data, error } = await supabase_1.supabase
            .from('assignments')
            .update({ status: 'complete' })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Error completing assignment:', error);
            res.status(500).json({
                error: 'Failed to complete assignment',
                details: error.message
            });
            return;
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
        });
    }
    catch (error) {
        console.error('Error in complete assignment:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=assignments.js.map