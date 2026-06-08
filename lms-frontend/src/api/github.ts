import apiClient from './client';

export interface Repo {
    id: number;
    name: string;
    description: string | null;
    url: string;
    stars: number;
    language: string | null;
    updatedAt: string;
}

export const githubApi = {
    push: (code: string, repoName: string, fileName?: string, commitMessage?: string) =>
        apiClient.post('/github/push', { code, repoName, fileName, commitMessage }),

    getRepos: () =>
        apiClient.get<{ repos: Repo[] }>('/github/repos'),
};