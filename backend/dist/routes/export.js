"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
const jspdf_1 = require("jspdf");
const router = express_1.default.Router();
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
        const doc = new jspdf_1.jsPDF();
        doc.setFont('helvetica');
        doc.setFontSize(18);
        doc.text('Call Transcript', 20, 30);
        doc.setFontSize(10);
        let yPos = 45;
        doc.text(`Template: ${exportData.templateTitle}`, 20, yPos);
        yPos += 8;
        doc.text(`Date: ${exportData.startTime.toLocaleDateString()} | Duration: ${Math.floor(exportData.duration / 60)}m ${exportData.duration % 60}s`, 20, yPos);
        yPos += 20;
        doc.setFontSize(12);
        doc.text('Conversation', 20, yPos);
        yPos += 15;
        doc.setFontSize(10);
        const conversationLines = cleanedTranscript.split('\n').filter(line => line.trim() !== '');
        for (const line of conversationLines) {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            if (line.startsWith('You:') || line.startsWith('AI Customer:')) {
                const [speaker, ...messageParts] = line.split(':');
                const message = messageParts.join(':').trim();
                doc.setFont('helvetica', 'bold');
                doc.text(`${speaker}:`, 20, yPos);
                yPos += 7;
                doc.setFont('helvetica', 'normal');
                const splitText = doc.splitTextToSize(message, 170);
                doc.text(splitText, 25, yPos);
                yPos += splitText.length * 5 + 8;
            }
            else {
                const splitText = doc.splitTextToSize(line, 170);
                doc.text(splitText, 20, yPos);
                yPos += splitText.length * 5 + 5;
            }
        }
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
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