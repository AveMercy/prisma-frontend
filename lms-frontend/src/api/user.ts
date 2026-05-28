import apiClient from './client';

export interface UserProfile {
    id: number;
    email: string;
    fullName: string;
    role: string;
    avatarUrl: string | null;
    settings: any;
    createdAt: string;
    birthDate: string | null;
    bio: string | null;
    phone: string | null;
    telegram: string | null;
    github: string | null;
    website: string | null;
    group: { id: number; name: string } | null;
    courseEnrollments: { course: { id: number; title: string; level: string } }[];
}

export const userApi = {
    getProfile: () => apiClient.get<UserProfile>('/users/profile'),

    updateProfile: (data: any) => apiClient.put('/users/profile', data),

    changePassword: (currentPassword: string, newPassword: string) =>
        apiClient.put('/users/password', { currentPassword, newPassword }),

    getUserById: (id: number) => apiClient.get<{ user: UserProfile }>(`/users/${id}`),
};