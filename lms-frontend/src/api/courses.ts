import apiClient from './client';

export interface Course {
    id: number;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    level: 'beginner' | 'intermediate' | 'advanced';
    categoryId: number | null;
    category: { id: number; name: string } | null;
    author: { fullName: string };
    _count: { modules: number };
    isPublished: boolean;
}

export interface CourseDetail extends Course {
    modules: {
        id: number;
        title: string;
        orderIndex: number;
        lectures: {
            id: number;
            title: string;
            type: 'theory' | 'practice' | 'quiz';
            isVisible: boolean;
        }[];
    }[];
}

export const coursesApi = {
    getAll: (params?: { categoryId?: number; level?: string }) =>
        apiClient.get<Course[]>('/courses', { params }),

    getMy: () =>
        apiClient.get<{ courses: Course[] }>('/courses/my'),

    getById: (id: number) =>
        apiClient.get<CourseDetail>(`/courses/${id}`),
};