import { useQuery } from '@tanstack/react-query';
import { githubApi } from '@/api/github';
import { ExternalLink, Star, GitFork } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function ReposList() {
    const { data, isLoading } = useQuery({
        queryKey: ['githubRepos'],
        queryFn: async () => { const res = await githubApi.getRepos(); return res.data.repos; },
    });

    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!data || data.length === 0) return <p className="text-sm text-muted-foreground">Нет репозиториев</p>;

    return (
        <div className="space-y-2">
            {data.slice(0, 5).map(repo => (
                <a key={repo.id} href={repo.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                    <div>
                        <p className="text-sm font-medium">{repo.name}</p>
                        <p className="text-xs text-muted-foreground">{repo.description}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {repo.language && <Badge variant="outline" className="text-xs">{repo.language}</Badge>}
                        <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stars}</span>
                    </div>
                </a>
            ))}
        </div>
    );
}