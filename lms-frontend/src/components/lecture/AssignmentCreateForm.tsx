import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi } from '@/api/assignments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, X } from 'lucide-react';

interface Props {
    lectureId: number;
    onClose?: () => void;
}

export default function AssignmentCreateForm({ lectureId, onClose }: Props) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    const createMutation = useMutation({
        mutationFn: () =>
            assignmentsApi.create({
                lectureId,
                title,
                taskDescription,
                dueDate: dueDate || undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments', lectureId] });
            setTitle('');
            setTaskDescription('');
            setDueDate('');
            onClose?.();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        createMutation.mutate();
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Новое задание</h3>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Название задания</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Практическая работа №1"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Описание</Label>
                        <Textarea
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder="Опишите задачу..."
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Дедлайн</Label>
                        <Input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Plus className="h-4 w-4 mr-2" />
                        )}
                        Создать задание
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}