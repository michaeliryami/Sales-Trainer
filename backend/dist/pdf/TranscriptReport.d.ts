import React from 'react';
interface CriteriaGrade {
    title: string;
    description: string;
    maxPoints: number;
    earnedPoints: number;
    evidence?: string[];
    reasoning: string;
}
interface TranscriptReportProps {
    templateTitle: string;
    templateDescription?: string;
    assignmentTitle?: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    cleanedTranscript: string;
    gradingResult?: {
        totalScore: number;
        maxPossibleScore: number;
        criteriaGrades: CriteriaGrade[];
    };
    isAssignment: boolean;
}
export declare const TranscriptReportDocument: ({ templateTitle, templateDescription, assignmentTitle, startTime, endTime, duration, cleanedTranscript, gradingResult, isAssignment, }: TranscriptReportProps) => React.JSX.Element;
export {};
//# sourceMappingURL=TranscriptReport.d.ts.map