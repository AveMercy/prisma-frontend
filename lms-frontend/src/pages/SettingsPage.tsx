import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/ThemeProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Moon, Eye, Bell, Globe, Shield } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const { user, fetchMe } = useAuthStore();
    const [showAchievements, setShowAchievements] = useState(user?.settings?.show_achievements ?? true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [publicProfile, setPublicProfile] = useState(false);

    const settingsMutation = useMutation({
        mutationFn: (settings: any) => userApi.updateProfile({ settings }),
        onSuccess: () => fetchMe(),
    });

    const handleToggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
        setter(value);
        const newSettings = {
            ...user?.settings,
            theme,
            show_achievements: key === 'show_achievements' ? value : showAchievements,
            email_notifications: key === 'email_notifications' ? value : emailNotifications,
            public_profile: key === 'public_profile' ? value : publicProfile,
        };
        settingsMutation.mutate(newSettings);
    };

    const [achievementNotifications, setAchievementNotifications] = useState(
        user?.settings?.achievement_notifications ?? true
    );

// В handleToggle:
    const handleToggleAchievementNotifications = (checked: boolean) => {
        setAchievementNotifications(checked);
        settingsMutation.mutate({
            ...user?.settings,
            theme,
            show_achievements: showAchievements,
            achievement_notifications: checked,
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Настройки</h1>

            <div className="space-y-6">
                {/* Интерфейс */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Moon className="h-5 w-5" /> Интерфейс
                        </CardTitle>
                        <CardDescription>Настройки внешнего вида</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Тёмная тема</h3>
                                <p className="text-sm text-muted-foreground">Переключить оформление</p>
                            </div>
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={() => {
                                    toggleTheme();
                                    settingsMutation.mutate({ ...user?.settings, theme: theme === 'dark' ? 'light' : 'dark' });
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Показывать достижения</h3>
                                <p className="text-sm text-muted-foreground">Отображать ачивки в профиле</p>
                            </div>
                            <Switch checked={showAchievements} onCheckedChange={v => handleToggle('show_achievements', v, setShowAchievements)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Уведомления */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" /> Уведомления
                        </CardTitle>
                        <CardDescription>Настройте получение уведомлений</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Email-уведомления</h3>
                                <p className="text-sm text-muted-foreground">Получать уведомления о новых заданиях</p>
                            </div>

                            <Switch checked={emailNotifications}
                                    onCheckedChange={v => handleToggle('email_notifications', v, setEmailNotifications)}/>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="font-medium">Уведомления о достижениях</h3>
                                    <p className="text-sm text-muted-foreground">Показывать всплывающие уведомления</p>
                                </div>
                            </div>
                            <Switch checked={achievementNotifications}
                                    onCheckedChange={handleToggleAchievementNotifications}/>
                        </div>
                    </CardContent>
                </Card>


                {/* Приватность */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5"/> Приватность
                        </CardTitle>
                        <CardDescription>Настройки конфиденциальности</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Публичный профиль</h3>
                                <p className="text-sm text-muted-foreground">Показывать профиль другим пользователям</p>
                            </div>
                            <Switch checked={publicProfile} onCheckedChange={v => handleToggle('public_profile', v, setPublicProfile)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Язык (заглушка) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" /> Язык
                        </CardTitle>
                        <CardDescription>Выберите язык интерфейса</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <span className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Русский</span>
                            <span className="px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground cursor-not-allowed">English (скоро)</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}