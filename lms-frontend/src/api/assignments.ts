import apiClient from './client';

export interface Assignment {
    id: number;
    lectureId: number;
    title: string;
    taskDescription: string | null;
    dueDate: string | null;
    submissions?: Submission[];
}

export interface Submission {
    id: number;
    assignmentId: number;
    studentId: number;
    solutionUrl: string | null;
    grade: number | null;
    feedback: string | null;
    submittedAt: string;
    student?: { id: number; fullName: string; email: string };
}

export interface AssignmentFull {
    id: number;
    title: string;
    taskDescription: string | null;
    dueDate: string | null;
    lecture: { id: number; title: string; module: { course: { id: number; title: string } } };
    submissions: Submission[];
}

export const assignmentsApi = {
    getByLecture: (lectureId: number) =>
        apiClient.get<Assignment[]>(`/assignments/lecture/${lectureId}`),

    create: (data: { lectureId: number; title: string; taskDescription?: string; dueDate?: string }) =>
        apiClient.post('/assignments', data),

    getMyAssignments: () =>
        apiClient.get<{ assignments: AssignmentFull[] }>('/assignments/my'),

    getTeacherAssignments: () =>
        apiClient.get<{ assignments: AssignmentFull[] }>('/assignments/teacher'),

    getSubmissions: (assignmentId: number) =>
        apiClient.get<{ submissions: Submission[] }>(`/assignments/submissions/${assignmentId}`),

    grade: (submissionId: number, grade: number, feedback?: string) =>
        apiClient.put(`/assignments/grade/${submissionId}`, { grade, feedback }),
};