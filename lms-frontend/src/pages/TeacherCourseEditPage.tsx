import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/api/courses';
import { modulesApi } from '@/api/modules';
import { lecturesApi } from '@/api/lectures';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    ChevronLeft,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    FileText,
    Code,
    HelpCircle,
} from 'lucide-react';

const lectureIcons = {
    theory: FileText,
    practice: Code,
    quiz: HelpCircle,
};

export default function TeacherCourseEditPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: course, isLoading } = useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const res = await coursesApi.getById(parseInt(courseId!));
            return res.data;
        },
    });

    const createModuleMutation = useMutation({
        mutationFn: (title: string) =>
            modulesApi.create({ title, orderIndex: (course?.modules.length || 0) + 1, courseId: parseInt(courseId!) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            setIsModalOpen(false);
            setNewModuleTitle('');
        },
    });

    const deleteModuleMutation = useMutation({
        mutationFn: (id: number) => modulesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
        },
    });

    const deleteLectureMutation = useMutation({
        mutationFn: (id: number) => lecturesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    to="/teacher/courses"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="h-4 w-4" />
                    К списку курсов
                </Link>
            </div>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">{course?.title}</h1>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Добавить модуль
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Новый модуль</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Название модуля</Label>
                                <Input
                                    value={newModuleTitle}
                                    onChange={(e) => setNewModuleTitle(e.target.value)}
                                    placeholder="Введение"
                                />
                            </div>
                            <Button
                                onClick={() => createModuleMutation.mutate(newModuleTitle)}
                                disabled={!newModuleTitle || createModuleMutation.isPending}
                            >
                                Создать
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-6">
                {course?.modules.map((module) => (
                    <Card key={module.id}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-lg">{module.title}</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => {
                                        if (confirm('Удалить модуль?')) {
                                            deleteModuleMutation.mutate(module.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-1 mb-4">
                                {module.lectures.length === 0 && (
                                    <p className="text-sm text-muted-foreground px-3 py-2">Нет лекций</p>
                                )}
                                {module.lectures.map((lec) => {
                                    const Icon = lectureIcons[lec.type];
                                    return (
                                        <div
                                            key={lec.id}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-muted group"
                                        >
                                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="flex-1">{lec.title}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {lec.type === 'theory' ? 'Теория' : lec.type === 'practice' ? 'Практика' : 'Квиз'}
                                            </Badge>
                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => navigate(`/lectures/edit/${lec.id}`)}
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-destructive"
                                                    onClick={() => {
                                                        if (confirm('Удалить лекцию?')) {
                                                            deleteLectureMutation.mutate(lec.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/lectures/create?moduleId=${module.id}`)}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Добавить лекцию
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}