import apiClient from './client';

export interface Tag {
    id: number;
    name: string;
    type: 'language' | 'tool' | 'general';
}

export const tagsApi = {
    getAll: () =>
        apiClient.get<Tag[]>('/tag'),
};