import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    Brain,
    Code,
    Users,
    Zap,
    Trophy,
    ArrowRight,
    CheckCircle
} from 'lucide-react';

const features = [
    {
        icon: Brain,
        title: 'ИИ-ментор',
        description: 'Нейросеть объяснит сложный материал простыми словами прямо во время обучения.',
    },
    {
        icon: Code,
        title: 'IT-специализация',
        description: 'Курсы по программированию, DevOps, веб-разработке и другим направлениям.',
    },
    {
        icon: Users,
        title: 'Группы и соло',
        description: 'Учитесь с группой от учебного заведения или самостоятельно в своём темпе.',
    },
    {
        icon: Zap,
        title: 'Автогенерация лекций',
        description: 'Преподаватели загружают Word-файл, а нейросеть превращает его в интерактивную лекцию.',
    },
    {
        icon: Trophy,
        title: 'Ачивки и прогресс',
        description: 'Отслеживайте свой прогресс и получайте достижения за успехи.',
    },
    {
        icon: BookOpen,
        title: 'Практические задания',
        description: 'Закрепляйте теорию реальными задачами с проверкой преподавателем.',
    },
];

const advantages = [
    'Адаптивный онбординг — платформа подбирает курсы под ваш уровень',
    'Тёмная и светлая тема — комфортное обучение в любое время суток',
    'Markdown-рендеринг с подсветкой кода для IT-материалов',
    'Реакции на лекции — преподаватель видит, где студентам сложно',
];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
                <div className="container mx-auto px-4 py-24 relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <Badge variant="secondary" className="mb-6 text-sm">
                            🚀 Современная LMS для IT-образования
                        </Badge>
                        <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-6xl">
                            Учитесь программированию
                            <span className="block text-primary">с умными технологиями</span>
                        </h1>
                        <p className="mb-8 text-lg text-muted-foreground">
                            CodeLearn — образовательная платформа нового поколения.
                            ИИ-помощник, адаптивные курсы, работа в группах и персональные треки обучения.
                        </p>
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <Button size="lg" className="text-lg px-8" onClick={() => navigate('/register')}>
                                Начать обучение
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate('/login')}>
                                У меня уже есть аккаунт
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="container mx-auto px-4 py-20">
                <h2 className="mb-12 text-center text-3xl font-bold">
                    Возможности платформы
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <Card key={feature.title} className="transition-shadow hover:shadow-lg">
                            <CardContent className="p-6">
                                <feature.icon className="mb-4 h-10 w-10 text-primary" />
                                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Advantages & CTA */}
            <section className="bg-muted/50">
                <div className="container mx-auto px-4 py-20">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="mb-8 text-center text-3xl font-bold">
                            Почему CodeLearn?
                        </h2>
                        <div className="space-y-4">
                            {advantages.map((item) => (
                                <div key={item} className="flex items-start gap-3">
                                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                    <span className="text-muted-foreground">{item}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 text-center">
                            <Button size="lg" className="text-lg px-8" onClick={() => navigate('/register')}>
                                Попробовать бесплатно
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}