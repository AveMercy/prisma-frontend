import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assignmentsApi, type AssignmentFull } from '@/api/assignments';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ClipboardList, Clock, CheckCircle, AlertCircle, BookOpen, ChevronRight, Users } from 'lucide-react';

export default function AssignmentsPage() {
    const { user } = useAuthStore();
    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

    const { data, isLoading } = useQuery({
        queryKey: ['assignments-list', isTeacher],
        queryFn: async () => {
            const res = isTeacher
                ? await assignmentsApi.getTeacherAssignments()
                : await assignmentsApi.getMyAssignments();
            return res.data;
        },
    });

    const assignments = data?.assignments || [];

    const getStatus = (a: AssignmentFull) => {
        if (!a.dueDate) return null;
        const now = new Date();
        const due = new Date(a.dueDate);
        if (due < now) return 'expired';
        if (due.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'soon';
        return 'active';
    };

    const getSubmissionStatus = (a: AssignmentFull) => {
        if (a.submissions.length > 0) {
            const sub = a.submissions[0];
            return sub.grade !== null ? 'graded' : 'submitted';
        }
        return 'pending';
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Задания</h1>
                    <p className="text-muted-foreground mt-1">
                        {isTeacher ? 'Задания ваших курсов' : 'Ваши активные задания'}
                    </p>
                </div>
                {!isTeacher && (
                    <Badge variant="secondary" className="text-sm">
                        {assignments.filter(a => getSubmissionStatus(a) === 'pending').length} ожидают сдачи
                    </Badge>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {!isLoading && assignments.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <ClipboardList className="mx-auto h-12 w-12 mb-4 opacity-30" />
                    <p>{isTeacher ? 'Нет созданных заданий' : 'Нет активных заданий'}</p>
                </div>
            )}

            <div className="space-y-4">
                {assignments.map((a) => {
                    const status = getStatus(a);
                    const subStatus = getSubmissionStatus(a);
                    return (
                        <Card key={a.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold truncate">{a.title}</h3>
                                            {status === 'expired' && (
                                                <Badge variant="destructive" className="text-xs">Просрочено</Badge>
                                            )}
                                            {status === 'soon' && (
                                                <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-500">Скоро дедлайн</Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-3 w-3" />
                                                {a.lecture.module.course.title}
                                            </span>
                                            <span>→</span>
                                            <span className="truncate">{a.lecture.title}</span>
                                        </div>

                                        {a.taskDescription && (
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{a.taskDescription}</p>
                                        )}

                                        <div className="flex items-center gap-4 mt-3">
                                            {a.dueDate && (
                                                <span className={`text-xs flex items-center gap-1 ${status === 'expired' ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(a.dueDate).toLocaleDateString('ru-RU')}
                                                </span>
                                            )}

                                            {/* Статус сдачи (студент) */}
                                            {!isTeacher && (
                                                subStatus === 'submitted' ? (
                                                    <span className="text-xs text-emerald-500 flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" /> Сдано
                                                    </span>
                                                ) : subStatus === 'graded' ? (
                                                    <span className="text-xs text-emerald-500 flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" /> Оценено: {a.submissions[0].grade}/10
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> Не сдано
                                                    </span>
                                                )
                                            )}

                                            {/* Количество сдавших (препод) */}
                                            {isTeacher && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {a.submissions.length} сдали
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <Link
                                        to={`/course/${a.lecture.module.course.id}`}
                                        className="flex-shrink-0 self-center"
                                    >
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}