import apiClient from './client';

export interface CodeReview {
    passed: boolean;
    syntaxOk: boolean;
    suggestions: string[];
    hint: string;
    rating: string;
}

export interface CodeIssue {
    severity: 'error' | 'warning' | 'info';
    line: number;
    message: string;
    suggestion: string;
}

export interface CodeReviewReport {
    passed: boolean;
    grade: number;
    summary: string;
    issues: CodeIssue[];
    positiveFeedback: string;
}


export const aiApi = {
    ask: (lectureId: number, question: string) =>
        apiClient.post<{ answer: string }>('/ai/ask', { lectureId, question }),
    reviewCode: (code: string, language: string, taskDescription?: string) =>
        apiClient.post<{ review: CodeReview }>('/ai/review-code', { code, language, taskDescription }),
    submitCodeReview: (code: string, language: string, lectureId: number) =>
        apiClient.post<{ review: CodeReviewReport }>('/ai/submit-review', { code, language, lectureId }),
    generateTest: (topic: string, questionCount: number) =>
        apiClient.post('/ai/generate-test', { topic, questionCount }),
};


