import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/api/ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Bot,
    Send,
    X,
    Loader2,
    Sparkles,
    User,
} from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Props {
    lectureId: number;
    lectureTitle?: string;
}

export default function AIAssistant({ lectureId, lectureTitle }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const viewportRef = useRef<HTMLDivElement>(null);

    const askMutation = useMutation({
        mutationFn: (q: string) => aiApi.ask(lectureId, q),
        onSuccess: (res) => {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: res.data.answer },
            ]);
        },
        onError: (error: any) => {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: error?.response?.data?.error || 'Ошибка. Попробуйте позже.' },
            ]);
        },
    });

    const handleSend = () => {
        if (!question.trim() || askMutation.isPending) return;

        const q = question.trim();
        setMessages((prev) => [...prev, { role: 'user', content: q }]);
        setQuestion('');
        askMutation.mutate(q);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Автоскролл при новых сообщениях
    useEffect(() => {
        if (viewportRef.current) {
            viewportRef.current.scrollTo({
                top: viewportRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-all flex items-center justify-center"
                >
                    <Sparkles className="h-6 w-6" />
                </button>
            )}

            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-96 h-[550px] max-h-[80vh] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-muted/50 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-sm">ИИ-помощник</h3>
                                {lectureTitle && (
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {lectureTitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={viewportRef}
                        className="flex-1 overflow-y-auto p-4"
                    >
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                <Sparkles className="h-12 w-12 text-muted-foreground opacity-30" />
                                <p className="text-sm text-muted-foreground">
                                    Задайте вопрос по материалу лекции
                                </p>
                            </div>
                        )}
                        <div className="space-y-4">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            msg.role === 'user' ? 'bg-primary' : 'bg-muted'
                                        }`}
                                    >
                                        {msg.role === 'user' ? (
                                            <User className="h-4 w-4 text-primary-foreground" />
                                        ) : (
                                            <Bot className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <div
                                        className={`rounded-2xl px-4 py-2.5 text-sm max-w-[80%] ${
                                            msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-tr-md'
                                                : 'bg-muted rounded-tl-md'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {askMutation.isPending && (
                                <div className="flex gap-2">
                                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t flex gap-2 flex-shrink-0">
                        <Input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Спросите о лекции..."
                            className="flex-1"
                            disabled={askMutation.isPending}
                        />
                        <Button
                            size="icon"
                            onClick={handleSend}
                            disabled={!question.trim() || askMutation.isPending}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}