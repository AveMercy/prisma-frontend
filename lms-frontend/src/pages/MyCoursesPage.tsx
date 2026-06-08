import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coursesApi, type Course } from '@/api/courses';
import { progressApi } from '@/api/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Loader2, Star, Archive, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const levelLabels = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
};

const levelColors = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
} as const;

const tabs = [
    { value: 'active', label: 'Активные', icon: BookOpen },
    { value: 'favorite', label: 'Избранное', icon: Star },
    { value: 'archived', label: 'Архив', icon: Archive },
] as const;

type StatusFilter = (typeof tabs)[number]['value'];

function CourseCard({ course, onAction }: { course: Course & { enrollment?: { status: string } }; onAction: () => void }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: progress } = useQuery({
        queryKey: ['progress', course.id],
        queryFn: async () => {
            const res = await progressApi.getByCourse(course.id);
            return res.data;
        },
        enabled: course._count.modules > 0,
    });

    const unenrollMutation = useMutation({
        mutationFn: () => coursesApi.unenroll(course.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myCourses'] });
            toast.success('Курс убран из вашего списка');
        },
        onError: () => toast.error('Не удалось убрать курс'),
    });

    const statusMutation = useMutation({
        mutationFn: (status: 'active' | 'favorite' | 'archived') =>
            coursesApi.updateStatus(course.id, status),
        onSuccess: (_, status) => {
            queryClient.invalidateQueries({ queryKey: ['myCourses'] });
            const messages: Record<string, string> = {
                favorite: 'Добавлено в избранное ⭐',
                archived: 'Перемещено в архив 📦',
                active: 'Восстановлено из архива',
            };
            toast.success(messages[status] || 'Статус обновлён');
        },
        onError: () => toast.error('Не удалось обновить статус'),
    });

    const currentStatus = course.enrollment?.status || 'active';
    const isFavorite = currentStatus === 'favorite';
    const isArchived = currentStatus === 'archived';

    return (
        <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
            onClick={() => navigate(`/course/${course.id}`)}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                statusMutation.mutate(isFavorite ? 'active' : 'favorite');
                            }}
                            className={`p-1 rounded-lg transition-all ${
                                isFavorite
                                    ? 'text-yellow-500 hover:text-yellow-600'
                                    : 'text-muted-foreground/30 hover:text-yellow-500'
                            }`}
                            title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                        >
                            <Star className={`h-5 w-5 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                        </button>
                        <Badge variant="secondary" className={levelColors[course.level]}>
                            {levelLabels[course.level]}
                        </Badge>
                    </div>
                </div>

                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course._count.modules} модулей
                    </span>
                    <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {course.author?.fullName || 'Преподаватель'}
                    </span>
                </div>

                {course.category && (
                    <Badge variant="outline" className="mt-3">
                        {course.category.name}
                    </Badge>
                )}

                {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {course.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                                {tag.name}
                            </Badge>
                        ))}
                        {course.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{course.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}

                {progress && progress.total > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Прогресс</span>
                            <span>{progress.progressPercentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${progress.progressPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mt-4 pt-3 border-t border-border/50">
                    {isArchived ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                statusMutation.mutate('active');
                            }}
                        >
                            <Archive className="h-3 w-3 mr-1" />
                            Восстановить
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                statusMutation.mutate('archived');
                            }}
                        >
                            <Archive className="h-3 w-3 mr-1" />
                            В архив
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted-foreground ml-auto"
                        onClick={(e) => {
                            e.stopPropagation();
                            unenrollMutation.mutate();
                        }}
                    >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Убрать
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function MyCoursesPage() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['myCourses'],
        queryFn: async () => {
            const res = await coursesApi.getMy();
            return res.data;
        },
    });

    const filteredCourses = (data?.courses || []).filter((course: any) => {
        const status = course.enrollment?.status || 'active';
        if (statusFilter === 'active') return status !== 'archived';
        if (statusFilter === 'favorite') return status === 'favorite';
        if (statusFilter === 'archived') return status === 'archived';
        return true;
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Мои курсы</h1>
                <p className="text-muted-foreground mt-1">
                    Продолжайте обучение с того места, где остановились
                </p>
            </div>

            <div className="flex gap-2 mb-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const count = (data?.courses || []).filter((c: any) => {
                        const s = c.enrollment?.status || 'active';
                        if (tab.value === 'active') return s !== 'archived';
                        if (tab.value === 'favorite') return s === 'favorite';
                        if (tab.value === 'archived') return s === 'archived';
                        return false;
                    }).length;
                    return (
                        <Button
                            key={tab.value}
                            variant={statusFilter === tab.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(tab.value)}
                            className="gap-1.5"
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {tab.label}
                            {count > 0 && (
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                                    {count}
                                </Badge>
                            )}
                        </Button>
                    );
                })}
            </div>

            {isLoading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {isError && (
                <div className="text-center py-20 text-muted-foreground">
                    Ошибка загрузки курсов
                </div>
            )}

            {!isLoading && !isError && filteredCourses.length === 0 && (
                <div className="text-center py-20">
                    <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                        {statusFilter === 'active' && 'Нет активных курсов'}
                        {statusFilter === 'favorite' && 'Нет избранных курсов'}
                        {statusFilter === 'archived' && 'Архив пуст'}
                    </h2>
                    <p className="text-muted-foreground">
                        {statusFilter === 'active' && 'Перейдите в каталог, чтобы найти интересные курсы'}
                        {statusFilter === 'favorite' && 'Добавляйте курсы в избранное для быстрого доступа'}
                        {statusFilter === 'archived' && 'В архиве хранятся завершённые курсы'}
                    </p>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course: any) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        onAction={() => queryClient.invalidateQueries({ queryKey: ['myCourses'] })}
                    />
                ))}
            </div>
        </div>
    );
}