"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
const supabase_1 = require("../config/supabase");
const renderer_1 = require("@react-pdf/renderer");
const react_1 = __importDefault(require("react"));
const TranscriptReport_1 = require("../pdf/TranscriptReport");
const router = express_1.default.Router();
async function gradeTranscriptWithRubric(exportData, cleanedTranscript) {
    if (!exportData.rubricCriteria || exportData.rubricCriteria.length === 0) {
        return {
            totalScore: 0,
            maxPossibleScore: 0,
            criteriaGrades: []
        };
    }
    try {
        const openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
        const rubricText = exportData.rubricCriteria.map(criteria => `- ${criteria.title}: ${criteria.description} (Max: ${criteria.maxPoints} points)`).join('\n');
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

Only return the JSON response, nothing else.`;
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
        });
        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error('No grading response received');
        }
        const gradingResult = JSON.parse(response);
        return gradingResult;
    }
    catch (error) {
        console.error('Error grading transcript with rubric:', error);
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
        };
    }
}
async function cleanTranscriptWithLLM(exportData) {
    try {
        const openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
        const rawTranscript = exportData.chunks.map(chunk => `${chunk.speaker}: ${chunk.text}`).join('\n');
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
`;
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
        });
        return completion.choices[0]?.message?.content || "Could not clean transcript.";
    }
    catch (error) {
        console.error('Error cleaning transcript with LLM:', error);
        return exportData.chunks.map(chunk => `${chunk.speaker}: ${chunk.text}`).join('\n');
    }
}
router.post('/transcript-pdf', async (req, res) => {
    try {
        const exportData = req.body;
        if (!exportData.chunks || exportData.chunks.length === 0) {
            return res.status(400).json({ error: 'No transcript data provided' });
        }
        exportData.startTime = new Date(exportData.startTime);
        exportData.endTime = new Date(exportData.endTime);
        exportData.chunks = exportData.chunks.map(chunk => ({
            ...chunk,
            timestamp: new Date(chunk.timestamp)
        }));
        console.log(`Processing transcript export for ${exportData.chunks.length} chunks`);
        const cleanedTranscript = await cleanTranscriptWithLLM(exportData);
        let gradingResult = null;
        if (exportData.rubricCriteria && exportData.rubricCriteria.length > 0) {
            const totalScore = exportData.rubricCriteria.reduce((sum, c) => sum + (c.earnedPoints || 0), 0);
            const maxPossibleScore = exportData.rubricCriteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0);
            console.log('Using rubric criteria passed from frontend:', { totalScore, maxPossibleScore, criteriaCount: exportData.rubricCriteria.length });
            gradingResult = {
                totalScore,
                maxPossibleScore,
                criteriaGrades: exportData.rubricCriteria
            };
        }
        else if (exportData.assignmentId && exportData.userId) {
            try {
                const { data: sessions } = await supabase_1.supabase
                    .from('training_sessions')
                    .select('id')
                    .eq('user_id', exportData.userId)
                    .eq('assignment_id', exportData.assignmentId)
                    .eq('call_id', exportData.callId)
                    .order('created_at', { ascending: false })
                    .limit(1);
                if (sessions && sessions.length > 0) {
                    const sessionId = sessions[0]?.id;
                    console.log('Found existing session:', sessionId);
                    const { data: grades } = await supabase_1.supabase
                        .from('session_grades')
                        .select('*')
                        .eq('session_id', sessionId)
                        .single();
                    if (grades) {
                        console.log('Found existing grade from DB, using it for PDF');
                        gradingResult = {
                            totalScore: grades.total_score,
                            maxPossibleScore: grades.max_possible_score,
                            criteriaGrades: grades.criteria_grades
                        };
                    }
                }
            }
            catch (error) {
                console.error('Error fetching existing grade:', error);
            }
        }
        console.log('Creating PDF element with data:', {
            templateTitle: exportData.templateTitle,
            hasDescription: !!exportData.templateDescription,
            hasAssignment: !!exportData.assignmentTitle,
            duration: exportData.duration,
            transcriptLength: cleanedTranscript.length,
            hasGrading: !!gradingResult,
            isAssignment: !!exportData.assignmentId,
        });
        const pdfElement = react_1.default.createElement(TranscriptReport_1.TranscriptReportDocument, {
            templateTitle: exportData.templateTitle || 'Training Session',
            templateDescription: exportData.templateDescription || '',
            assignmentTitle: exportData.assignmentTitle || '',
            startTime: exportData.startTime,
            endTime: exportData.endTime,
            duration: exportData.duration,
            cleanedTranscript,
            gradingResult: gradingResult || undefined,
            isAssignment: !!exportData.assignmentId,
        });
        console.log('PDF element created, starting render...');
        const chunks = [];
        const stream = await (0, renderer_1.renderToStream)(pdfElement);
        console.log('Stream created, collecting chunks...');
        await new Promise((resolve, reject) => {
            stream.on('data', (chunk) => {
                chunks.push(chunk);
                console.log(`Received chunk: ${chunk.length} bytes`);
            });
            stream.on('end', () => {
                console.log('Stream ended successfully');
                resolve();
            });
            stream.on('error', (error) => {
                console.error('Stream error:', error);
                reject(error);
            });
        });
        const pdfBuffer = Buffer.concat(chunks);
        console.log(`PDF generated successfully: ${pdfBuffer.length} bytes`);
        const filename = `training-session-${exportData.templateTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        return res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error exporting transcript to PDF:', error);
        return res.status(500).json({
            error: 'Failed to export transcript',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=export.js.map