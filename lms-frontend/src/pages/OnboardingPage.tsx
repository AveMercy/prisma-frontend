import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, type Category } from '@/api/categories';
import { tagsApi, type Tag } from '@/api/tags';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, ArrowRight, Check } from 'lucide-react';

const steps = ['Категории', 'Технологии', 'Уровень'];

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [level, setLevel] = useState<string>('beginner');

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await categoriesApi.getAll();
            return res.data;
        },
    });

    const { data: tags } = useQuery({
        queryKey: ['tags'],
        queryFn: async () => {
            const res = await tagsApi.getAll();
            return res.data;
        },
    });

    const toggleCategory = (id: number) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const toggleTag = (id: number) => {
        setSelectedTags((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const handleFinish = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <GraduationCap className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h1 className="text-2xl font-bold">Настроим ваше обучение</h1>
                    <p className="text-muted-foreground mt-1">
                        Выберите, что вам интересно, и мы подберём подходящие курсы
                    </p>
                </div>

                <div className="mb-8">
                    <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        {steps.map((s, i) => (
                            <span key={s} className={i <= step ? 'text-primary font-medium' : ''}>
                {s}
              </span>
                        ))}
                    </div>
                </div>

                {step === 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Какие направления вас интересуют?</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {categories?.map((cat: Category) => (
                                <Card
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`cursor-pointer p-4 transition-all ${
                                        selectedCategories.includes(cat.id)
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                            : 'hover:border-primary/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{cat.name}</span>
                                        {selectedCategories.includes(cat.id) && (
                                            <Check className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Какие технологии знаете или хотите изучить?</h2>
                        <div className="flex flex-wrap gap-2">
                            {tags?.map((tag: Tag) => (
                                <Badge
                                    key={tag.id}
                                    variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                                    className="cursor-pointer px-4 py-2 text-sm"
                                    onClick={() => toggleTag(tag.id)}
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Ваш текущий уровень?</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {[
                                { value: 'beginner', label: 'Начинающий', desc: 'Только начинаю' },
                                { value: 'intermediate', label: 'Средний', desc: 'Есть база, хочу глубже' },
                                { value: 'advanced', label: 'Продвинутый', desc: 'Хочу сложные темы' },
                            ].map((opt) => (
                                <Card
                                    key={opt.value}
                                    onClick={() => setLevel(opt.value)}
                                    className={`cursor-pointer p-4 text-center transition-all ${
                                        level === opt.value
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                            : 'hover:border-primary/50'
                                    }`}
                                >
                                    <h3 className="font-semibold">{opt.label}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
                        Назад
                    </Button>

                    {step < steps.length - 1 ? (
                        <Button onClick={() => setStep((s) => s + 1)}>
                            Далее
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleFinish}>
                            Начать обучение
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    Можно пропустить и настроить позже в профиле
                </p>
            </div>
        </div>
    );
}