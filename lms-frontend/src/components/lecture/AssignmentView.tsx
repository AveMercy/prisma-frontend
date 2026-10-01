import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type Assignment } from '@/api/assignments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Send, CheckCircle, ExternalLink, Clock, AlertCircle, Paperclip, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/utils';
import { getImageUrl } from '@/lib/utils';

interface Props {
    assignment: Assignment;
}

export default function AssignmentView({ assignment }: Props) {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [showSubmit, setShowSubmit] = useState(false);
    const [comment, setComment] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const submission = assignment.submissions?.[0];
    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
    const isExpired = assignment.dueDate && new Date(assignment.dueDate) < new Date();

    const submitMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append('assignmentId', assignment.id.toString());
            formData.append('comment', comment);
            if (file) formData.append('file', file);

            const token = localStorage.getItem('token');
            const res = await fetch(getApiUrl('/assignments/submit'), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error('Ошибка отправки');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments', assignment.lectureId] });
            setShowSubmit(false);
            setFile(null);
            setComment('');
            toast.success('Задание успешно сдано!');
        },
        onError: () => {
            toast.error('Не удалось отправить задание');
        },
    });

    return (
        <Card className={submission ? 'border-emerald-500/30' : ''}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {assignment.title}
                            {submission && (
                                <Badge variant="default" className="text-xs bg-emerald-500">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Сдано
                                </Badge>
                            )}
                        </h3>
                        {assignment.taskDescription && (
                            <p className="text-sm text-muted-foreground mt-1">{assignment.taskDescription}</p>
                        )}
                    </div>
                    {assignment.dueDate && (
                        <div className={`flex items-center gap-1 text-xs ${isExpired ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {isExpired ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {new Date(assignment.dueDate).toLocaleDateString('ru-RU')}
                        </div>
                    )}
                </div>

                {/* Сдача студента */}
                {submission && (
                    <div className="mt-3 p-3 rounded-lg bg-muted space-y-2">
                        {submission.solutionUrl && (
                            <div className="flex items-center justify-between">
                                <a
                                    href={getImageUrl(submission.solutionUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    <Paperclip className="h-3 w-3" />
                                    Прикреплённый файл
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                                {submission.grade !== null && (
                                    <Badge variant="secondary" className={submission.grade >= 4 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}>
                                        Оценка: {submission.grade}
                                    </Badge>
                                )}
                            </div>
                        )}
                        {submission.feedback && (
                            <p className="text-sm text-muted-foreground">
                                💬 {submission.feedback}
                            </p>
                        )}
                        {submission.grade !== null && submission.feedback && (
                            <div className="p-2 rounded bg-muted-foreground/5">
                                <p className="text-xs text-muted-foreground">
                                    <span className="font-medium">Комментарий преподавателя:</span> {submission.feedback}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {!isTeacher && !submission && (
                    <>
                        {!showSubmit ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => setShowSubmit(true)}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Сдать задание
                            </Button>
                        ) : (
                            <div className="mt-3 space-y-3 p-3 rounded-lg bg-muted">
                                <div className="space-y-2">
                                    <Label className="text-sm">Прикрепить файл</Label>
                                    <Input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="text-sm"
                                    />
                                    {file && (
                                        <p className="text-xs text-muted-foreground">
                                            Выбран: {file.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Комментарий к решению</Label>
                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Поясните ваше решение..."
                                        className="min-h-[60px] text-sm"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => submitMutation.mutate()}
                                        disabled={submitMutation.isPending}
                                    >
                                        {submitMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Send className="h-4 w-4 mr-2" />
                                        )}
                                        Отправить
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setShowSubmit(false);
                                            setFile(null);
                                            setComment('');
                                        }}
                                    >
                                        Отмена
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}