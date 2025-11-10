"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptReportDocument = void 0;
const react_1 = __importDefault(require("react"));
const renderer_1 = require("@react-pdf/renderer");
const styles = renderer_1.StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        paddingTop: 70,
        paddingBottom: 80,
        paddingHorizontal: 40,
        backgroundColor: '#ffffff',
    },
    header: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        height: 50,
        backgroundColor: '#f26f25',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 50,
    },
    headerLogo: {
        width: 120,
        height: 30,
        objectFit: 'contain',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: '#ffffff',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 50,
        right: 50,
        borderTopWidth: 2,
        borderTopColor: '#f26f25',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 9,
        color: '#666666',
    },
    pageNumber: {
        fontSize: 9,
        color: '#f26f25',
        fontWeight: 600,
    },
    titleSection: {
        marginBottom: 20,
        marginTop: 5,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 700,
        color: '#1a1a1a',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 6,
    },
    infoCard: {
        backgroundColor: '#fff5f0',
        borderRadius: 6,
        padding: 12,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#f26f25',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    infoLabel: {
        fontSize: 10,
        color: '#666666',
        fontWeight: 600,
        width: 120,
    },
    infoValue: {
        fontSize: 10,
        color: '#1a1a1a',
        flex: 1,
    },
    scoreSection: {
        backgroundColor: '#f26f25',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        marginTop: 5,
        alignItems: 'center',
    },
    scoreTitle: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: 600,
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scoreDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    scoreBig: {
        fontSize: 48,
        fontWeight: 700,
        color: '#ffffff',
    },
    scoreSmall: {
        fontSize: 24,
        color: '#ffffff',
        opacity: 0.9,
    },
    scorePercentage: {
        fontSize: 18,
        color: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        fontWeight: 600,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 700,
        color: '#1a1a1a',
        marginTop: 15,
        marginBottom: 12,
        paddingBottom: 6,
        borderBottomWidth: 2,
        borderBottomColor: '#f26f25',
    },
    conversationContainer: {
        marginBottom: 20,
    },
    messageBlock: {
        marginBottom: 10,
        paddingLeft: 8,
    },
    speakerYou: {
        fontSize: 11,
        fontWeight: 700,
        color: '#f26f25',
        marginBottom: 5,
    },
    speakerAI: {
        fontSize: 11,
        fontWeight: 700,
        color: '#2196F3',
        marginBottom: 5,
    },
    messageText: {
        fontSize: 10,
        color: '#333333',
        lineHeight: 1.5,
        paddingLeft: 10,
    },
    criteriaCard: {
        backgroundColor: '#ffffff',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    criteriaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    criteriaTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: '#1a1a1a',
        flex: 1,
    },
    criteriaScore: {
        fontSize: 14,
        fontWeight: 700,
        color: '#f26f25',
    },
    criteriaDescription: {
        fontSize: 9,
        color: '#666666',
        marginBottom: 10,
        lineHeight: 1.4,
    },
    evidenceSection: {
        marginTop: 10,
        backgroundColor: '#fafafa',
        padding: 10,
        borderRadius: 4,
    },
    evidenceLabel: {
        fontSize: 9,
        fontWeight: 600,
        color: '#1a1a1a',
        marginBottom: 5,
    },
    evidenceItem: {
        fontSize: 9,
        color: '#333333',
        marginBottom: 4,
        paddingLeft: 10,
        lineHeight: 1.4,
    },
    reasoningSection: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#fff5f0',
        borderLeftWidth: 3,
        borderLeftColor: '#f26f25',
        borderRadius: 4,
    },
    reasoningLabel: {
        fontSize: 9,
        fontWeight: 600,
        color: '#1a1a1a',
        marginBottom: 5,
    },
    reasoningText: {
        fontSize: 9,
        color: '#333333',
        lineHeight: 1.4,
    },
    badge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 10,
    },
    badgeText: {
        fontSize: 9,
        color: '#2e7d32',
        fontWeight: 600,
    },
});
const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
};
const getScoreColor = (percentage) => {
    if (percentage >= 85)
        return '#4caf50';
    if (percentage >= 70)
        return '#ff9800';
    return '#f44336';
};
const TranscriptReportDocument = ({ templateTitle, templateDescription, assignmentTitle, startTime, endTime, duration, cleanedTranscript, gradingResult, isAssignment, }) => {
    const conversationLines = cleanedTranscript
        .split('\n')
        .filter(line => line.trim() !== '');
    const scorePercentage = gradingResult
        ? Math.round((gradingResult.totalScore / gradingResult.maxPossibleScore) * 100)
        : 0;
    return (react_1.default.createElement(renderer_1.Document, null,
        react_1.default.createElement(renderer_1.Page, { size: "A4", style: styles.page },
            react_1.default.createElement(renderer_1.View, { style: styles.header, fixed: true },
                react_1.default.createElement(renderer_1.Text, { style: styles.headerTitle }, "CLOZONE AI"),
                react_1.default.createElement(renderer_1.Text, { style: { ...styles.headerTitle, fontSize: 12 } }, "Training Report")),
            react_1.default.createElement(renderer_1.View, { style: styles.footer, fixed: true },
                react_1.default.createElement(renderer_1.Text, { style: styles.footerText },
                    "\u00A9 ",
                    new Date().getFullYear(),
                    " Clozone AI - Sales Training Platform"),
                react_1.default.createElement(renderer_1.Text, { style: styles.pageNumber, render: ({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}` })),
            react_1.default.createElement(renderer_1.View, { style: styles.titleSection },
                react_1.default.createElement(renderer_1.Text, { style: styles.mainTitle }, isAssignment ? 'Assignment Report' : 'Training Session'),
                react_1.default.createElement(renderer_1.Text, { style: styles.subtitle }, templateTitle || 'Training Session'),
                assignmentTitle && assignmentTitle.trim() !== '' && (react_1.default.createElement(renderer_1.Text, { style: styles.subtitle },
                    "Assignment: ",
                    assignmentTitle))),
            react_1.default.createElement(renderer_1.View, { style: styles.infoCard },
                react_1.default.createElement(renderer_1.View, { style: styles.infoRow },
                    react_1.default.createElement(renderer_1.Text, { style: styles.infoLabel }, "Date"),
                    react_1.default.createElement(renderer_1.Text, { style: styles.infoValue }, formatDate(startTime))),
                react_1.default.createElement(renderer_1.View, { style: styles.infoRow },
                    react_1.default.createElement(renderer_1.Text, { style: styles.infoLabel }, "Start Time"),
                    react_1.default.createElement(renderer_1.Text, { style: styles.infoValue }, formatTime(startTime))),
                react_1.default.createElement(renderer_1.View, { style: styles.infoRow },
                    react_1.default.createElement(renderer_1.Text, { style: styles.infoLabel }, "End Time"),
                    react_1.default.createElement(renderer_1.Text, { style: styles.infoValue }, formatTime(endTime))),
                react_1.default.createElement(renderer_1.View, { style: styles.infoRow },
                    react_1.default.createElement(renderer_1.Text, { style: styles.infoLabel }, "Duration"),
                    react_1.default.createElement(renderer_1.Text, { style: styles.infoValue }, formatDuration(duration))),
                templateDescription && templateDescription.trim() !== '' && (react_1.default.createElement(renderer_1.View, { style: styles.infoRow },
                    react_1.default.createElement(renderer_1.Text, { style: styles.infoLabel }, "Description"),
                    react_1.default.createElement(renderer_1.Text, { style: styles.infoValue }, templateDescription)))),
            gradingResult && isAssignment && (react_1.default.createElement(renderer_1.View, { style: styles.scoreSection },
                react_1.default.createElement(renderer_1.Text, { style: styles.scoreTitle }, "Overall Performance Score"),
                react_1.default.createElement(renderer_1.View, { style: styles.scoreDisplay },
                    react_1.default.createElement(renderer_1.Text, { style: styles.scoreBig }, gradingResult.totalScore),
                    react_1.default.createElement(renderer_1.Text, { style: styles.scoreSmall },
                        "/",
                        gradingResult.maxPossibleScore)),
                react_1.default.createElement(renderer_1.Text, { style: styles.scorePercentage },
                    scorePercentage,
                    "%"))),
            react_1.default.createElement(renderer_1.Text, { style: styles.sectionHeader }, "Conversation Transcript"),
            react_1.default.createElement(renderer_1.View, { style: styles.conversationContainer }, conversationLines.map((line, index) => {
                if (!line || line.trim() === '')
                    return null;
                if (line.startsWith('You:')) {
                    const message = line.substring(4).trim();
                    if (!message)
                        return null;
                    return (react_1.default.createElement(renderer_1.View, { key: index, style: styles.messageBlock },
                        react_1.default.createElement(renderer_1.Text, { style: styles.speakerYou }, "You"),
                        react_1.default.createElement(renderer_1.Text, { style: styles.messageText }, message)));
                }
                else if (line.startsWith('AI Customer:')) {
                    const message = line.substring(12).trim();
                    if (!message)
                        return null;
                    return (react_1.default.createElement(renderer_1.View, { key: index, style: styles.messageBlock },
                        react_1.default.createElement(renderer_1.Text, { style: styles.speakerAI }, "AI Customer"),
                        react_1.default.createElement(renderer_1.Text, { style: styles.messageText }, message)));
                }
                else {
                    return (react_1.default.createElement(renderer_1.View, { key: index, style: styles.messageBlock },
                        react_1.default.createElement(renderer_1.Text, { style: styles.messageText }, line)));
                }
            }))),
        gradingResult && isAssignment && (react_1.default.createElement(renderer_1.Page, { size: "A4", style: styles.page },
            react_1.default.createElement(renderer_1.View, { style: styles.header, fixed: true },
                react_1.default.createElement(renderer_1.Text, { style: styles.headerTitle }, "CLOZONE AI"),
                react_1.default.createElement(renderer_1.Text, { style: { ...styles.headerTitle, fontSize: 12 } }, "Evaluation Criteria")),
            react_1.default.createElement(renderer_1.View, { style: styles.footer, fixed: true },
                react_1.default.createElement(renderer_1.Text, { style: styles.footerText },
                    "\u00A9 ",
                    new Date().getFullYear(),
                    " Clozone AI - Sales Training Platform"),
                react_1.default.createElement(renderer_1.Text, { style: styles.pageNumber, render: ({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}` })),
            react_1.default.createElement(renderer_1.Text, { style: styles.sectionHeader }, "Detailed Evaluation"),
            gradingResult.criteriaGrades.map((criteria, index) => {
                const criteriaPercentage = Math.round((criteria.earnedPoints / criteria.maxPoints) * 100);
                return (react_1.default.createElement(renderer_1.View, { key: index, style: styles.criteriaCard, wrap: false },
                    react_1.default.createElement(renderer_1.View, { style: styles.criteriaHeader },
                        react_1.default.createElement(renderer_1.Text, { style: styles.criteriaTitle }, criteria.title || 'Criteria'),
                        react_1.default.createElement(renderer_1.Text, { style: styles.criteriaScore },
                            criteria.earnedPoints || 0,
                            "/",
                            criteria.maxPoints || 0,
                            " pts")),
                    criteria.description && criteria.description.trim() !== '' && (react_1.default.createElement(renderer_1.Text, { style: styles.criteriaDescription }, criteria.description)),
                    criteria.evidence && criteria.evidence.length > 0 && (react_1.default.createElement(renderer_1.View, { style: styles.evidenceSection },
                        react_1.default.createElement(renderer_1.Text, { style: styles.evidenceLabel }, "Evidence from Transcript:"),
                        criteria.evidence.filter(e => e && e.trim() !== '').map((evidence, evidenceIndex) => (react_1.default.createElement(renderer_1.Text, { key: evidenceIndex, style: styles.evidenceItem },
                            "\u2022 \"",
                            evidence,
                            "\""))))),
                    criteria.reasoning && criteria.reasoning.trim() !== '' && (react_1.default.createElement(renderer_1.View, { style: styles.reasoningSection },
                        react_1.default.createElement(renderer_1.Text, { style: styles.reasoningLabel }, "Evaluation:"),
                        react_1.default.createElement(renderer_1.Text, { style: styles.reasoningText }, criteria.reasoning)))));
            })))));
};
exports.TranscriptReportDocument = TranscriptReportDocument;
//# sourceMappingURL=TranscriptReport.js.map