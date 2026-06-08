import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, HelpCircle } from 'lucide-react';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
}

export default function QuizRenderer({ content }: { content: string }) {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);

    let questions: Question[] = [];
    try {
        questions = JSON.parse(content);
    } catch {
        return <p className="text-muted-foreground">Тест недоступен</p>;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
        return <p className="text-muted-foreground">Тест пуст</p>;
    }

    const correctCount = questions.filter((q, i) => selectedAnswers[i] === q.correctIndex).length;
    const allAnswered = Object.keys(selectedAnswers).length === questions.length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-bold">Тест: {questions.length} вопросов</h2>
            </div>

            {showResults && (
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardContent className="p-6 text-center">
                        <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold mb-2">{correctCount}/{questions.length}</div>
                        <p className="text-muted-foreground">
                            {correctCount === questions.length
                                ? 'Отлично! Все ответы правильные!'
                                : correctCount >= questions.length / 2
                                    ? 'Хороший результат!'
                                    : 'Попробуйте ещё раз'}
                        </p>
                        <Button variant="outline" className="mt-4" onClick={() => { setShowResults(false); setSelectedAnswers({}); }}>
                            Пройти заново
                        </Button>
                    </CardContent>
                </Card>
            )}

            {questions.map((q, i) => (
                <Card key={i} className={showResults ? (selectedAnswers[i] === q.correctIndex ? 'border-emerald-500/30' : 'border-red-500/30') : ''}>
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <Badge variant="secondary" className="mt-0.5">{i + 1}</Badge>
                            <h3 className="font-semibold">{q.question}</h3>
                        </div>
                        <div className="space-y-2">
                            {q.options.map((opt, j) => {
                                const isSelected = selectedAnswers[i] === j;
                                const isCorrect = q.correctIndex === j;
                                return (
                                    <button
                                        key={j}
                                        onClick={() => !showResults && setSelectedAnswers({ ...selectedAnswers, [i]: j })}
                                        disabled={showResults}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                                            showResults && isCorrect
                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                                                : showResults && isSelected && !isCorrect
                                                    ? 'border-red-500/30 bg-red-500/10 text-red-500'
                                                    : isSelected
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border hover:bg-muted'
                                        }`}
                                    >
                                        <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][j]}.</span>
                                        {opt}
                                        {showResults && isCorrect && <CheckCircle className="h-4 w-4 inline ml-1 text-emerald-500" />}
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {!showResults && (
                <div className="flex justify-center">
                    <Button size="lg" onClick={() => setShowResults(true)} disabled={!allAnswered}>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Проверить ответы
                    </Button>
                </div>
            )}
        </div>
    );
}