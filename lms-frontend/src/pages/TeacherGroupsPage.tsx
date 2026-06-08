import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { groupsApi } from '@/api/groups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage  } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Plus, Users, Copy, Check, UserMinus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherGroupsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [newGroupName, setNewGroupName] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['teacherGroups'],
        queryFn: async () => { const res = await groupsApi.getTeacher(); return res.data; },
    });

    const createMutation = useMutation({
        mutationFn: () => groupsApi.create(newGroupName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacherGroups'] });
            setIsCreateOpen(false);
            setNewGroupName('');
        },
    });

    const removeMutation = useMutation({
        mutationFn: ({ groupId, studentId }: { groupId: number; studentId: number }) =>
            groupsApi.removeStudent(groupId, studentId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacherGroups'] }),
    });

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Мои группы</h1>
                    <p className="text-muted-foreground mt-1">Управление учебными группами</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> Создать группу
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Новая группа</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Название группы</Label>
                                <Input
                                    value={newGroupName}
                                    onChange={e => setNewGroupName(e.target.value)}
                                    placeholder="1-ИСиП-22"
                                />
                            </div>
                            <Button onClick={() => createMutation.mutate()} disabled={!newGroupName}>
                                Создать
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            <div className="space-y-6">
                {data?.groups.map(group => (
                    <Card key={group.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-primary" />
                                    <CardTitle>{group.name}</CardTitle>
                                    <Badge variant="secondary">
                                        {group.users.filter(u => u.role === 'student').length} студентов
                                    </Badge>                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => copyCode(group.inviteCode)}>
                                        {copiedCode === group.inviteCode ? (
                                            <><Check className="h-3 w-3 mr-1" /> Скопировано</>
                                        ) : (
                                            <><Copy className="h-3 w-3 mr-1" /> {group.inviteCode}</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {group.users.filter(u => u.role === 'student').length === 0 && (
                                    <p className="text-sm text-muted-foreground">Нет студентов</p>
                                )}
                                {group.users.filter(u => u.role === 'student').map(student => (
                                    <div key={student.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted">
                                        <Link to={`/user/${student.id}`} className="flex items-center gap-3 flex-1">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={getImageUrl(student.avatarUrl)} />
                                                <AvatarFallback className="text-xs">
                                                    {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium hover:text-primary transition-colors">{student.fullName}</p>
                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                            </div>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => {
                                                if (confirm('Удалить студента из группы?')) {
                                                    removeMutation.mutate({ groupId: group.id, studentId: student.id });
                                                }
                                            }}
                                        >
                                            <UserMinus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {data?.groups.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Users className="mx-auto h-12 w-12 mb-4 opacity-30" />
                        <p>Нет созданных групп</p>
                    </div>
                )}
            </div>
        </div>
    );
}