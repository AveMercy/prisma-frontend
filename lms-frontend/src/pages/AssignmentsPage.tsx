import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assignmentsApi, type AssignmentFull } from '@/api/assignments';
import { practiceApi } from '@/api/practice';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getImageUrl } from '@/lib/utils';
import {
    Loader2, CheckCircle, BookOpen, ChevronRight, ChevronDown,
    Users, FileText, Code, Paperclip, RotateCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AssignmentsPage() {
    const { user } = useAuthStore();
    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
    const queryClient = useQueryClient();

    // Обычные задания
    const { data: assignments = [], isLoading } = useQuery<AssignmentFull[]>({
        queryKey: ['assignments-list', isTeacher],
        queryFn: async () => {
            if (isTeacher) {
                const res = await assignmentsApi.getTeacherAssignments();
                const data = res.data;
                return Array.isArray(data) ? data : data?.assignments || [];
            }
            const res = await assignmentsApi.getMyAssignments();
            const data = res.data;
            return Array.isArray(data) ? data : data?.assignments || [];
        },
    });

    // Практические
    const { data: practiceSubmissions = [] } = useQuery({
        queryKey: ['practiceSubmissions'],
        queryFn: async () => {
            const res = await practiceApi.getAllSubmissions();
            const data = res.data;
            return data?.submissions || [];
        },
        enabled: isTeacher,
    });

    // Группировка по курсам
    const grouped = new Map<string, AssignmentFull[]>();
    assignments.forEach((a) => {
        const course = a.lecture?.module?.course?.title || 'Без курса';
        if (!grouped.has(course)) grouped.set(course, []);
        grouped.get(course)!.push(a);
    });

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{isTeacher ? 'Проверка работ' : 'Мои задания'}</h1>
                    <p className="text-muted-foreground mt-1">
                        {isTeacher ? 'Работы студентов на проверку' : 'Ваши активные задания'}
                    </p>
                </div>
            </div>

            {/* ПРЕПОДАВАТЕЛЬ */}
            {isTeacher && (
                <div className="space-y-8">
                    {/* Практические */}
                    <CollapsibleSection
                        title="Практические работы"
                        icon={<Code className="h-5 w-5 text-amber-500" />}
                        count={practiceSubmissions.length}
                        newCount={practiceSubmissions.filter((s: any) => s.grade === null).length}
                        defaultExpanded={true}
                    >
                        {practiceSubmissions.length === 0 ? (
                            <p className="text-muted-foreground text-sm p-4">Нет сданных практических</p>
                        ) : (
                            <div className="space-y-2 p-4 pt-0">
                                {practiceSubmissions.map((sub: any) => (
                                    <PracticeCard
                                        key={sub.id}
                                        submission={sub}
                                        onGraded={() => queryClient.invalidateQueries({ queryKey: ['practiceSubmissions'] })}
                                    />
                                ))}
                            </div>
                        )}
                    </CollapsibleSection>

                    {/* Обычные задания */}
                    <CollapsibleSection
                        title="Обычные задания"
                        icon={<FileText className="h-5 w-5 text-blue-500" />}
                        count={assignments.length}
                        defaultExpanded={true}
                    >
                        {assignments.length === 0 ? (
                            <p className="text-muted-foreground text-sm p-4">Нет созданных заданий</p>
                        ) : (
                            <div className="space-y-4 p-4 pt-0">
                                {Array.from(grouped.entries()).map(([course, items]) => (
                                    <CourseGroup key={course} courseName={course} assignments={items} />
                                ))}
                            </div>
                        )}
                    </CollapsibleSection>
                </div>
            )}

            {/* СТУДЕНТ */}
            {!isTeacher && (
                <div className="space-y-4">
                    {assignments.length === 0 ? (
                        <p className="text-muted-foreground text-center py-12">Нет активных заданий</p>
                    ) : (
                        Array.from(grouped.entries()).map(([course, items]) => (
                            <div key={course}>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">{course}</h3>
                                <div className="space-y-2">
                                    {items.map((a) => (
                                        <Card key={a.id}>
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-sm">{a.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{a.lecture?.title}</p>
                                                    {a.submissions?.[0] && (
                                                        <Badge variant={a.submissions[0].grade ? 'default' : 'outline'} className="mt-1 text-xs">
                                                            {a.submissions[0].grade ? `${a.submissions[0].grade}/5` : 'Сдано'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Link to={`/course/${a.lecture?.module?.course?.id}`}>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function CollapsibleSection({
                                title, icon, count, newCount, defaultExpanded, children
                            }: {
    title: string; icon: React.ReactNode; count: number; newCount?: number;
    defaultExpanded?: boolean; children: React.ReactNode;
}) {
    const [expanded, setExpanded] = useState(defaultExpanded ?? true);
    return (
        <div className="border border-border/50 rounded-2xl overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-semibold">{title}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                    {newCount != null && newCount > 0 && (
                        <Badge className="bg-amber-500/10 text-amber-500 text-xs">{newCount} новых</Badge>
                    )}
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            {expanded && children}
        </div>
    );
}

// Группа по курсу
function CourseGroup({ courseName, assignments }: { courseName: string; assignments: AssignmentFull[] }) {
    const [expanded, setExpanded] = useState(true);
    const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);
    const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0);

    return (
        <div className="border border-border/50 rounded-xl overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{courseName}</span>
                    <Badge variant="outline" className="text-xs">{assignments.length} заданий · {totalSubmissions} сдач</Badge>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            {expanded && (
                <div className="border-t border-border/50">
                    {assignments.map((a) => (
                        <div key={a.id} className="border-b border-border/30 last:border-0 p-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm">{a.title}</h4>
                                    <p className="text-xs text-muted-foreground">{a.lecture?.title}</p>
                                    {a.taskDescription && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.taskDescription}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                            <Users className="h-3 w-3 mr-1" />{a.submissions?.length || 0} сдали
                                        </Badge>
                                    </div>
                                </div>
                                <Link to={`/course/${a.lecture?.module?.course?.id}`} className="ml-2">
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </div>
                            {(a.submissions?.length || 0) > 0 && (
                                <div className="mt-2">
                                    <Button variant="ghost" size="sm" className="text-xs h-7"
                                            onClick={() => setExpandedAssignment(expandedAssignment === a.id ? null : a.id)}>
                                        {expandedAssignment === a.id ? 'Скрыть работы' : 'Проверить работы'}
                                    </Button>
                                    {expandedAssignment === a.id && (
                                        <SubmissionsList assignmentId={a.id} />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Список сдач
function SubmissionsList({ assignmentId }: { assignmentId: number }) {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['submissions', assignmentId],
        queryFn: async () => {
            const res = await assignmentsApi.getSubmissions(assignmentId);
            const d = res.data;
            return Array.isArray(d) ? d : d?.submissions || [];
        },
    });

    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin mt-2" />;
    if (!data || data.length === 0) return <p className="text-xs text-muted-foreground mt-2">Нет сдач</p>;

    return (
        <div className="mt-2 space-y-2">
            {data.map((sub: any) => (
                <div key={sub.id} className="p-3 rounded-lg bg-muted space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{sub.student?.fullName || 'Студент'}</span>
                        {sub.solutionUrl && (
                            <a href={getImageUrl(sub.solutionUrl)} target="_blank" rel="noopener noreferrer"
                               className="text-xs text-primary flex items-center gap-1">
                                <Paperclip className="h-3 w-3"/>Файл
                            </a>
                        )}
                    </div>
                    {sub.feedback && <p className="text-xs text-muted-foreground">Комментарий: {sub.feedback}</p>}
                    <QuickGrade submission={sub} assignmentId={assignmentId}
                                onGraded={() => queryClient.invalidateQueries({ queryKey: ['submissions', assignmentId] })} />
                </div>
            ))}
        </div>
    );
}

// Быстрая оценка
function QuickGrade({ submission, assignmentId, onGraded }: { submission: any; assignmentId: number; onGraded: () => void }) {
    const [grade, setGrade] = useState(submission.grade?.toString() || '');
    const [feedback, setFeedback] = useState('');

    const mutation = useMutation({
        mutationFn: () => assignmentsApi.grade(submission.id, parseInt(grade), feedback),
        onSuccess: () => { toast.success('✅ Оценка сохранена'); onGraded(); },
        onError: () => toast.error('Ошибка'),
    });

    return (
        <div className="flex gap-2 items-end">
            <div className="flex gap-1">
                {[2, 3, 4, 5].map(g => (
                    <button key={g} onClick={() => setGrade(g.toString())}
                            className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                                grade === g.toString() ? 'bg-primary text-primary-foreground' : 'bg-background border hover:bg-muted'
                            }`}>
                        {g}
                    </button>
                ))}
            </div>
            <Textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                      className="h-7 min-h-[28px] text-xs flex-1" placeholder="Комментарий..." />
            <Button size="sm" onClick={() => mutation.mutate()} disabled={!grade || mutation.isPending} className="h-7 text-xs">
                {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'OK'}
            </Button>
        </div>
    );
}

// Карточка практической
function PracticeCard({ submission, onGraded }: { submission: any; onGraded: () => void }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="border-amber-500/20 bg-amber-500/5">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-500/5 transition-colors rounded-xl"
            >
                <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 text-amber-500" />
                    <div>
                        <h3 className="font-medium text-sm">{submission.student?.fullName || 'Студент'}</h3>
                        <p className="text-xs text-muted-foreground">{submission.lecture?.title || 'Практическая'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {submission.grade ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 text-xs">{submission.grade}/5</Badge>
                    ) : submission.aiReview?.grade ? (
                        <Badge className="bg-amber-500/10 text-amber-500 text-xs">ИИ: {submission.aiReview.grade}/5</Badge>
                    ) : (
                        <Badge variant="outline" className="text-xs">Новая</Badge>
                    )}
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {expanded && <PracticeDetail submission={submission} onGraded={onGraded} />}
        </Card>
    );
}

function PracticeDetail({ submission, onGraded }: { submission: any; onGraded: () => void }) {
    const [grade, setGrade] = useState(submission.grade?.toString() || '');
    const [feedback, setFeedback] = useState(submission.feedback || '');

    const mutation = useMutation({
        mutationFn: () => practiceApi.grade(submission.id, parseInt(grade), feedback),
        onSuccess: () => { toast.success('✅ Оценка сохранена'); onGraded(); },
        onError: () => toast.error('Ошибка'),
    });

    return (
        <div className="border-t border-amber-500/20 p-4 space-y-3">
            {submission.aiReview?.summary && (
                <div className="text-xs bg-amber-500/5 p-2 rounded">
                    <span className="font-medium text-amber-500">ИИ-вердикт:</span> {submission.aiReview.summary}
                </div>
            )}
            <pre className="text-xs bg-zinc-900 dark:bg-zinc-950 text-green-400 p-3 rounded max-h-32 overflow-y-auto font-mono">
                {submission.code?.substring(0, 500)}
            </pre>
            <div className="flex gap-2 items-end">
                <div className="flex gap-1">
                    {[2, 3, 4, 5].map(g => (
                        <button key={g} onClick={() => setGrade(g.toString())}
                                className={`w-7 h-7 rounded text-xs font-bold ${grade === g.toString() ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                            {g}
                        </button>
                    ))}
                </div>
                <Textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                          className="h-7 min-h-[28px] text-xs flex-1" placeholder="Комментарий..." />
                <Button size="sm" onClick={() => mutation.mutate()} disabled={!grade || mutation.isPending} className="h-7 text-xs">
                    {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'OK'}
                </Button>
            </div>
        </div>
    );
}