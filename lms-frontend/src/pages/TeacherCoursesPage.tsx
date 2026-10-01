import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coursesApi, type Course } from '@/api/courses';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function TeacherCoursesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', description: '', level: 'beginner' });

    const { data, isLoading } = useQuery({
        queryKey: ['allCourses'],
        queryFn: async () => {
            const res = await coursesApi.getAll();
            return res.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: () => coursesApi.create(newCourse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allCourses'] });
            setIsCreateOpen(false);
            setNewCourse({ title: '', description: '', level: 'beginner' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => coursesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allCourses'] });
        },
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Управление курсами</h1>
                    <p className="text-muted-foreground mt-1">Создавайте и редактируйте курсы</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Создать курс
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Новый курс</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Название</Label>
                                <Input
                                    value={newCourse.title}
                                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Описание</Label>
                                <Input
                                    value={newCourse.description}
                                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                />
                            </div>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Создать'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            <div className="space-y-4">
                {data?.map((course: Course) => (
                    <Card key={course.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <BookOpen className="h-8 w-8 text-primary" />
                                <div>
                                    <h3 className="font-semibold">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {course._count.modules} модулей
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/teacher/courses/${course.id}`)}
                                >
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Редактировать
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/course/${course.id}`)}
                                >
                                    Просмотр
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => {
                                        if (confirm('Удалить курс?')) {
                                            deleteMutation.mutate(course.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}