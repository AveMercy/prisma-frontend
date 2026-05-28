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
    student?: {
        id: number;
        fullName: string;
        email: string;
    };
}

export const assignmentsApi = {
    getByLecture: (lectureId: number) =>
        apiClient.get<Assignment[]>(`/assignments/lecture/${lectureId}`),

    create: (data: {
        lectureId: number;
        title: string;
        taskDescription?: string;
        dueDate?: string;
    }) =>
        apiClient.post('/assignments', data),

    submit: (assignmentId: number, solutionUrl: string) =>
        apiClient.post('/assignments/submit', { assignmentId, solutionUrl }),

    getSubmissions: (assignmentId: number) =>
        apiClient.get<Submission[]>(`/assignments/submissions/${assignmentId}`),

    grade: (submissionId: number, grade: number, feedback?: string) =>
        apiClient.put(`/assignments/grade/${submissionId}`, { grade, feedback }),

    getMyAssignments: () =>
        apiClient.get<{ assignments: AssignmentFull[] }>('/assignments/my'),

    getTeacherAssignments: () =>
        apiClient.get<{ assignments: AssignmentFull[] }>('/assignments/teacher'),
};

export interface AssignmentFull {
    id: number;
    title: string;
    taskDescription: string | null;
    dueDate: string | null;
    lecture: {
        id: number;
        title: string;
        module: {
            id: number;
            title: string;
            course: { id: number; title: string };
        };
    };
    submissions: {
        id: number;
        grade: number | null;
        submittedAt: string;
        student?: { id: number; fullName: string };
    }[];
}