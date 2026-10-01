import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/api/groups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage  } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, LogIn, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '@/lib/utils';


export default function MyGroupPage() {
    const queryClient = useQueryClient();
    const [inviteCode, setInviteCode] = useState('');
    const [copied, setCopied] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['myGroup'],
        queryFn: async () => { const res = await groupsApi.getMy(); return res.data; },
    });

    const joinMutation = useMutation({
        mutationFn: () => groupsApi.join(inviteCode),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myGroup'] });
            setInviteCode('');
        },
    });

    const group = data?.group;

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" /> Присоединиться к группе
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Введите код приглашения, полученный от преподавателя
                        </p>
                        <Input
                            value={inviteCode}
                            onChange={e => setInviteCode(e.target.value)}
                            placeholder="Код группы"
                        />
                        <Button
                            onClick={() => joinMutation.mutate()}
                            disabled={!inviteCode || joinMutation.isPending}
                            className="w-full"
                        >
                            {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                            Присоединиться
                        </Button>
                        {joinMutation.isError && (
                            <p className="text-sm text-destructive">Группа не найдена или вы уже в группе</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Моя группа</h1>
                    <p className="text-muted-foreground mt-1">{group.name}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" /> Одногруппники ({group.users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {group.users.map(u => (
                            <Link
                                to={`/user/${u.id}`}
                                key={u.id}
                                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted"
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={getImageUrl(u.avatarUrl) || undefined} />
                                    <AvatarFallback>
                                        {u.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{u.fullName}</p>
                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                </div>
                                <Badge variant="secondary" className="capitalize">
                                    {u.role === 'teacher' ? 'Преподаватель' : 'Студент'}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}