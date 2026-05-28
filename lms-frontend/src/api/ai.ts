import apiClient from './client';

export interface CodeReview {
    passed: boolean;
    syntaxOk: boolean;
    suggestions: string[];
    hint: string;
    rating: string;
}

export const aiApi = {
    ask: (lectureId: number, question: string) =>
        apiClient.post<{ answer: string }>('/ai/ask', { lectureId, question }),
    reviewCode: (code: string, language: string, taskDescription?: string) =>
        apiClient.post<{ review: CodeReview }>('/ai/review-code', { code, language, taskDescription }),
};