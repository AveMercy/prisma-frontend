import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { GraduationCap, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            const axiosError = err as AxiosError<ApiError>;
            setError(axiosError.response?.data?.error || 'Ошибка входа. Проверьте данные.');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-background overflow-hidden">
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/5 blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative">
                <div className="text-center mb-8">

                    <h1 className="text-3xl font-black tracking-tight mb-1">Вход в Prisma</h1>
                    <p className="text-sm text-muted-foreground font-light">
                        Войдите, чтобы продолжить обучение
                    </p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-[2rem] pointer-events-none" />
                    <div className="bg-card/40 border border-border/50 backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 shadow-2xl overflow-hidden relative">

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-muted-foreground block pl-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-xs uppercase tracking-widest font-bold text-muted-foreground block pl-1">
                                    Пароль
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 dark:text-red-400 pl-1 animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </p>
                            )}

                            <div className="relative group/btn pt-2">
                                <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-xl blur-sm opacity-50 group-hover/btn:opacity-100 transition duration-300" />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-background transition-all active:scale-[0.99] text-sm disabled:opacity-80"
                                    style={{
                                        background: 'linear-gradient(var(--card), var(--card)) padding-box, linear-gradient(135deg, #3b82f6, #06b6d4, #3b82f6) border-box',
                                        border: '1px solid transparent',
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                            <span>Вход...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Войти в аккаунт</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <p className="mt-8 text-center text-sm text-muted-foreground font-light">
                            Нет аккаунта?{' '}
                            <Link to="/register" className="font-semibold text-foreground hover:text-blue-500 transition-colors underline underline-offset-4 decoration-border hover:decoration-blue-500">
                                Зарегистрироваться
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}