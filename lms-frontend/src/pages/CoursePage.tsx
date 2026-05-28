import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/api/courses';
import { lecturesApi } from '@/api/lectures';
import { progressApi } from '@/api/progress';
import { assignmentsApi } from '@/api/assignments';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import LectureViewer from '@/components/lecture/LectureViewer';
import ReactionBar from '@/components/lecture/ReactionBar';
import AssignmentView from '@/components/lecture/AssignmentView';
import AssignmentCreateForm from '@/components/lecture/AssignmentCreateForm';
import SubmissionGrading from '@/components/lecture/SubmissionGrading';
import AIAssistant from '@/components/lecture/AIAssistant';
import {
    Loader2,
    ChevronLeft,
    CheckCircle,
    Circle,
    FileText,
    Code,
    HelpCircle,
    Plus,
} from 'lucide-react';

const lectureIcons = {
    theory: FileText,
    practice: Code,
    quiz: HelpCircle,
};

const lectureColors = {
    theory: 'text-blue-400',
    practice: 'text-emerald-400',
    quiz: 'text-amber-400',
};

export default function CoursePage() {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuthStore();
    const [selectedLectureId, setSelectedLectureId] = useState<number | null>(null);
    const [completedLectures, setCompletedLectures] = useState<Set<number>>(new Set());
    const [firstLectureSet, setFirstLectureSet] = useState(false);
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [expandedAssignmentId, setExpandedAssignmentId] = useState<number | null>(null);

    const { data: course, isLoading: courseLoading } = useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const res = await coursesApi.getById(parseInt(courseId!));
            return res.data;
        },
        enabled: !!courseId,
    });

    const { data: lecture, isLoading: lectureLoading } = useQuery({
        queryKey: ['lecture', selectedLectureId],
        queryFn: () => lecturesApi.getById(selectedLectureId!),
        enabled: !!selectedLectureId,
    });

    const { data: assignments } = useQuery({
        queryKey: ['assignments', selectedLectureId],
        queryFn: async () => {
            const res = await assignmentsApi.getByLecture(selectedLectureId!);
            return res.data;
        },
        enabled: !!selectedLectureId,
    });

    const { data: submissions } = useQuery({
        queryKey: ['submissions', expandedAssignmentId],
        queryFn: async () => {
            const res = await assignmentsApi.getSubmissions(expandedAssignmentId!);
            return res.data;
        },
        enabled: !!expandedAssignmentId && (user?.role === 'teacher' || user?.role === 'admin'),
    });

    // Автовыбор первой лекции
    if (course && !selectedLectureId && !firstLectureSet && course.modules.length > 0) {
        const firstLecture = course.modules[0]?.lectures[0];
        if (firstLecture) {
            setSelectedLectureId(firstLecture.id);
            setFirstLectureSet(true);
        }
    }

    const handleToggleComplete = async (lectureId: number) => {
        const isCompleted = completedLectures.has(lectureId);
        try {
            await progressApi.toggle(lectureId, !isCompleted);
            setCompletedLectures((prev) => {
                const next = new Set(prev);
                if (isCompleted) {
                    next.delete(lectureId);
                } else {
                    next.add(lectureId);
                }
                return next;
            });
        } catch (error) {
            console.error('Ошибка отметки прогресса:', error);
        }
    };

    if (courseLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex h-screen items-center justify-center text-muted-foreground">
                Курс не найден
            </div>
        );
    }

    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

    return (
        <div className="flex h-screen">
            {/* Sidebar with modules tree */}
            <aside className="w-72 border-r bg-card flex flex-col">
                <div className="p-4 border-b">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Мои курсы
                    </Link>
                    <h2 className="font-semibold mt-2 line-clamp-2">{course.title}</h2>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-3">
                        {course.modules.map((module) => (
                            <div key={module.id} className="mb-4">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                                    {module.title}
                                </h3>
                                <div className="space-y-0.5">
                                    {module.lectures.map((lec) => {
                                        const Icon = lectureIcons[lec.type];
                                        const isSelected = selectedLectureId === lec.id;
                                        const isCompleted = completedLectures.has(lec.id);

                                        return (
                                            <button
                                                key={lec.id}
                                                onClick={() => {
                                                    setSelectedLectureId(lec.id);
                                                    setShowAssignmentForm(false);
                                                    setExpandedAssignmentId(null);
                                                }}
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                                                    isSelected
                                                        ? 'bg-primary/10 text-primary font-medium'
                                                        : 'hover:bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                ) : (
                                                    <Circle className="h-4 w-4 flex-shrink-0" />
                                                )}
                                                <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${lectureColors[lec.type]}`} />
                                                <span className="line-clamp-2">{lec.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {lectureLoading && (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {lecture && !lectureLoading && (
                    <div className="max-w-4xl mx-auto px-8 py-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <Badge variant="secondary" className="mb-2">
                                    {lecture.type === 'theory' ? 'Теория' : lecture.type === 'practice' ? 'Практика' : 'Квиз'}
                                </Badge>
                                <h1 className="text-3xl font-bold">{lecture.title}</h1>
                            </div>
                            <Button
                                variant={completedLectures.has(lecture.id) ? 'default' : 'outline'}
                                onClick={() => handleToggleComplete(lecture.id)}
                                size="sm"
                            >
                                {completedLectures.has(lecture.id) ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Пройдено
                                    </>
                                ) : (
                                    'Отметить как пройденное'
                                )}
                            </Button>
                        </div>

                        <LectureViewer content={lecture.content || ''} />

                        {/* Задания */}
                        <div className="mt-10 border-t pt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Задания</h3>
                                {isTeacher && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Добавить задание
                                    </Button>
                                )}
                            </div>

                            {showAssignmentForm && (
                                <div className="mb-4">
                                    <AssignmentCreateForm
                                        lectureId={lecture.id}
                                        onClose={() => setShowAssignmentForm(false)}
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                {assignments?.map((assignment) => (
                                    <div key={assignment.id}>
                                        <AssignmentView assignment={assignment} />

                                        {isTeacher && (
                                            <div className="mt-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() =>
                                                        setExpandedAssignmentId(
                                                            expandedAssignmentId === assignment.id
                                                                ? null
                                                                : assignment.id
                                                        )
                                                    }
                                                >
                                                    Сданные работы
                                                </Button>
                                                {expandedAssignmentId === assignment.id && (
                                                    <div className="mt-2 space-y-2 pl-4">
                                                        {submissions?.map((sub) => (
                                                            <SubmissionGrading
                                                                key={sub.id}
                                                                submission={sub}
                                                                assignmentId={assignment.id}
                                                            />
                                                        ))}
                                                        {submissions?.length === 0 && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Пока нет сданных работ
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {assignments?.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Нет заданий</p>
                                )}
                            </div>
                        </div>

                        {/* Реакции */}
                        <div className="mt-10 pt-6 border-t">
                            <ReactionBar lectureId={lecture.id} />
                        </div>
                    </div>
                )}

                {!selectedLectureId && !lectureLoading && (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Выберите лекцию слева
                    </div>
                )}

                {lecture && (
                    <AIAssistant lectureId={lecture.id} lectureTitle={lecture.title} />
                )}

            </main>
        </div>
    );
}