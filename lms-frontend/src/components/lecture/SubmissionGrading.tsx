import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi, type Submission } from '@/api/assignments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Check, ExternalLink, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    submission: Submission;
    assignmentId: number;
}

export default function SubmissionGrading({ submission, assignmentId }: Props) {
    const queryClient = useQueryClient();
    const [grade, setGrade] = useState<string>(submission.grade?.toString() || '');
    const [feedback, setFeedback] = useState(submission.feedback || '');

    const gradeMutation = useMutation({
        mutationFn: () => assignmentsApi.grade(submission.id, parseInt(grade), feedback),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions', assignmentId] });
            toast.success('Оценка сохранена');
        },
        onError: () => toast.error('Не удалось сохранить оценку'),
    });

    return (
        <div className="p-4 rounded-lg bg-muted space-y-3">
            <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{submission.student?.fullName || 'Студент'}</span>
                {submission.solutionUrl && (
                    <a
                        href={`http://localhost:5000${submission.solutionUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                        <Paperclip className="h-3 w-3" />
                        Файл
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </div>

            {submission.feedback && (
                <p className="text-xs text-muted-foreground">
                    Комментарий студента: {submission.feedback}
                </p>
            )}

            <div className="space-y-2">
                <Label className="text-xs">Оценка</Label>
                <div className="flex gap-1.5">
                    {[2, 3, 4, 5].map(g => (
                        <button
                            key={g}
                            onClick={() => setGrade(g.toString())}
                            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                                grade === g.toString()
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-background hover:bg-muted-foreground/10 border border-border'
                            }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-1">
                <Label className="text-xs">Комментарий преподавателя</Label>
                <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[50px] text-sm"
                    placeholder="Обратная связь..."
                />
            </div>

            <Button
                size="sm"
                onClick={() => gradeMutation.mutate()}
                disabled={!grade || gradeMutation.isPending}
                className="w-full"
            >
                {gradeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                    <Check className="h-4 w-4 mr-2" />
                )}
                Сохранить оценку
            </Button>
        </div>
    );
}