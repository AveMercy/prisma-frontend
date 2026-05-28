import apiClient from './client';
import type { LectureBlock } from '@/types/lecture';

export const generatorApi = {
    generate: (text: string) =>
        apiClient.post<{ blocks: LectureBlock[] }>('/ai/generate', { text }),
};