import apiClient from './client';

export interface ProgressData {
    progressPercentage: number;
    completed: number;
    total: number;
}

export const progressApi = {
    getMy: () =>
        apiClient.get<{ progress: any[] }>('/progress/my'),

    getByCourse: (courseId: number) =>
        apiClient.get<ProgressData>(`/progress/course/${courseId}`),

    toggle: (lectureId: number, isCompleted: boolean) =>
        apiClient.post('/progress/toggle', { lectureId, isCompleted }),
};