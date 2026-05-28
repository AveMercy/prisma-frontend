import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userApi, type UserProfile } from '@/api/user';
import { achievementsApi, type UserAchievement } from '@/api/achievements';
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
    Users, MessageCircle, CodeXml, Globe, Phone, FileText
} from 'lucide-react';

const achievementIcons: Record<string, React.ElementType> = {
    FIRST_LECTURE: BookOpen,
    FIVE_LECTURES: Zap,
    TWENTY_LECTURES: Award,
    FIFTY_LECTURES: Star,
    FIRST_COURSE: Star,
    FIVE_COURSES: BookOpen,
    TEN_REACTIONS: Award,
    PERFECT_GRADE: CheckCircle,
    FIRST_SUBMISSION: CheckCircle,
    FIVE_SUBMISSIONS: Award,
    JOIN_GROUP: Users,
    PROFILE_AVATAR: User,
    TEN_AI_QUESTIONS: Award,
    default: Trophy,
};
const defaultAvatars = ['🐱', '🐶', '🦊', '🐼', '🐨', '🦁'];

export default function ProfilePage() {
    const { user, fetchMe } = useAuthStore();
    const queryClient = useQueryClient();

    // Профиль
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [avatarPosition, setAvatarPosition] = useState('center');
    const [birthDate, setBirthDate] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [telegram, setTelegram] = useState('');
    const [github, setGithub] = useState('');
    const [website, setWebsite] = useState('');

    // Пароль
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => { const res = await userApi.getProfile(); return res.data; },
    });

    // Заполняем поля из профиля
    useState(() => {
        if (profile) {
            setBirthDate(profile.birthDate?.split('T')[0] || '');
            setBio(profile.bio || '');
            setPhone(profile.phone || '');
            setTelegram(profile.telegram || '');
            setGithub(profile.github || '');
            setWebsite(profile.website || '');
        }
    });

    const { data: userAchievements, isLoading: achievementsLoading } = useQuery({
        queryKey: ['userAchievements'],
        queryFn: async () => { const res = await achievementsApi.getUserAchievements(); return res.data; },
    });

    const { data: allAchievements } = useQuery({
        queryKey: ['allAchievements'],
        queryFn: async () => { const res = await achievementsApi.getAll(); return res.data; },
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
        onSuccess: () => {
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        },
    });

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/upload/single', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                setAvatarUrl(data.url);
                profileMutation.mutate({ avatarUrl: data.url });
            }
        } catch (err) { console.error('Ошибка загрузки:', err); }
    };

    const handleSaveProfile = () => {
        profileMutation.mutate({
            fullName,
            avatarUrl,
            birthDate: birthDate || null,
            bio,
            phone,
            telegram,
            github,
            website,
            settings: { ...user?.settings, avatarPosition },
        });
    };

    const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    const passwordsMatch = !confirmPassword || newPassword === confirmPassword;
    const earnedIds = new Set(userAchievements?.map((ua: UserAchievement) => ua.achievementId));

    const imgStyle = avatarPosition === 'top' ? 'object-top' : avatarPosition === 'bottom' ? 'object-bottom' : 'object-center';

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

            <Tabs defaultValue="profile">
                <TabsList className="mb-6">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" /> Профиль
                    </TabsTrigger>
                    <TabsTrigger value="password" className="flex items-center gap-2">
                        <Key className="h-4 w-4" /> Пароль
                    </TabsTrigger>
                    <TabsTrigger value="achievements" className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" /> Достижения
                    </TabsTrigger>
                </TabsList>

                {/* Профиль */}
                <TabsContent value="profile">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Профиль</CardTitle>
                                <CardDescription>Редактируйте личную информацию</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Аватар */}
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage
                                                src={avatarUrl ? `http://localhost:5000${avatarUrl}` : undefined}
                                                className={imgStyle}
                                            />
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
                                        <Badge variant="secondary" className="mt-1 capitalize">
                                            {user?.role === 'student' ? 'Студент' : 'Преподаватель'}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Стандартные аватарки */}
                                <div>
                                    <Label className="mb-2 block">Стандартные аватарки</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {defaultAvatars.map((emoji, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setAvatarUrl(`emoji:${emoji}`);
                                                    profileMutation.mutate({ avatarUrl: `emoji:${emoji}` });
                                                }}
                                                className={`w-12 h-12 rounded-full border-2 text-2xl flex items-center justify-center transition-all ${
                                                    avatarUrl === `emoji:${emoji}`
                                                        ? 'border-primary ring-2 ring-primary/20 bg-primary/10'
                                                        : 'border-transparent hover:border-muted-foreground bg-muted'
                                                }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                        <label className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Полное имя</Label>
                                        <Input value={fullName} onChange={e => setFullName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Дата рождения</Label>
                                        <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> Телефон</Label>
                                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (999) 123-45-67" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Telegram</Label>
                                        <Input value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="@username" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1"><CodeXml className="h-3 w-3" /> GitHub</Label>
                                        <Input value={github} onChange={e => setGithub(e.target.value)} placeholder="username" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1"><Globe className="h-3 w-3" /> Сайт</Label>
                                        <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1"><FileText className="h-3 w-3" /> О себе</Label>
                                    <Textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="Расскажите о себе..."
                                        className="min-h-[80px]"
                                    />
                                </div>

                                <Button onClick={handleSaveProfile} disabled={profileMutation.isPending}>
                                    {profileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    Сохранить
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Информация о группе и курсах */}
                        {profile && (
                            <div className="grid gap-6 sm:grid-cols-2">
                                {profile.group && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Users className="h-5 w-5" /> Моя группа
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="font-medium">{profile.group.name}</p>
                                            <Link to="/my-group" className="text-sm text-primary hover:underline mt-1 inline-block">
                                                Перейти к группе
                                            </Link>
                                        </CardContent>
                                    </Card>
                                )}
                                {profile.courseEnrollments && profile.courseEnrollments.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <BookOpen className="h-5 w-5" /> Мои курсы
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-1">
                                                {profile.courseEnrollments.slice(0, 5).map(e => (
                                                    <Link
                                                        key={e.course.id}
                                                        to={`/course/${e.course.id}`}
                                                        className="block text-sm text-muted-foreground hover:text-foreground hover:underline truncate"
                                                    >
                                                        {e.course.title}
                                                    </Link>
                                                ))}
                                                {profile.courseEnrollments.length > 5 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        + ещё {profile.courseEnrollments.length - 5}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Пароль */}
                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Смена пароля</CardTitle>
                            <CardDescription>Введите текущий и новый пароль</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Текущий пароль</Label>
                                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Новый пароль</Label>
                                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Подтвердите новый пароль</Label>
                                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={!passwordsMatch ? 'border-red-500' : ''} />
                                {!passwordsMatch && <p className="text-sm text-red-500">Пароли не совпадают</p>}
                            </div>
                            <Button onClick={() => passwordMutation.mutate()} disabled={!currentPassword || !newPassword || !passwordsMatch || passwordMutation.isPending}>
                                {passwordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Сменить пароль
                            </Button>
                            {passwordMutation.isSuccess && <p className="text-sm text-emerald-500 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Пароль изменён</p>}
                            {passwordMutation.isError && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Неверный пароль</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Достижения */}
                <TabsContent value="achievements">
                    {achievementsLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {allAchievements?.map(ach => {
                                const earned = earnedIds.has(ach.id);
                                const userAch = userAchievements?.find((ua: UserAchievement) => ua.achievementId === ach.id);
                                const Icon = achievementIcons[ach.requirementCode] || achievementIcons.default;
                                return (
                                    <Card key={ach.id} className={`transition-all ${earned ? 'border-primary/30' : 'opacity-60'}`}>
                                        <CardContent className="p-4 flex items-start gap-4">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${earned ? 'bg-primary/10' : 'bg-muted'}`}>
                                                {earned ? <Icon className="h-6 w-6 text-primary" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold">{ach.name}</h3>
                                                <p className="text-sm text-muted-foreground">{ach.description}</p>
                                                {earned && userAch && <p className="text-xs text-muted-foreground mt-1">Получено: {new Date(userAch.earnedAt).toLocaleDateString('ru-RU')}</p>}
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