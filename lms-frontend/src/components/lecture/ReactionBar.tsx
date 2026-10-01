import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reactionsApi } from '@/api/reactions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReactionBarProps {
    lectureId: number;
}

const reactionList = [
    { type: '👍', label: 'Понятно' },
    { type: '🤯', label: 'Сложно' },
    { type: '💤', label: 'Скучно' },
];

export default function ReactionBar({ lectureId }: ReactionBarProps) {
    const queryClient = useQueryClient();

    const { data: counts } = useQuery({
        queryKey: ['reactions', lectureId],
        queryFn: async () => {
            const res = await reactionsApi.getByLecture(lectureId);
            return res.data;
        },
    });

    const { data: myReaction } = useQuery({
        queryKey: ['myReaction', lectureId],
        queryFn: async () => {
            const res = await reactionsApi.getMyReaction(lectureId);
            return res.data;
        },
    });

    const mutation = useMutation({
        mutationFn: (type: string) => reactionsApi.set(lectureId, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reactions', lectureId] });
            queryClient.invalidateQueries({ queryKey: ['myReaction', lectureId] });
        },
    });

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Реакция:</span>
            {reactionList.map(({ type, label }) => (
                <Button
                    key={type}
                    variant={myReaction?.reactionType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => mutation.mutate(type)}
                    disabled={mutation.isPending}
                    className={cn(
                        'gap-1.5 min-w-[60px]',
                        myReaction?.reactionType === type && 'ring-2 ring-primary/20'
                    )}
                >
                    <span className="text-lg">{type}</span>
                    {counts?.[type] !== undefined && (
                        <span className="text-xs ml-0.5">{counts[type]}</span>
                    )}
                </Button>
            ))}
        </div>
    );
}