import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useMutation } from '@tanstack/react-query';
import { aiApi, type CodeReview } from '@/api/ai';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Play, Loader2, CheckCircle2, AlertCircle,
    Lightbulb, Sparkles, ChevronRight, Terminal,
    Bot, Wand2, TerminalSquare, RefreshCw
} from 'lucide-react';

interface Props {
    initialCode?: string;
    language?: string;
    taskDescription?: string;
    readOnly?: boolean;
    onCodeChange?: (code: string) => void;
}

const defaultCode = `// Напишите ваш код здесь
function hello() {
  console.log("Привет, Prisma!");
}

hello();`;

export default function CodeEditor({
                                       initialCode,
                                       language = 'javascript',
                                       taskDescription,
                                       readOnly = false,
                                       onCodeChange,
                                   }: Props) {
    const [code, setCode] = useState(initialCode || defaultCode);
    const [review, setReview] = useState<CodeReview | null>(null);
    const [output, setOutput] = useState<string[]>([]);

    const reviewMutation = useMutation({
        mutationFn: () => aiApi.reviewCode(code, language, taskDescription),
        onSuccess: (res) => setReview(res.data.review),
    });

    const handleRun = () => {
        setOutput([]);
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
            logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };

        try {
            // eslint-disable-next-line no-new-func
            new Function(code)();
            setOutput(logs.length > 0 ? logs : ['Код выполнен без ошибок (нет вывода в консоль).']);
        } catch (e: any) {
            setOutput([`❌ Ошибка компиляции: ${e.message}`]);
        }

        console.log = originalLog;
    };

    const handleChange = (value: string | undefined) => {
        const newCode = value || '';
        setCode(newCode);
        setReview(null);
        onCodeChange?.(newCode);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* Левая сторона: Редактор и Консоль */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    {/* Тулбар управления */}
                    <div className="flex items-center justify-between mb-4 bg-card/20 p-2 rounded-xl border border-border/40 backdrop-blur-sm">
                        <div className="flex items-center gap-2 pl-2">
                            <TerminalSquare className="h-4 w-4 text-blue-500" />
                            <Badge variant="secondary" className="uppercase text-[10px] tracking-wider font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {language}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRun}
                                className="gap-1.5 h-9 rounded-lg border-border/60 text-muted-foreground hover:text-foreground text-xs font-semibold"
                            >
                                <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/20" />
                                Запустить
                            </Button>

                            {/* Фирменная неоновая кнопка Prisma */}
                            <div className="relative group">
                                <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-lg blur-sm opacity-40 group-hover:opacity-100 transition duration-300" />
                                <Button
                                    size="sm"
                                    onClick={() => reviewMutation.mutate()}
                                    disabled={reviewMutation.isPending || !code.trim()}
                                    className="relative gap-1.5 h-9 rounded-lg font-bold bg-background text-xs text-foreground"
                                    style={{
                                        background: 'linear-gradient(var(--card), var(--card)) padding-box, linear-gradient(135deg, #3b82f6, #06b6d4, #3b82f6) border-box',
                                        border: '1px solid transparent',
                                    }}
                                >
                                    {reviewMutation.isPending ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                                    ) : (
                                        <Wand2 className="h-3.5 w-3.5 text-blue-400" />
                                    )}
                                    Анализ ИИ
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Оболочка редактора кода */}
                    <div className="rounded-2xl overflow-hidden border border-border/50 shadow-2xl relative group">
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                        <Editor
                            height="380px"
                            language={language}
                            value={code}
                            onChange={handleChange}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                readOnly,
                                padding: { top: 16, bottom: 16 },
                                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                smoothScrolling: true,
                                cursorBlinking: 'smooth',
                                cursorSmoothCaretAnimation: 'on',
                                backgroundColor: '#0d0e12'
                            }}
                        />
                    </div>
                </div>

                {/* Терминал вывода */}
                {output.length > 0 && (
                    <div className="mt-4 p-5 rounded-2xl bg-black/40 border border-border/40 font-mono text-xs backdrop-blur-md relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Terminal className="w-16 h-16" />
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Вывод консоли:
                        </div>
                        <div className="space-y-1 max-h-[120px] overflow-y-auto">
                            {output.map((line, i) => (
                                <div key={i} className={line.startsWith('❌') ? 'text-red-400 font-semibold' : 'text-zinc-300'}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Правая сторона: Виджет ИИ-ментора */}
            <div className="lg:w-80 flex-shrink-0 flex flex-col">
                {/* Состояние: Ожидание запроса */}
                {!review && !reviewMutation.isPending && (
                    <div className="p-6 text-center bg-card/20 backdrop-blur-2xl border border-border/40 rounded-2xl h-full flex flex-col items-center justify-center min-h-[300px] relative group overflow-hidden">
                        <div className="absolute -inset-px bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
                        <div className="h-12 w-12 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center mb-4 text-muted-foreground/40 group-hover:text-blue-500/40 transition-colors duration-300">
                            <Bot className="h-6 w-6" />
                        </div>
                        <h4 className="text-sm font-bold mb-1">ИИ-Ментор готов</h4>
                        <p className="text-xs text-muted-foreground/80 max-w-[200px] leading-relaxed">
                            Напишите решение задачи и запустите анализ ИИ для проверки архитектуры кода.
                        </p>
                    </div>
                )}

                {/* Состояние: Загрузка ответа (Красивый скелетон с пульсацией) */}
                {reviewMutation.isPending && (
                    <div className="p-6 bg-card/20 backdrop-blur-2xl border border-blue-500/20 rounded-2xl h-full flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden animate-pulse">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
                        <div className="relative mb-4">
                            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md animate-ping" />
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                <RefreshCw className="h-5 w-5 animate-spin duration-1000" />
                            </div>
                        </div>
                        <h4 className="text-sm font-bold mb-1 text-blue-400">Нейросеть думает...</h4>
                        <p className="text-xs text-muted-foreground/60 text-center max-w-[180px]">
                            Проверяем синтаксис, паттерны и пограничные случаи.
                        </p>
                    </div>
                )}

                {/* Состояние: Сгенерированный красивый ответ от ИИ */}
                {review && (
                    <div className="p-5 bg-card/30 border border-border/50 backdrop-blur-2xl rounded-2xl space-y-5 animate-in fade-in slide-in-from-right-6 duration-500 relative overflow-hidden h-full flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                        <div className="space-y-4">
                            {/* Заголовок Ментора */}
                            <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
                                <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                    <Bot className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                    <span className="font-bold text-xs block">ИИ-Наставник Prisma</span>
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Телеметрия ревью</span>
                                </div>
                            </div>

                            {/* Статус-Метрики кода */}
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant={review.passed ? 'default' : 'destructive'}
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                                        review.rating === 'отлично' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' :
                                            review.rating === 'хорошо' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}
                                >
                                    {review.rating === 'отлично' && '⭐ Идеально'}
                                    {review.rating === 'хорошо' && '👍 Принято'}
                                    {review.rating === 'нужны правки' && '🔧 Есть правки'}
                                </Badge>

                                {review.syntaxOk ? (
                                    <Badge variant="outline" className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
                                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-400" /> Валиден
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-red-400 border-red-500/20 bg-red-500/5">
                                        <AlertCircle className="h-3 w-3 mr-1 text-red-400" /> Ошибка кода
                                    </Badge>
                                )}
                            </div>

                            {/* Список Рекомендаций */}
                            {review.suggestions.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                        <Lightbulb className="h-3.5 w-3.5 text-amber-400 fill-amber-400/10" />
                                        Что улучшить:
                                    </div>
                                    <ul className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                        {review.suggestions.map((s, i) => (
                                            <li key={i} className="text-xs text-foreground/90 flex items-start gap-2 bg-muted/20 p-2.5 rounded-xl border border-border/40">
                                                <ChevronRight className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Интерактивная контекстная Подсказка (если есть) */}
                        {review.hint && (
                            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10 mt-2">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1.5 flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3 text-cyan-400 fill-cyan-400/10" />
                                    Подсказка ИИ:
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{review.hint}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}