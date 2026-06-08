import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { lecturesApi } from '@/api/lectures';
import { aiApi } from '@/api/ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LectureEditor from '@/components/lecture/editor/LectureEditor';
import LectureGenerator from '@/components/lecture/editor/LectureGenerator';
import BlockRenderer from '@/components/lecture/BlockRenderer';
import type { LectureBlock } from '@/types/lecture';
import { Loader2, Eye, Pen, Save, Sparkles, Wand2, CheckCircle, HelpCircle, Plus, Trash2, GripVertical } from 'lucide-react';

interface TestQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
}

export default function LectureCreatePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const moduleId = parseInt(searchParams.get('moduleId') || '0');

    const [title, setTitle] = useState('');
    const [type, setType] = useState<'theory' | 'practice' | 'quiz'>('theory');
    const [orderIndex, setOrderIndex] = useState(1);
    const [blocks, setBlocks] = useState<LectureBlock[]>([]);
    const [showGenerator, setShowGenerator] = useState(false);

    // Квиз
    const [quizTopic, setQuizTopic] = useState('');
    const [questionCount, setQuestionCount] = useState(5);
    const [quizQuestions, setQuizQuestions] = useState<TestQuestion[]>([]);
    const [quizGenerated, setQuizGenerated] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [showQuizResults, setShowQuizResults] = useState(false);
    const [quizMode, setQuizMode] = useState<'generate' | 'manual'>('generate'); // генерация или ручной ввод

    // Ручное создание вопроса
    const [manualQuestion, setManualQuestion] = useState('');
    const [manualOptions, setManualOptions] = useState(['', '', '', '']);
    const [manualCorrect, setManualCorrect] = useState(0);

    const createMutation = useMutation({
        mutationFn: () =>
            lecturesApi.create({
                title,
                content: type === 'quiz' ? JSON.stringify(quizQuestions) : JSON.stringify(blocks),
                type,
                orderIndex,
                moduleId,
            }),
        onSuccess: () => navigate(-1),
    });

    const generateTestMutation = useMutation({
        mutationFn: () => aiApi.generateTest(quizTopic, questionCount),
        onSuccess: (res) => {
            const questions = (res.data.questions || []).map((q: any) => ({ ...q, id: `q-${Date.now()}-${Math.random()}` }));
            setQuizQuestions(prev => [...prev, ...questions]);
            setQuizGenerated(true);
            setQuizTopic('');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate();
    };

    const handleBlocksGenerated = (newBlocks: LectureBlock[]) => {
        const blocksWithIds = newBlocks.map((block, i) => ({ ...block, id: `gen-${Date.now()}-${i}` }));
        setBlocks((prev) => [...prev, ...blocksWithIds]);
        setShowGenerator(false);
    };

    const addManualQuestion = () => {
        if (!manualQuestion.trim() || manualOptions.some(o => !o.trim())) return;
        const newQ: TestQuestion = {
            id: `mq-${Date.now()}`,
            question: manualQuestion,
            options: [...manualOptions],
            correctIndex: manualCorrect,
        };
        setQuizQuestions(prev => [...prev, newQ]);
        setManualQuestion('');
        setManualOptions(['', '', '', '']);
        setManualCorrect(0);
        setQuizGenerated(true);
    };

    const removeQuestion = (id: string) => {
        setQuizQuestions(prev => prev.filter(q => q.id !== id));
    };

    const correctCount = quizQuestions.filter((q, i) => selectedAnswers[i] === q.correctIndex).length;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Создание лекции</h1>

            <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Заголовок</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Порядковый номер</Label>
                        <Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(parseInt(e.target.value))} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Тип</Label>
                    <div className="flex gap-2">
                        <Button type="button" variant={type === 'theory' ? 'default' : 'outline'} onClick={() => setType('theory')}>Теория</Button>
                        <Button type="button" variant={type === 'practice' ? 'default' : 'outline'} onClick={() => setType('practice')}>Практика</Button>
                        <Button type="button" variant={type === 'quiz' ? 'default' : 'outline'} onClick={() => setType('quiz')}>
                            <HelpCircle className="h-4 w-4 mr-1" />Тест
                        </Button>
                    </div>
                </div>
            </div>

            {/* ЛЕКЦИЯ */}
            {type !== 'quiz' && (
                <>
                    {!showGenerator && (
                        <Button variant="outline" className="mb-6" onClick={() => setShowGenerator(true)}>
                            <Sparkles className="h-4 w-4 mr-2" />Сгенерировать лекцию из Word
                        </Button>
                    )}
                    {showGenerator && (
                        <div className="mb-6">
                            <LectureGenerator onBlocksGenerated={handleBlocksGenerated} onClose={() => setShowGenerator(false)} />
                        </div>
                    )}

                    <Tabs defaultValue="edit">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList>
                                <TabsTrigger value="edit"><Pen className="h-4 w-4 mr-1" />Конструктор</TabsTrigger>
                                <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-1" />Предпросмотр</TabsTrigger>
                            </TabsList>
                            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Сохранить
                            </Button>
                        </div>
                        <TabsContent value="edit"><LectureEditor blocks={blocks} onChange={setBlocks} /></TabsContent>
                        <TabsContent value="preview">
                            <Card><CardHeader><CardTitle>{title || 'Без названия'}</CardTitle></CardHeader>
                                <CardContent><BlockRenderer blocks={blocks} /></CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}

            {/* ТЕСТ */}
            {type === 'quiz' && (
                <div className="space-y-6">
                    {/* Выбор режима */}
                    <div className="flex gap-2">
                        <Button variant={quizMode === 'generate' ? 'default' : 'outline'} size="sm" onClick={() => setQuizMode('generate')}>
                            <Wand2 className="h-4 w-4 mr-1" />ИИ-генерация
                        </Button>
                        <Button variant={quizMode === 'manual' ? 'default' : 'outline'} size="sm" onClick={() => setQuizMode('manual')}>
                            <Plus className="h-4 w-4 mr-1" />Вручную
                        </Button>
                    </div>

                    {/* ИИ-ГЕНЕРАЦИЯ */}
                    {quizMode === 'generate' && (
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Генерация теста</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Тема</Label>
                                    <Input value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} placeholder="Основы JavaScript" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Вопросов</Label>
                                    <div className="flex gap-2">
                                        {[3, 5, 7, 10].map(n => (
                                            <Button key={n} variant={questionCount === n ? 'default' : 'outline'} size="sm" onClick={() => setQuestionCount(n)}>{n}</Button>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={() => generateTestMutation.mutate()} disabled={!quizTopic.trim() || generateTestMutation.isPending} className="gap-2">
                                    {generateTestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                    Сгенерировать
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* РУЧНОЕ СОЗДАНИЕ */}
                    {quizMode === 'manual' && (
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Добавить вопрос</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <Input value={manualQuestion} onChange={(e) => setManualQuestion(e.target.value)} placeholder="Текст вопроса" />
                                {manualOptions.map((opt, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <Badge variant={manualCorrect === i ? 'default' : 'outline'} className="cursor-pointer w-8 h-8 flex items-center justify-center" onClick={() => setManualCorrect(i)}>
                                            {['A', 'B', 'C', 'D'][i]}
                                        </Badge>
                                        <Input value={opt} onChange={(e) => { const o = [...manualOptions]; o[i] = e.target.value; setManualOptions(o); }} placeholder={`Вариант ${['A', 'B', 'C', 'D'][i]}`} />
                                    </div>
                                ))}
                                <p className="text-xs text-muted-foreground">Нажмите на букву, чтобы выбрать правильный ответ</p>
                                <Button onClick={addManualQuestion} disabled={!manualQuestion.trim()} className="gap-1 w-full">
                                    <Plus className="h-4 w-4" />Добавить вопрос
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Список вопросов */}
                    {quizQuestions.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Вопросы ({quizQuestions.length})</h3>
                                <Button variant="outline" size="sm" onClick={() => { setShowQuizResults(!showQuizResults); if (showQuizResults) setSelectedAnswers({}); }}>
                                    {showQuizResults ? 'Редактировать' : 'Пройти тест'}
                                </Button>
                            </div>

                            {showQuizResults && (
                                <Card className="border-emerald-500/30 bg-emerald-500/5">
                                    <CardContent className="p-4 text-center">
                                        {Object.keys(selectedAnswers).length > 0 && (
                                            <>
                                                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                                                <div className="text-xl font-bold">{correctCount}/{quizQuestions.length}</div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {quizQuestions.map((q, i) => (
                                <Card key={q.id} className={showQuizResults && selectedAnswers[i] !== undefined ? (selectedAnswers[i] === q.correctIndex ? 'border-emerald-500/30' : 'border-red-500/30') : ''}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-start gap-2">
                                                <Badge variant="secondary" className="mt-0.5">{i + 1}</Badge>
                                                <span className="font-medium text-sm">{q.question}</span>
                                            </div>
                                            {!showQuizResults && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => removeQuestion(q.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            {q.options.map((opt, j) => {
                                                const isSelected = selectedAnswers[i] === j;
                                                const isCorrect = q.correctIndex === j;
                                                let variant: 'default' | 'outline' = isSelected ? 'default' : 'outline';
                                                if (showQuizResults && isCorrect) variant = 'default';
                                                return (
                                                    <button
                                                        key={j}
                                                        onClick={() => !showQuizResults ? null : setSelectedAnswers({ ...selectedAnswers, [i]: j })}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                                                            showQuizResults && isCorrect
                                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                                                                : showQuizResults && isSelected && !isCorrect
                                                                    ? 'border-red-500/30 bg-red-500/10 text-red-500'
                                                                    : isSelected
                                                                        ? 'border-primary bg-primary/10'
                                                                        : 'border-border hover:bg-muted'
                                                        }`}
                                                    >
                                                        <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][j]}.</span>
                                                        {opt}
                                                        {showQuizResults && isCorrect && <CheckCircle className="h-3.5 w-3.5 inline ml-1 text-emerald-500" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Сохранить */}
                    <div className="flex justify-center">
                        <Button onClick={handleSubmit} disabled={createMutation.isPending || quizQuestions.length === 0} size="lg">
                            {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Сохранить тест
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Отмена</Button>
            </div>
        </div>
    );
}