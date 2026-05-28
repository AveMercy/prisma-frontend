import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coursesApi, type Course } from '@/api/courses';
import { progressApi } from '@/api/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, GraduationCap, Loader2 } from 'lucide-react';

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

function CourseCard({ course }: { course: Course }) {
    const navigate = useNavigate();

    const { data: progress } = useQuery({
        queryKey: ['progress', course.id],
        queryFn: async () => {
            const res = await progressApi.getByCourse(course.id);
            return res.data;
        },
        enabled: course._count.modules > 0,
    });

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
                    <Badge variant="secondary" className={levelColors[course.level]}>
                        {levelLabels[course.level]}
                    </Badge>
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
                        {course.author.fullName}
                    </span>
                </div>

                {/* Категория */}
                {course.category && (
                    <Badge variant="outline" className="mt-3">
                        {course.category.name}
                    </Badge>
                )}

                {/* Теги */}
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
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['myCourses'],
        queryFn: async () => {
            const res = await coursesApi.getMy();
            return res.data;
        },
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Мои курсы</h1>
                <p className="text-muted-foreground mt-1">
                    Продолжайте обучение с того места, где остановились
                </p>
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

            {!isLoading && !isError && data?.courses.length === 0 && (
                <div className="text-center py-20">
                    <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Нет курсов</h2>
                    <p className="text-muted-foreground">
                        Перейдите в каталог, чтобы найти интересные курсы
                    </p>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data?.courses.map((course: Course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </div>
    );
}