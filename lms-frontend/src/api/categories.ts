import apiClient from './client';

export interface Category {
    id: number;
    name: string;
    _count: { courses: number };
}

export const categoriesApi = {
    getAll: () =>
        apiClient.get<Category[]>('/category'),
};