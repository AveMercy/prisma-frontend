import type { LectureBlock } from '@/types/lecture';
import BlockRenderer from './BlockRenderer';
import LegacyMarkdownViewer from './LegacyMarkdownViewer';
import { cn } from '@/lib/utils';

interface LectureViewerProps {
    content: string;
    className?: string;
}

export default function LectureViewer({ content, className }: LectureViewerProps) {
    if (!content) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                Лекция пока не содержит материала
            </div>
        );
    }

    // Пробуем распарсить как JSON (новый формат)
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
        // Не JSON — рендерим как старый Markdown
    }

    return <LegacyMarkdownViewer content={content} className={className} />;
}