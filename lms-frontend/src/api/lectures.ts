import apiClient from './client';

export interface Lecture {
    id: number;
    title: string;
    content: string | null;
    type: 'theory' | 'practice' | 'quiz';
    orderIndex: number;
    isVisible: boolean;
    moduleId: number;
    module: {
        id: number;
        title: string;
        course: {
            id: number;
            title: string;
        };
    };
}

export const lecturesApi = {
    getById: (id: number) =>
        apiClient.get<Lecture>(`/lectures/${id}`).then(r => r.data),

    create: (data: {
        title: string;
        content: string;
        type?: string;
        orderIndex: number;
        moduleId: number;
    }) =>
        apiClient.post<Lecture>('/lectures', data).then(r => r.data),

    update: (id: number, data: Partial<{
        title: string;
        content: string;
        type: string;
        orderIndex: number;
        isVisible: boolean;
    }>) =>
        apiClient.put<Lecture>(`/lectures/${id}`, data).then(r => r.data),
    delete: (id: number) =>
        apiClient.delete(`/lectures/${id}`).then(r => r.data),
};