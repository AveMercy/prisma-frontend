import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { lecturesApi } from '@/api/lectures';
import { aiApi, type CodeReviewReport } from '@/api/ai';
import { githubApi } from '@/api/github';
import BlockRenderer from '@/components/lecture/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import {
    Loader2, ChevronLeft, Send, CheckCircle, AlertTriangle,
    Lightbulb, Bug, Shield, ArrowRight, Code, Save, RotateCcw, Play,
    GitBranch,
} from 'lucide-react';

const severityConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
    error: { icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Ошибка' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Предупреждение' },
    info: { icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Совет' },
};

export default function PracticeSubmitPage() {
    const { courseId, lectureId } = useParams<{ courseId: string; lectureId: string }>();
    const navigate = useNavigate();

    const [code, setCode] = useState(() => localStorage.getItem(`draft-practice-${lectureId}`) || '// Напишите ваш код здесь\n');
    const [output, setOutput] = useState<string[]>([]);
    const [review, setReview] = useState<CodeReviewReport | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [aiError, setAiError] = useState(false);

    // GitHub push
    const [showPush, setShowPush] = useState(false);
    const [repoName, setRepoName] = useState('');
    const pushMutation = useMutation({
        mutationFn: () => githubApi.push(code, repoName, 'solution.js', `Практическая: ${lecture?.title}`),
        onSuccess: (res: any) => toast.success(`Запушено в GitHub! 🚀 ${res.data?.url || ''}`),
        onError: (err: any) => toast.error(err?.response?.data?.error || 'Ошибка пуша'),
    });

    const { data: lecture, isLoading } = useQuery({
        queryKey: ['lecture', lectureId],
        queryFn: () => lecturesApi.getById(parseInt(lectureId!)),
        enabled: !!lectureId,
    });

    const submitMutation = useMutation({
        mutationFn: async () => {
            if (!code.trim() || code.trim() === '// Напишите ваш код здесь') throw new Error('EMPTY_CODE');
            const res = await aiApi.submitCodeReview(code, 'javascript', parseInt(lectureId!));
            return res.data.review;
        },
        onSuccess: (data) => { setReview(data); setSubmitted(true); setAiError(false); },
        onError: (error: any) => {
            if (error.message === 'EMPTY_CODE') {
                setReview({ passed: false, grade: 2, summary: 'Вы отправили пустой код.', issues: [{ severity: 'error', line: 1, message: 'Код не может быть пустым.', suggestion: 'Напишите решение.' }], positiveFeedback: '' });
            } else { setAiError(true); }
            setSubmitted(true);
        },
    });

    const handleRun = () => {
        setOutput([]);
        const logs: string[] = [];
        const orig = console.log;
        console.log = (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        try { new Function(code)(); setOutput(logs.length > 0 ? logs : ['✅ Код выполнен без вывода']); }
        catch (e: any) { setOutput([`❌ Ошибка: ${e.message}`]); }
        console.log = orig;
    };

    const handleSaveDraft = () => localStorage.setItem(`draft-practice-${lectureId}`, code);
    const handleReset = () => { localStorage.removeItem(`draft-practice-${lectureId}`); setCode('// Напишите ваш код здесь\n'); setReview(null); setSubmitted(false); setAiError(false); };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!lecture) return <div className="flex items-center justify-center h-64 text-muted-foreground">Задание не найдено</div>;

    let parsedBlocks = null;
    if (lecture.content) { try { parsedBlocks = JSON.parse(lecture.content); } catch {} }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <Link to={`/course/${courseId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" />Вернуться к курсу</Link>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleSaveDraft}><Save className="h-3.5 w-3.5 mr-1" />Черновик</Button>
                    <Button variant="ghost" size="sm" onClick={handleReset}><RotateCcw className="h-3.5 w-3.5 mr-1" />Сбросить</Button>
                </div>
            </div>

            {!submitted ? (
                <div className="flex gap-6">
                    <div className="w-80 flex-shrink-0">
                        <Card className="p-5 bg-card/50 border-border/50 sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
                            <Badge variant="secondary" className="mb-3"><Code className="h-3 w-3 mr-1" />Практическая работа</Badge>
                            <h2 className="text-xl font-bold mb-3">{lecture.title || 'Практическое задание'}</h2>
                            <div className="text-sm text-muted-foreground">{parsedBlocks ? <BlockRenderer blocks={parsedBlocks} /> : <p>{lecture.content}</p>}</div>
                        </Card>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                            <Badge variant="secondary" className="uppercase text-xs">javascript</Badge>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg">
                            <Editor height="500px" language="javascript" value={code} onChange={(v) => setCode(v || '')} theme="vs-dark"
                                    options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', scrollBeyondLastLine: false, padding: { top: 16 }, fontFamily: 'JetBrains Mono, Fira Code, monospace', automaticLayout: true }} />
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleRun}><Play className="h-3.5 w-3.5 mr-1" />Запустить</Button>
                            <span className="text-xs text-muted-foreground">Проверьте код перед отправкой</span>
                        </div>
                        {output.length > 0 && (
                            <div className="mt-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-sm">
                                <div className="text-xs text-zinc-500 mb-2">Консоль:</div>
                                {output.map((line, i) => <div key={i} className={line.startsWith('❌') ? 'text-red-400' : 'text-green-400'}>{line}</div>)}
                            </div>
                        )}
                        <div className="mt-4 flex justify-end">
                            <div className="relative group">
                                <Button
                                    size="lg"
                                    onClick={() => submitMutation.mutate()}
                                    disabled={submitMutation.isPending}
                                    className="gap-2"
                                    variant="default"
                                >
                                    {submitMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    Отправить на проверку
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                    {review && (
                        <>
                            <Card className={`p-6 ${review.passed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${review.passed ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                                            {review.passed ? <CheckCircle className="h-8 w-8 text-emerald-500" /> : <AlertTriangle className="h-8 w-8 text-amber-500" />}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">{review.summary}</h2>
                                            {review.positiveFeedback && <p className="text-muted-foreground text-sm mt-1">{review.positiveFeedback}</p>}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-3xl font-black ${review.grade >= 4 ? 'text-emerald-500' : review.grade >= 3 ? 'text-amber-500' : 'text-red-500'}`}>{review.grade}</div>
                                        <div className="text-xs text-muted-foreground">оценка ИИ</div>
                                    </div>
                                </div>
                            </Card>

                            {review.issues?.length > 0 && (
                                <Card className="p-6">
                                    <h3 className="font-semibold text-lg mb-4"><Shield className="h-5 w-5 inline mr-1 text-primary" />Детальный разбор</h3>
                                    <div className="space-y-3">
                                        {review.issues.map((issue, i) => {
                                            const cfg = severityConfig[issue.severity] || severityConfig.info;
                                            const Icon = cfg.icon;
                                            return (
                                                <div key={i} className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                                                    <div className="flex items-start gap-3">
                                                        <Icon className={`h-5 w-5 ${cfg.color} flex-shrink-0 mt-0.5`} />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant="outline" className={`text-xs ${cfg.color} ${cfg.border}`}>{cfg.label}</Badge>
                                                                <span className="text-xs text-muted-foreground">Строка {issue.line}</span>
                                                            </div>
                                                            <p className="text-sm">{issue.message}</p>
                                                            {issue.suggestion && <p className="text-sm text-muted-foreground mt-1"><ArrowRight className="h-3.5 w-3.5 inline text-primary" />{issue.suggestion}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            )}

                            <Card className="p-6">
                                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Ваш код</h3>
                                <pre className="p-4 rounded-xl bg-zinc-900 text-green-400 text-sm overflow-x-auto font-mono">{code}</pre>
                            </Card>
                        </>
                    )}

                    {aiError && (
                        <Card className="p-6 border-red-500/30 bg-red-500/5 text-center">
                            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">Не удалось проверить код</h3>
                            <p className="text-sm text-muted-foreground mb-4">ИИ-сервис временно недоступен.</p>
                        </Card>
                    )}

                    {/* GitHub Push */}
                    <div className="flex flex-col items-center gap-3">
                        {!showPush ? (
                            <Button variant="outline" onClick={() => setShowPush(true)}><GitBranch className="h-4 w-4 mr-2" />Запушить в GitHub</Button>
                        ) : (
                            <div className="flex items-end gap-2 w-full max-w-md">
                                <div className="flex-1 space-y-1">
                                    <Input value={repoName} onChange={e => setRepoName(e.target.value)} placeholder="Название репозитория" className="text-sm" />
                                    <p className="text-xs text-muted-foreground">Репозиторий должен существовать</p>
                                </div>
                                <Button onClick={() => pushMutation.mutate()} disabled={!repoName || pushMutation.isPending} size="sm">
                                    {pushMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Пушить'}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => navigate(`/course/${courseId}`)}>Вернуться к курсу</Button>
                        <Button variant="outline" onClick={() => { setSubmitted(false); setReview(null); setAiError(false); }}>Попробовать снова</Button>
                    </div>
                </div>
            )}
        </div>
    );
}