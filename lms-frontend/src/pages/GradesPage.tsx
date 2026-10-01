import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { practiceApi, type PracticeSubmission } from '@/api/practice';
import { assignmentsApi } from '@/api/assignments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, BookOpen, Code, FileText, ChevronRight, TrendingUp } from 'lucide-react';

const gradeInfo: Record<number, { label: string; color: string; bg: string }> = {
    5: { label: 'Отлично', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    4: { label: 'Хорошо', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    3: { label: 'Удовлетворительно', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    2: { label: 'Неудовлетворительно', color: 'text-red-500', bg: 'bg-red-500/10' },
};

export default function GradesPage() {
    // Практические
    const { data: practiceSubmissions = [], isLoading: loadingPractice } = useQuery({
        queryKey: ['myGrades'],
        queryFn: async () => {
            const res = await practiceApi.getMyGrades();
            return res.data?.submissions || [];
        },
    });

    // Обычные задания
    const { data: assignmentsData = [], isLoading: loadingAssignments } = useQuery({
        queryKey: ['myAssignments'],
        queryFn: async () => {
            const res = await assignmentsApi.getMyAssignments();
            const data = res.data;
            return Array.isArray(data) ? data : data?.assignments || [];
        },
    });

    const isLoading = loadingPractice || loadingAssignments;

    // Обычные задания с оценками

    const gradedAssignments = (assignmentsData || []).filter((a: any) => a.submissions?.[0]?.grade != null);
    const pendingAssignments = (assignmentsData || []).filter((a: any) => a.submissions?.[0] && a.submissions[0].grade == null);

    // Статистика
    const allGrades = [
        ...practiceSubmissions.map((s: any) => s.grade).filter(Boolean),
        ...gradedAssignments.map((a: any) => a.submissions[0].grade),
    ];
    const average = allGrades.length > 0
        ? (allGrades.reduce((sum: number, g: number) => sum + g, 0) / allGrades.length).toFixed(1)
        : null;

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const hasData = practiceSubmissions.length > 0 || gradedAssignments.length > 0;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Успеваемость</h1>
            <p className="text-muted-foreground mb-8">Ваши оценки за все работы</p>

            {/* Статистика */}
            {hasData && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-card/50">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-primary">{allGrades.length}</div>
                            <div className="text-xs text-muted-foreground">Всего оценок</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-primary">{average || '—'}</div>
                            <div className="text-xs text-muted-foreground">Средний балл</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-500">
                                {allGrades.filter((g: number) => g >= 4).length}
                            </div>
                            <div className="text-xs text-muted-foreground">4 и 5</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-amber-500">{pendingAssignments.length}</div>
                            <div className="text-xs text-muted-foreground">На проверке</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!hasData && (
                <div className="text-center py-20 text-muted-foreground">
                    <Star className="mx-auto h-12 w-12 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Нет оценок</p>
                    <p className="text-sm mt-1">Сдайте практические работы или задания, чтобы увидеть оценки</p>
                </div>
            )}

            {/* Практические */}
            {practiceSubmissions.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Code className="h-5 w-5 text-amber-500" />
                        Практические работы
                    </h2>
                    <div className="space-y-2">
                        {practiceSubmissions.map((sub: any) => (
                            <GradeCard
                                key={sub.id}
                                title={sub.lecture?.title || 'Практическая работа'}
                                course={sub.lecture?.module?.course?.title}
                                grade={sub.grade}
                                date={sub.submittedAt}
                                type="practice"
                                aiGrade={sub.aiReview?.grade}
                                courseId={sub.lecture?.module?.course?.id}
                                lectureId={sub.lectureId}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Обычные задания с оценками */}
            {gradedAssignments.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        Обычные задания
                    </h2>
                    <div className="space-y-2">
                        {gradedAssignments.map((a: any) => (
                            <GradeCard
                                key={a.id}
                                title={a.title}
                                course={a.lecture?.module?.course?.title}
                                grade={a.submissions[0].grade}
                                date={a.submissions[0].submittedAt}
                                type="assignment"
                                courseId={a.lecture?.module?.course?.id}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function GradeCard({
                       title, course, grade, date, type, aiGrade, courseId, lectureId,
                   }: {
    title: string;
    course?: string;
    grade: number | null;
    date: string;
    type: 'practice' | 'assignment';
    aiGrade?: number;
    courseId?: number;
    lectureId?: number;
}) {
    const info = grade ? gradeInfo[grade] : null;
    const link = type === 'practice' && courseId && lectureId
        ? `/course/${courseId}/practice/${lectureId}`
        : `/course/${courseId}`;

    return (
        <Link to={link || '#'}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                            type === 'practice' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                        }`}>
                            {type === 'practice' ? (
                                <Code className="h-5 w-5 text-amber-500" />
                            ) : (
                                <FileText className="h-5 w-5 text-blue-500" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {course && <span className="truncate">{course}</span>}
                                <span>·</span>
                                <span>{new Date(date).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                        {grade ? (
                            <Badge className={`text-sm font-bold px-3 py-1 ${info?.bg} ${info?.color}`}>
                                {grade}/5
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-xs">Ожидает</Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}