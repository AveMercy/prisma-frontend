import { create } from 'zustand';
import type { User } from '@/types';
import { authApi } from '@/api/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isInitialized: boolean; // ДОБАВЬ

    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        email: string;
        password: string;
        fullName: string;
        role?: 'student' | 'teacher';
        inviteCode?: string;
    }) => Promise<void>;
    logout: () => void;
    fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    isAuthenticated: false,
    isInitialized: false, // ДОБАВЬ

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const { data } = await authApi.login({ email, password });
            localStorage.setItem('token', data.token);
            set({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
            });
        } catch (error) {
            set({ isLoading: false, isInitialized: true });
            throw error;
        }
    },

    register: async (registerData) => {
        set({ isLoading: true });
        try {
            const { data } = await authApi.register(registerData);
            localStorage.setItem('token', data.token);
            set({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
            });
        } catch (error) {
            set({ isLoading: false, isInitialized: true });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
    },

    fetchMe: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ isInitialized: true, isAuthenticated: false });
            return;
        }

        set({ isLoading: true });
        try {
            const { data } = await authApi.getMe();
            set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
            });
        } catch {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        }
    },
}));