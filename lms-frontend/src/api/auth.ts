import apiClient from './client';
import type { AuthResponse, User } from '@/types';

interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    role?: 'student' | 'teacher';
    inviteCode?: string;
}

interface LoginData {
    email: string;
    password: string;
}

export const authApi = {
    register: (data: RegisterData) =>
        apiClient.post<AuthResponse>('/auth/register', data),

    login: (data: LoginData) =>
        apiClient.post<AuthResponse>('/auth/login', data),

    getMe: () =>
        apiClient.get<{ user: User }>('/auth/me'),
};