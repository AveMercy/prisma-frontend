import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userApi } from '@/api/user';
import { achievementsApi, type UserAchievement } from '@/api/achievements';
import { githubApi, type Repo } from '@/api/github';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Loader2, Trophy, User, Key, Camera, Save, Award, Star, Zap,
    BookOpen, CheckCircle, Lock, AlertCircle, Upload, Calendar,
    Users, MessageCircle, ExternalLink, Globe, Phone, FileText, Code,
    GitFork, Sparkles,
} from 'lucide-react';

const achievementIcons: Record<string, React.ElementType> = {
    FIRST_LECTURE: BookOpen, FIRST_COURSE: Star, FIVE_LECTURES: Zap,
    ALL_THEORY: CheckCircle, REACTIONS: Award, PROFILE: User,
    TWENTY_LECTURES: Award, FIFTY_LECTURES: Star,
    FIRST_SUBMISSION: CheckCircle, FIVE_SUBMISSIONS: Award,
    TEN_REACTIONS: Award, PERFECT_GRADE: CheckCircle,
    JOIN_GROUP: Users, PROFILE_AVATAR: User,
    default: Trophy,
};

const achievementGradients: Record<string, string> = {
    FIRST_LECTURE: 'from-blue-400 to-blue-600',
    FIVE_LECTURES: 'from-cyan-400 to-teal-600',
    TWENTY_LECTURES: 'from-indigo-400 to-indigo-600',
    FIFTY_LECTURES: 'from-purple-400 to-purple-600',
    FIRST_COURSE: 'from-amber-400 to-orange-600',
    FIVE_COURSES: 'from-amber-400 to-yellow-600',
    TEN_REACTIONS: 'from-pink-400 to-rose-600',
    PERFECT_GRADE: 'from-emerald-400 to-green-600',
    FIRST_SUBMISSION: 'from-sky-400 to-blue-600',
    FIVE_SUBMISSIONS: 'from-violet-400 to-purple-600',
    JOIN_GROUP: 'from-teal-400 to-cyan-600',
    PROFILE_AVATAR: 'from-rose-400 to-pink-600',
};

const defaultAvatars = ['🐱', '🐶', '🦊', '🐼', '🐨', '🦁'];

export default function ProfilePage() {
    const { user, fetchMe } = useAuthStore();
    const queryClient = useQueryClient();

    const [fullName, setFullName] = useState(user?.fullName || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [avatarPosition, setAvatarPosition] = useState('center');
    const [birthDate, setBirthDate] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [telegram, setTelegram] = useState('');
    const [github, setGithub] = useState('');
    const [githubToken, setGithubToken] = useState('');
    const [website, setWebsite] = useState('');
    const [showToken, setShowToken] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => { const res = await userApi.getProfile(); return res.data; },
    });

    useEffect(() => {
        console.log('Profile data:', profile);
        if (profile) {
            setFullName(profile.fullName || '');
            setBirthDate(profile.birthDate?.split('T')[0] || '');
            setBio(profile.bio || '');
            setPhone(profile.phone || '');
            setTelegram(profile.telegram || '');
            setGithub(profile.github || '');
            setGithubToken(profile.githubToken || '');
            setWebsite(profile.website || '');
        }
    }, [profile]);

    const { data: userAchievements, isLoading: achievementsLoading } = useQuery({
        queryKey: ['userAchievements'],
        queryFn: async () => { const res = await achievementsApi.getUserAchievements(); return res.data; },
    });

    const { data: allAchievements } = useQuery({
        queryKey: ['allAchievements'],
        queryFn: async () => { const res = await achievementsApi.getAll(); return res.data; },
    });

    const { data: repos, isLoading: reposLoading, refetch: refetchRepos } = useQuery({
        queryKey: ['githubRepos'],
        queryFn: async () => { const res = await githubApi.getRepos(); return res.data.repos; },
        enabled: false,
    });

    const profileMutation = useMutation({
        mutationFn: (data: any) => userApi.updateProfile(data),
        onSuccess: () => {
            fetchMe();
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['userAchievements'] });
        },
    });

    const passwordMutation = useMutation({
        mutationFn: () => userApi.changePassword(currentPassword, newPassword),
        onSuccess: () => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); },
    });

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/upload/single', {
                method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
            });
            const data = await res.json();
            if (data.url) { setAvatarUrl(data.url); profileMutation.mutate({ avatarUrl: data.url }); }
        } catch (err) { console.error('Ошибка загрузки:', err); }
    };

    const handleSaveProfile = () => {
        profileMutation.mutate({
            fullName, avatarUrl, birthDate: birthDate || null,
            bio, phone, telegram, website,
            settings: { ...user?.settings, avatarPosition },
        });
    };

    const handleSaveGithub = async () => {
        await profileMutation.mutateAsync({ github, githubToken });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        if (github && githubToken) refetchRepos();
    };

    const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    const passwordsMatch = !confirmPassword || newPassword === confirmPassword;
    const earnedIds = new Set(userAchievements?.map((ua: UserAchievement) => ua.achievementId));

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

            <Tabs defaultValue="profile">
                <TabsList className="mb-6 flex-wrap">
                    <TabsTrigger value="profile"><User className="h-4 w-4 mr-1" />Профиль</TabsTrigger>
                    <TabsTrigger value="github"><GitFork className="h-4 w-4 mr-1" />GitHub</TabsTrigger>
                    <TabsTrigger value="password"><Key className="h-4 w-4 mr-1" />Пароль</TabsTrigger>
                    <TabsTrigger value="achievements"><Trophy className="h-4 w-4 mr-1" />Достижения</TabsTrigger>
                </TabsList>

                {/* ===== ПРОФИЛЬ ===== */}
                <TabsContent value="profile">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Личная информация</CardTitle><CardDescription>Редактируйте данные профиля</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={avatarUrl ? `http://localhost:5000${avatarUrl}` : undefined} />
                                            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                                        </Avatar>
                                        <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera className="h-6 w-6 text-white" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-lg">{user?.fullName}</h3>
                                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                                        <Badge variant="secondary" className="mt-1 capitalize">{user?.role === 'student' ? 'Студент' : 'Преподаватель'}</Badge>
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Стандартные аватарки</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {defaultAvatars.map((emoji, i) => (
                                            <button key={i} onClick={() => { setAvatarUrl(`emoji:${emoji}`); profileMutation.mutate({ avatarUrl: `emoji:${emoji}` }); }}
                                                    className={`w-12 h-12 rounded-full border-2 text-2xl flex items-center justify-center ${avatarUrl === `emoji:${emoji}` ? 'border-primary ring-2 ring-primary/20 bg-primary/10' : 'border-transparent hover:border-muted-foreground bg-muted'}`}>
                                                {emoji}
                                            </button>
                                        ))}
                                        <label className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary">
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2"><Label>Полное имя</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                                    <div className="space-y-2"><Label><Calendar className="h-3 w-3 inline mr-1" />Дата рождения</Label><Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></div>
                                    <div className="space-y-2"><Label><Phone className="h-3 w-3 inline mr-1" />Телефон</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (999) 123-45-67" /></div>
                                    <div className="space-y-2"><Label><MessageCircle className="h-3 w-3 inline mr-1" />Telegram</Label><Input value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="@username" /></div>
                                    <div className="space-y-2"><Label><Globe className="h-3 w-3 inline mr-1" />Сайт</Label><Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." /></div>
                                </div>

                                <div className="space-y-2"><Label><FileText className="h-3 w-3 inline mr-1" />О себе</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Расскажите о себе..." className="min-h-[80px]" /></div>

                                <Button onClick={handleSaveProfile} disabled={profileMutation.isPending}>
                                    {profileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Сохранить
                                </Button>
                            </CardContent>
                        </Card>

                        {profile?.group && (
                            <Card>
                                <CardHeader><CardTitle className="text-lg"><Users className="h-5 w-5 inline mr-1" />Моя группа</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="font-medium">{profile.group.name}</p>
                                    <Link to="/my-group" className="text-sm text-primary hover:underline mt-1 inline-block">Перейти к группе</Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* ===== GITHUB ===== */}
                <TabsContent value="github">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Интеграция с GitHub</CardTitle><CardDescription>Настройте доступ к вашим репозиториям</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label><ExternalLink className="h-3 w-3 inline mr-1" />GitHub username</Label>
                                    <Input value={github} onChange={e => setGithub(e.target.value)} placeholder="username" autoComplete="off" name="github_user" data-lpignore="true" />
                                </div>
                                <div className="space-y-2">
                                    <Label><Code className="h-3 w-3 inline mr-1" />Персональный токен</Label>
                                    <div className="relative">
                                        <Input type={showToken ? 'text' : 'password'} value={githubToken} onChange={e => setGithubToken(e.target.value)} placeholder="ghp_..." autoComplete="new-password" name="github_token_field" data-lpignore="true" />
                                        <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">
                                            {showToken ? 'Скрыть' : 'Показать'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Создайте в GitHub → Settings → Developer settings → Tokens (classic). Права: <strong>repo</strong></p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleSaveGithub} disabled={profileMutation.isPending}>
                                        {profileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Сохранить
                                    </Button>
                                    {github && githubToken && (
                                        <Button variant="outline" onClick={() => refetchRepos()}>
                                            <GitFork className="h-4 w-4 mr-2" />Загрузить репозитории
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {reposLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                        ) : repos && repos.length > 0 ? (
                            <Card>
                                <CardHeader><CardTitle className="text-lg"><GitFork className="h-5 w-5 mr-1" />Мои репозитории</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {repos.map((repo: Repo) => (
                                            <a key={repo.id} href={repo.url} target="_blank" rel="noopener noreferrer"
                                               className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border/50">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{repo.name}</p>
                                                    {repo.description && <p className="text-xs text-muted-foreground truncate">{repo.description}</p>}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground ml-3">
                                                    {repo.language && <Badge variant="outline" className="text-xs">{repo.language}</Badge>}
                                                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />{repo.stars}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>
                </TabsContent>

                {/* ===== ПАРОЛЬ ===== */}
                <TabsContent value="password">
                    <Card>
                        <CardHeader><CardTitle>Смена пароля</CardTitle><CardDescription>Введите текущий и новый пароль</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2"><Label>Текущий пароль</Label><Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" /></div>
                            <div className="space-y-2"><Label>Новый пароль</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" /></div>
                            <div className="space-y-2"><Label>Подтвердите</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={!passwordsMatch ? 'border-red-500' : ''} autoComplete="new-password" />
                                {!passwordsMatch && <p className="text-sm text-red-500">Пароли не совпадают</p>}
                            </div>
                            <Button onClick={() => passwordMutation.mutate()} disabled={!currentPassword || !newPassword || !passwordsMatch || passwordMutation.isPending}>
                                {passwordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Сменить пароль
                            </Button>
                            {passwordMutation.isSuccess && <p className="text-sm text-emerald-500"><CheckCircle className="h-4 w-4 inline mr-1" />Пароль изменён</p>}
                            {passwordMutation.isError && <p className="text-sm text-red-500"><AlertCircle className="h-4 w-4 inline mr-1" />Неверный пароль</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ===== ДОСТИЖЕНИЯ ===== */}
                <TabsContent value="achievements">
                    {achievementsLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {allAchievements?.map(ach => {
                                const earned = earnedIds.has(ach.id);
                                const userAch = userAchievements?.find((ua: UserAchievement) => ua.achievementId === ach.id);
                                const Icon = achievementIcons[ach.requirementCode] || achievementIcons.default;
                                const gradient = achievementGradients[ach.requirementCode] || 'from-gray-400 to-gray-600';

                                return (
                                    <Card key={ach.id} className={`relative overflow-hidden transition-all duration-300 ${earned ? 'border-0 shadow-lg hover:shadow-xl hover:-translate-y-1' : 'opacity-40 grayscale'}`}>
                                        {earned && <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />}
                                        <CardContent className="p-5 flex items-start gap-4 relative">
                                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${earned ? `bg-gradient-to-br ${gradient} text-white` : 'bg-muted text-muted-foreground'}`}>
                                                {earned ? <Icon className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold">{ach.name}</h3>
                                                    {earned && <Sparkles className="h-4 w-4 text-amber-400" />}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{ach.description}</p>
                                                {earned && userAch && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className={`h-1.5 flex-1 rounded-full bg-gradient-to-r ${gradient} opacity-30`}>
                                                            <div className={`h-full w-full rounded-full bg-gradient-to-r ${gradient}`} />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                            {new Date(userAch.earnedAt).toLocaleDateString('ru-RU')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}