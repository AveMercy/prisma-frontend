import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InfoPanel from './InfoPanel';
import CodeBlock from './CodeBlock';
import SectionBlock from './SectionBlock';
import type { LectureBlock } from '@/types/lecture';
import { getImageUrl } from '@/lib/utils';

interface Props {
    blocks: LectureBlock[];
}

export default function BlockRenderer({ blocks }: Props) {
    if (!blocks || blocks.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                Лекция пока не содержит материала
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            {blocks.map((block) => {
                switch (block.type) {
                    case 'heading': {
                        const Tag = `h${block.level || 1}` as keyof JSX.IntrinsicElements;
                        const headingClasses = {
                            1: 'text-4xl font-black mb-8 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent',
                            2: 'text-2xl font-bold mt-10 mb-4',
                            3: 'text-xl font-semibold mt-8 mb-3',
                        };
                        return (
                            <Tag key={block.id} className={headingClasses[block.level || 1]}>
                                {block.content}
                            </Tag>
                        );
                    }

                    case 'text':
                        return (
                            <div key={block.id} className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {block.content || ''}
                                </ReactMarkdown>
                            </div>
                        );

                    case 'section':
                        return (
                            <SectionBlock
                                key={block.id}
                                number={block.number}
                                title={block.title}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {block.content || ''}
                                </ReactMarkdown>
                            </SectionBlock>
                        );

                    case 'code':
                        return (
                            <CodeBlock
                                key={block.id}
                                language={block.language}
                                code={block.code || ''}
                            />
                        );

                    case 'info':
                    case 'warning':
                    case 'success':
                        return (
                            <InfoPanel
                                key={block.id}
                                title={block.title}
                                type={block.type}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {block.content || ''}
                                </ReactMarkdown>
                            </InfoPanel>
                        );

                    case 'image':
                        const imageSrc = getImageUrl(block.src);
                        return (
                            <figure key={block.id} className="my-6">
                                <img
                                    src={imageSrc}
                                    alt={block.alt || ''}
                                    className="rounded-xl w-full max-w-2xl"
                                />
                                {block.alt && (
                                    <figcaption className="text-sm text-muted-foreground mt-2 text-center">
                                        {block.alt}
                                    </figcaption>
                                )}
                            </figure>
                        );

                    default:
                        return null;
                }
            })}
        </div>
    );
}