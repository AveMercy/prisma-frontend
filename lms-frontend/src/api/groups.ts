import apiClient from './client';

export interface GroupUser {
    id: number;
    fullName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
}

export interface Group {
    id: number;
    name: string;
    inviteCode: string;
    users: GroupUser[];
    _count?: { users: number };
}

export const groupsApi = {
    getMy: () => apiClient.get<{ group: Group | null }>('/groups/my'),

    getTeacher: () => apiClient.get<{ groups: Group[] }>('/groups/teacher'),

    getById: (id: number) => apiClient.get<{ group: Group }>(`/groups/${id}`),

    create: (name: string) => apiClient.post('/groups', { name }),

    join: (inviteCode: string) => apiClient.post('/groups/join', { inviteCode }),

    removeStudent: (groupId: number, studentId: number) =>
        apiClient.post('/groups/remove-student', { groupId, studentId }),
};