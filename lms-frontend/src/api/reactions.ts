import apiClient from './client';

export const reactionsApi = {
    set: (lectureId: number, reactionType: string) =>
        apiClient.post('/reactions', { lectureId, reactionType }),

    getByLecture: (lectureId: number) =>
        apiClient.get<Record<string, number>>(`/reactions/${lectureId}`),

    getMyReaction: (lectureId: number) =>
        apiClient.get<{ reactionType: string | null }>(`/reactions/my/${lectureId}`),
};