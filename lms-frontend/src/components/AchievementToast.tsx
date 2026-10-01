import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { achievementsApi, type UserAchievement } from '@/api/achievements';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/card';
import { Trophy, Star, Zap, Award, BookOpen, CheckCircle, X, Sparkles } from 'lucide-react';

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
    JOIN_GROUP: Award,
    PROFILE_AVATAR: Star,
    default: Trophy,
};

export default function AchievementToast() {
    const { user } = useAuthStore();
    const [dismissed, setDismissed] = useState<Set<number>>(() => {
        try {
            const saved = localStorage.getItem('dismissed_achievements');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch { return new Set(); }
    });

    const showAchievements = user?.settings?.show_achievements ?? true;
    const showNotifications = user?.settings?.achievement_notifications ?? true;

    const { data } = useQuery({
        queryKey: ['newAchievements'],
        queryFn: async () => {
            const res = await achievementsApi.getNewAchievements();
            return res.data.achievements;
        },
        enabled: showAchievements && showNotifications,
    });

    const handleDismiss = (id: number) => {
        const updated = new Set([...dismissed, id]);
        setDismissed(updated);
        localStorage.setItem('dismissed_achievements', JSON.stringify([...updated]));
    };

    if (!showAchievements || !showNotifications || !data || data.length === 0) return null;

    const newOnes = data.filter(a => !dismissed.has(a.achievementId));
    if (newOnes.length === 0) return null;


    const latest = newOnes[0];
    const Icon = achievementIcons[latest.achievement.requirementCode] || achievementIcons.default;

    return (
        <div className="fixed bottom-20 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <Card className="p-4 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/10 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-sm max-w-sm">
                <div className="flex items-start gap-3">
                    <div className="relative">
                        <div
                            className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur-md opacity-40 animate-pulse"/>
                        <div
                            className="relative h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg">
                            <Icon className="h-6 w-6 text-white"/>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                            <Sparkles className="h-3 w-3 text-amber-400"/>
                            <span className="text-xs font-medium text-amber-400">Новое достижение!</span>
                        </div>
                        <p className="font-semibold text-sm">{latest.achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{latest.achievement.description}</p>
                    </div>
                    <button onClick={() => handleDismiss(latest.achievementId)}>
                        <X className="h-4 w-4"/>
                    </button>
                </div>
            </Card>
        </div>
    );
}