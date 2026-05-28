import apiClient from './client';

export interface Achievement {
    id: number;
    name: string;
    description: string | null;
    iconUrl: string | null;
    requirementCode: string;
}

export interface UserAchievement {
    userId: number;
    achievementId: number;
    achievement: Achievement;
    earnedAt: string;
}

export const achievementsApi = {
    getAll: () =>
        apiClient.get<Achievement[]>('/achievement'),

    getUserAchievements: (userId?: number) =>
        apiClient.get<UserAchievement[]>(
            userId ? `/achievement/user/${userId}` : '/achievement/user'
        ),
};