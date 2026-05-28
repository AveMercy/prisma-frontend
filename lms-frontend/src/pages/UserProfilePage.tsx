import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, Mail, Calendar, BookOpen, Users, CodeXml, Globe, MessageCircle, Phone, FileText, Clock } from 'lucide-react';

export default function UserProfilePage() {
    const { userId } = useParams<{ userId: string }>();

    const { data, isLoading } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => { const res = await userApi.getUserById(parseInt(userId!)); return res.data; },
        enabled: !!userId,
    });

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (!data?.user) return <div className="text-center py-20 text-muted-foreground">Пользователь не найден</div>;

    const user = data.user;
    const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    const group = (user as any).Group;

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Link to=".." className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ChevronLeft className="h-4 w-4" /> Назад
            </Link>

            {/* Основная информация */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.avatarUrl ? `http://localhost:5000${user.avatarUrl}` : undefined} />
                            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-2xl font-bold">{user.fullName}</h1>
                            <Badge variant="secondary" className="capitalize mt-1">
                                {user.role === 'student' ? 'Студент' : user.role === 'teacher' ? 'Преподаватель' : 'Админ'}
                            </Badge>
                            {user.bio && <p className="text-muted-foreground mt-3">{user.bio}</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>На платформе с <span className="font-medium">{new Date(user.createdAt).toLocaleDateString('ru-RU')}</span></span>
                        </div>
                        {group && (
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>Группа: <Link to="/my-group" className="font-medium text-primary hover:underline">{group.name}</Link></span>
                            </div>
                        )}
                        {user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>{user.phone}</span>
                            </div>
                        )}
                        {user.telegram && (
                            <div className="flex items-center gap-2 text-sm">
                                <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>@{user.telegram}</span>
                            </div>
                        )}
                        {user.github && (
                            <div className="flex items-center gap-2 text-sm">
                                <CodeXml className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                                    {user.github}
                                </a>
                            </div>
                        )}
                        {user.website && (
                            <div className="flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline truncate">
                                    {user.website}
                                </a>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* О себе */}
            {user.bio && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5" /> О себе
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
                    </CardContent>
                </Card>
            )}

            {/* Курсы */}
            {(user as any).courseEnrollments && (user as any).courseEnrollments.length > 0 && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5" /> Записан на курсы ({(user as any).courseEnrollments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {(user as any).courseEnrollments.map((e: any) => (
                                <Link
                                    key={e.course.id}
                                    to={`/course/${e.course.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-sm">{e.course.title}</span>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Статистика */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" /> Статистика
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-lg bg-muted">
                            <p className="text-2xl font-bold">{(user as any).courseEnrollments?.length || 0}</p>
                            <p className="text-xs text-muted-foreground">Курсов</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                            <p className="text-2xl font-bold">{group ? 1 : 0}</p>
                            <p className="text-xs text-muted-foreground">Групп</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                            <p className="text-2xl font-bold">{user.role === 'teacher' ? '👨‍🏫' : '🎓'}</p>
                            <p className="text-xs text-muted-foreground">Роль</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}