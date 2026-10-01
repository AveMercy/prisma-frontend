import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import InfoPanel from './InfoPanel';
import CodeBlock from './CodeBlock';
import SectionBlock from './SectionBlock';
import { cn } from '@/lib/utils';

function parseCustomBlock(text: string): {
    type: string;
    props: Record<string, string>;
    content: string;
} | null {
    const match = text.match(/^:::(\w+)(?:\{([^}]*)\})\s*\n([\s\S]*?)\n:::$/);
    if (!match) return null;

    const [, type, propsStr, content] = match;
    const props: Record<string, string> = {};

    if (propsStr) {
        const propMatches = propsStr.matchAll(/(\w+)="([^"]*)"/g);
        for (const m of propMatches) {
            props[m[1]] = m[2];
        }
    }

    return { type, props, content: content.trim() };
}

const components: Components = {
    p({ children }) {
        const text = typeof children === 'string' ? children : '';
        const parsed = parseCustomBlock(text);

        if (parsed) {
            switch (parsed.type) {
                case 'section':
                    return (
                        <SectionBlock number={parsed.props.number} title={parsed.props.title}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                                {parsed.content}
                            </ReactMarkdown>
                        </SectionBlock>
                    );
                case 'code':
                    return <CodeBlock language={parsed.props.language} code={parsed.content} />;
                case 'info':
                case 'warning':
                case 'success':
                    return (
                        <InfoPanel title={parsed.props.title} type={parsed.type as 'info' | 'warning' | 'success'}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                                {parsed.content}
                            </ReactMarkdown>
                        </InfoPanel>
                    );
                case 'image':
                    return (
                        <figure className="my-6">
                            <img src={parsed.props.src} alt={parsed.props.alt || ''} className="rounded-xl w-full max-w-2xl" />
                            {parsed.props.alt && (
                                <figcaption className="text-sm text-muted-foreground mt-2 text-center">{parsed.props.alt}</figcaption>
                            )}
                        </figure>
                    );
            }
        }

        return <p className="leading-7 mb-4">{children}</p>;
    },
    h1: ({ children }) => (
        <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">{children}</h1>
    ),
    h2: ({ children }) => <h2 className="text-2xl font-bold mt-10 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold mt-8 mb-3">{children}</h3>,
    code: ({ className, children }) => {
        if (!className) {
            return <code className="px-1.5 py-0.5 rounded-md bg-muted text-sm font-mono text-primary">{children}</code>;
        }
        return <code className={className}>{children}</code>;
    },
    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-4">{children}</ol>,
    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground">{children}</blockquote>
    ),
};

interface Props {
    content: string;
    className?: string;
}

export default function LegacyMarkdownViewer({ content, className }: Props) {
    return (
        <div className={cn('animate-in fade-in duration-500', className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {content}
            </ReactMarkdown>
        </div>
    );
}