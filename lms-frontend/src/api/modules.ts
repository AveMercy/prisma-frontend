import apiClient from './client';

export const modulesApi = {
    create: (data: { title: string; orderIndex: number; courseId: number }) =>
        apiClient.post('/modules', data).then(r => r.data),

    delete: (id: number) =>
        apiClient.delete(`/modules/${id}`).then(r => r.data),
};