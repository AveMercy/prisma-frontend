import apiClient from './client';

export interface PracticeSubmission {
    id: number;
    lectureId: number;
    studentId: number;
    code: string;
    aiReview: any;
    grade: number | null;
    feedback: string | null;
    submittedAt: string;
    student?: { id: number; fullName: string; email: string; avatarUrl: string | null };
    lecture?: { id: number; title: string; module: { course: { id: number; title: string } } };
}

export const practiceApi = {
    submit: (lectureId: number, code: string, aiReview: any) =>
        apiClient.post('/practice/submit', { lectureId, code, aiReview }),

    getMySubmission: (lectureId: number) =>
        apiClient.get<{ submission: PracticeSubmission | null }>(`/practice/my/${lectureId}`),

    getSubmissionsByLecture: (lectureId: number) =>
        apiClient.get<{ submissions: PracticeSubmission[] }>(`/practice/submissions/${lectureId}`),

    grade: (id: number, grade: number, feedback?: string) =>
        apiClient.put(`/practice/grade/${id}`, { grade, feedback }),

    getMyGrades: () =>
        apiClient.get<{ submissions: PracticeSubmission[] }>('/practice/my-grades'),
    getAllSubmissions: () =>
        apiClient.get<{ submissions: PracticeSubmission[] }>('/practice/submissions/all'),
};