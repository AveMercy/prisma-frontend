import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi, type Submission } from '@/api/assignments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Check, ExternalLink } from 'lucide-react';

interface Props {
    submission: Submission;
    assignmentId: number;
}

export default function SubmissionGrading({ submission, assignmentId }: Props) {
    const queryClient = useQueryClient();
    const [grade, setGrade] = useState(submission.grade?.toString() || '');
    const [feedback, setFeedback] = useState(submission.feedback || '');

    const gradeMutation = useMutation({
        mutationFn: () =>
            assignmentsApi.grade(submission.id, parseInt(grade), feedback),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions', assignmentId] });
        },
    });

    return (
        <div className="p-4 rounded-lg bg-muted space-y-3">
            <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{submission.student?.fullName}</span>
                <a
                    href={submission.solutionUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                    <ExternalLink className="h-3 w-3" />
                    Решение
                </a>
            </div>
            <div className="flex gap-3 items-end">
                <div className="space-y-1">
                    <Label className="text-xs">Оценка</Label>
                    <div className="flex gap-1">
                        {[2, 3, 4, 5].map(g => (
                            <button
                                key={g}
                                onClick={() => setGrade(g.toString())}
                                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                                    grade === g.toString()
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted hover:bg-muted-foreground/20'
                                }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-1 flex-1">
                    <Label className="text-xs">Фидбек</Label>
                    <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="h-8 min-h-[32px] text-sm"
                        placeholder="Комментарий..."
                    />
                </div>
                <Button
                    size="sm"
                    onClick={() => gradeMutation.mutate()}
                    disabled={!grade || gradeMutation.isPending}
                >
                    {gradeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    ) : (
                        <Check className="h-4 w-4"/>
                    )}
                </Button>
            </div>
        </div>
    );
}