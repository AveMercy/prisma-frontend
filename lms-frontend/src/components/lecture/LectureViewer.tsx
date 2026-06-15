import type { LectureBlock } from '@/types/lecture';
import BlockRenderer from './BlockRenderer';
import LegacyMarkdownViewer from './LegacyMarkdownViewer';
import { cn } from '@/lib/utils';
import QuizRenderer from './QuizRenderer';

interface LectureViewerProps {
    content: string;
    className?: string;
    lectureType?: 'theory' | 'practice' | 'quiz';
}

export default function LectureViewer({ content, className, lectureType }: LectureViewerProps) {
    if (!content) {
        return <div className="text-center py-20 text-muted-foreground">Лекция пока не содержит материала</div>;
    }
    if (lectureType === 'quiz') {
        return <QuizRenderer content={content} />;
    }

    try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
            return (
                <div className={cn('animate-in fade-in duration-500', className)}>
                    <BlockRenderer blocks={parsed as LectureBlock[]} />
                </div>
            );
        }
    } catch {
    }

    return <LegacyMarkdownViewer content={content} className={className} />;
}