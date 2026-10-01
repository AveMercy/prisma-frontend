import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, type Category } from '@/api/categories';
import { tagsApi, type Tag } from '@/api/tags';
import { coursesApi, type Course } from '@/api/courses';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Logo from '@/pages/Logo';
import { ArrowRight, Check, Sparkles, Code, Globe, Database, Palette, Smartphone, BarChart3, Wrench, Users } from 'lucide-react';

const steps = ['Категории', 'Технологии', 'Уровень'];

const categoryIcons: Record<string, React.ElementType> = {
    'Веб-разработка': Globe,
    'DevOps и инфраструктура': Database,
    'Дизайн и UX/UI': Palette,
    'Мобильная разработка': Smartphone,
    'Аналитика данных': BarChart3,
    'Инструменты разработки': Wrench,
    'Soft Skills и процессы': Users,
};

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [level, setLevel] = useState<string>('beginner');

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => { const res = await categoriesApi.getAll(); return res.data; },
    });

    const { data: tags } = useQuery({
        queryKey: ['tags'],
        queryFn: async () => { const res = await tagsApi.getAll(); return res.data; },
    });

    const toggleCategory = (id: number) => {
        setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };

    const toggleTag = (id: number) => {
        setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const handleFinish = async () => {
        try {
            if (selectedCategories.length > 0) {
                const res = await coursesApi.getAll({ categoryId: selectedCategories[0] });
                const courseIds = res.data.map((c: Course) => c.id);
                if (courseIds.length > 0) {
                    await coursesApi.enroll(courseIds.slice(0, 5));
                }
            }
        } catch (err) {
            console.error('Ошибка записи на курсы:', err);
        }
        navigate('/dashboard');
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <h1 className="text-2xl font-bold mt-4">Настроим ваше обучение</h1>
                    <p className="text-muted-foreground mt-1.5">
                        Выберите, что вам интересно, и мы подберём подходящие курсы
                    </p>
                </div>

                <div className="mb-8">
                    <Progress value={((step + 1) / steps.length) * 100} className="h-1.5" />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        {steps.map((s, i) => (
                            <span key={s} className={i <= step ? 'text-primary font-medium' : ''}>{s}</span>
                        ))}
                    </div>
                </div>

                {step === 0 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Какие направления вас интересуют?</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {categories?.map((cat: Category) => {
                                const Icon = categoryIcons[cat.name] || Code;
                                const isSelected = selectedCategories.includes(cat.id);
                                return (
                                    <Card
                                        key={cat.id}
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`cursor-pointer p-4 transition-all border-2 ${
                                            isSelected
                                                ? 'border-primary/50 bg-primary/5 shadow-sm'
                                                : 'border-transparent hover:border-primary/20 hover:bg-muted/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                                                isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                            }`}>
                                                <Icon className="h-4.5 w-4.5" />
                                            </div>
                                            <span className="font-medium text-sm">{cat.name}</span>
                                            {isSelected && (
                                                <div className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Какие технологии знаете или хотите изучить?</h2>
                        <div className="flex flex-wrap gap-2">
                            {tags?.map((tag: Tag) => (
                                <Badge
                                    key={tag.id}
                                    variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                                    className={`cursor-pointer px-3.5 py-2 text-sm transition-all ${
                                        selectedTags.includes(tag.id)
                                            ? 'shadow-sm'
                                            : 'hover:bg-muted'
                                    }`}
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
                        <h2 className="text-lg font-semibold mb-4">Ваш текущий уровень?</h2>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {[
                                { value: 'beginner', label: 'Начинающий', desc: 'Только начинаю', emoji: '🌱' },
                                { value: 'intermediate', label: 'Средний', desc: 'Есть база, хочу глубже', emoji: '🔥' },
                                { value: 'advanced', label: 'Продвинутый', desc: 'Хочу сложные темы', emoji: '🚀' },
                            ].map((opt) => (
                                <Card
                                    key={opt.value}
                                    onClick={() => setLevel(opt.value)}
                                    className={`cursor-pointer p-4 text-center transition-all border-2 ${
                                        level === opt.value
                                            ? 'border-primary/50 bg-primary/5 shadow-sm'
                                            : 'border-transparent hover:border-primary/20 hover:bg-muted/50'
                                    }`}
                                >
                                    <div className="text-2xl mb-1.5">{opt.emoji}</div>
                                    <h3 className="font-semibold text-sm">{opt.label}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
                        Назад
                    </Button>

                    {step < steps.length - 1 ? (
                        <Button onClick={() => setStep(s => s + 1)}>
                            Далее
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleFinish} className="gap-2">
                            <Sparkles className="h-4 w-4" />
                            Начать обучение
                        </Button>
                    )}
                </div>

                <p className="text-center text-sm text-muted-foreground mt-5">
                    Можно пропустить и настроить позже в профиле
                </p>
            </div>
        </div>
    );
}