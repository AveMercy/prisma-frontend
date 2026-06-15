import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { GraduationCap, Eye, EyeOff, Loader2, Users, UserCircle } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export default function Register() {
    const navigate = useNavigate();
    const { register, isLoading } = useAuthStore();
    const [accountType, setAccountType] = useState<'student' | 'teacher'>('student');
    const [learningMode, setLearningMode] = useState<'solo' | 'group'>('solo');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await register({
                email,
                password,
                fullName,
                role: accountType,
                inviteCode: learningMode === 'group' ? inviteCode : undefined,
            });
            navigate('/onboarding');
        } catch (err) {
            const axiosError = err as AxiosError<ApiError>;
            setError(axiosError.response?.data?.error || 'Ошибка регистрации.');
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <GraduationCap className="mx-auto mb-4 h-12 w-12 text-primary" />
                    <CardTitle className="text-2xl">Регистрация</CardTitle>
                    <CardDescription>
                        Создайте аккаунт и начните обучение
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Тип аккаунта */}
                        <div className="space-y-2">
                            <Label>Тип аккаунта</Label>
                            <Tabs value={accountType} onValueChange={(v) => setAccountType(v as 'student' | 'teacher')}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="student" className="flex items-center gap-2">
                                        <UserCircle className="h-4 w-4" />
                                        Студент
                                    </TabsTrigger>
                                    <TabsTrigger value="teacher" className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Преподаватель
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Полное имя */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Полное имя</Label>
                            <Input
                                id="fullName"
                                placeholder="Иван Петров"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Пароль */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Режим обучения */}
                        {accountType === 'student' && (
                            <div className="space-y-2">
                                <Label>Формат обучения</Label>
                                <Tabs value={learningMode} onValueChange={(v) => setLearningMode(v as 'solo' | 'group')}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="solo">Самостоятельно</TabsTrigger>
                                        <TabsTrigger value="group">От организации</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="group" className="mt-3">
                                        <Label htmlFor="inviteCode" className="text-sm">Код приглашения группы</Label>
                                        <Input
                                            id="inviteCode"
                                            placeholder="например: 1-исип-22"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value)}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        )}

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Регистрация...
                                </>
                            ) : (
                                'Зарегистрироваться'
                            )}
                        </Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="font-medium text-primary hover:underline">
                            Войти
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}