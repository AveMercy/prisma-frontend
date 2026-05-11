export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserSettings {
    theme: 'light' | 'dark';
    show_achievements: boolean;
}

export interface User {
    id: number;
    email: string;
    fullName: string;
    role: UserRole;
    avatarUrl: string | null;
    settings: UserSettings;
    groupId: number | null;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface ApiError {
    error?: string;
    message?: string;
}
