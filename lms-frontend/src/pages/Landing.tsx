import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import {
    Brain, Code, Zap, ArrowRight, Sparkles,
    LayoutTemplate, Terminal, Database, Cpu
} from 'lucide-react';

const features = [
    {
        icon: Brain,
        title: 'ИИ-ментор в каждой лекции',
        description: 'Задайте вопрос нейросети — она объяснит сложный материал простыми словами, зная контекст текущего урока и вашего кода.',
        colSpan: 'col-span-12 md:col-span-8',
    },
    {
        icon: Zap,
        title: 'Умная генерация',
        description: 'Превратите любой Word-документ в интерактивный курс.',
        colSpan: 'col-span-12 md:col-span-4',
    },
    {
        icon: Code,
        title: 'Подсветка синтаксиса',
        description: 'Поддержка React, TypeScript, Python и десятков других языков.',
        colSpan: 'col-span-12 md:col-span-4',
    },
    {
        icon: LayoutTemplate,
        title: 'Визуальный конструктор',
        description: 'Создавайте лекции в удобном редакторе. Поддержка Auto Layout и модульной структуры.',
        colSpan: 'col-span-12 md:col-span-8',
    },
];

const courses = [
    { icon: Terminal, title: 'Full-stack разработка', description: 'React, Vite, Node.js', level: 'Продвинутый', modules: 12 },
    { icon: Database, title: 'Бэкенд и Базы данных', description: 'PostgreSQL, Prisma, Express', level: 'Средний', modules: 8 },
    { icon: Cpu, title: 'Docker и деплой', description: 'От контейнера до продакшена', level: 'Средний', modules: 5 },
];

const stats = [
    { value: "50+", label: "Доступных курсов" },
    { value: "100+", label: "Практических задач" },
    { value: "YandexGPT", label: "Ядро ИИ-наставника" },
    { value: "0%", label: "Устаревшей теории" }
];

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
};

function FeatureCard({ feature }: { feature: typeof features[0] }) {
    const cardX = useMotionValue(0);
    const cardY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        cardX.set(clientX - left);
        cardY.set(clientY - top);
    }

    return (
        <motion.div
            variants={fadeInUp}
            onMouseMove={handleMouseMove}
            className={`${feature.colSpan} relative rounded-3xl p-[1px] bg-border/60 dark:bg-white/10 overflow-hidden group transition-all duration-300`}
        >
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            130px circle at ${cardX}px ${cardY}px,
                            #06b6d4 0%,
                            #3b82f6 50%,
                            transparent 100%
                        )
                    `
                }}
            />

            <div className="relative h-full w-full rounded-[23px] bg-card dark:bg-[#03060a]/98 p-8 backdrop-blur-md flex flex-col justify-between z-10">
                <div className="h-12 w-12 rounded-2xl bg-muted dark:bg-zinc-950 border border-border/80 flex items-center justify-center mb-12 shadow-xs transition-colors group-hover:border-blue-500/30">
                    <feature.icon className="h-5 w-5 text-foreground transition-colors group-hover:text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{feature.description}</p>
                </div>
            </div>
        </motion.div>
    );
}

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="relative overflow-hidden text-foreground min-h-screen selection:bg-blue-500/20 bg-background dark:bg-[linear-gradient(to_bottom,#021E33_0%,#010E1C_20vh,#020508_75vh,#020508_100%)]">
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-cyan-400/20 dark:bg-blue-400/30 rounded-full"
                        style={{
                            top: `${15 + Math.random() * 70}%`,
                            left: `${5 + Math.random() * 90}%`,
                        }}
                        animate={{
                            y: [0, -40, 0],
                            opacity: [0.2, 0.7, 0.2],
                            scale: [1, 1.4, 1]
                        }}
                        transition={{
                            duration: 6 + Math.random() * 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 4
                        }}
                    />
                ))}
            </div>

            <section className="relative min-h-[90vh] flex items-center pt-1 pb-16">
                <div className="container mx-auto px-4 max-w-7xl">
                    <motion.div
                        className="grid grid-cols-12 gap-8 items-center"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        {/* Текстовый блок */}
                        <div className="col-span-12 lg:col-span-6 relative z-10">
                            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 dark:bg-muted/20 border border-border/80 mb-8 backdrop-blur-md">
                                <Sparkles className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-medium">LMS нового поколения</span>
                            </motion.div>

                            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                                Обучение в <br />
                                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                                    среде кода.
                                </span>
                            </motion.h1>

                            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed font-light">
                                Интерактивная IT-платформа с ИИ-ментором. Создавайте курсы, пишите код и получайте ревью в реальном времени.
                            </motion.p>

                            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="relative group">
                                    <motion.div
                                        className="absolute -inset-[3px] bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-all duration-500"
                                        variants={{
                                            hover: { rotate: 360 }
                                        }}
                                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                    />

                                    <motion.button
                                        whileHover="hover"
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/register')}
                                        className="relative flex items-center gap-3 px-8 py-4 rounded-xl font-semibold bg-background dark:bg-[#070d14] text-foreground border border-blue-500/30 overflow-hidden transition-all duration-300"
                                    >


                                        <span className="relative z-10 flex items-center gap-2">
            Начать обучение
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </span>
                                    </motion.button>
                                </div>

                                <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                                    <div className="flex -space-x-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px]">👤</div>
                                        ))}
                                    </div>
                                    <span>Уже учатся с нами</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Интерактивный Терминал */}
                        <motion.div className="col-span-12 lg:col-span-6 mt-12 lg:mt-0 relative group perspective-1000" variants={fadeInUp}>
                            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
                            <div className="relative rounded-2xl bg-zinc-950/90 dark:bg-black/90 border border-black/10 dark:border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.01]">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                    </div>
                                    <div className="mx-auto text-xs text-zinc-400 font-mono">lesson_01.tsx</div>
                                </div>
                                <div className="p-6 font-mono text-sm sm:text-base text-zinc-300 leading-relaxed overflow-x-auto">
                                    <div className="flex gap-4">
                                        <div className="text-zinc-600 select-none text-right">1<br/>2<br/>3<br/>4<br/>5</div>
                                        <div>
                                            <span className="text-pink-400">const</span> <span className="text-blue-400">PrismaLMS</span> <span className="text-pink-400">=</span> () <span className="text-pink-400">=&gt;</span> {'{'} <br />
                                            &nbsp;&nbsp;<span className="text-pink-400">const</span> [isLearning] <span className="text-pink-400">=</span> <span className="text-cyan-400">useState</span>(<span className="text-orange-400">true</span>); <br />
                                            &nbsp;&nbsp;<span className="text-pink-400">return</span> &lt;<span className="text-green-400">AiMentor</span> /&gt;; <br />
                                            {'}'}
                                        </div>
                                    </div>
                                    <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Brain className="w-4 h-4 text-blue-400" />
                                            <span className="text-xs font-semibold text-blue-400">ИИ-Ментор</span>
                                        </div>
                                        <p className="text-xs text-zinc-300 font-sans">
                                            Обратите внимание: использование хука useState требует импорта из 'react'. Хотите, я добавлю импорт за вас?
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <motion.section
                className="py-12 border-y border-border/40 bg-muted/10 backdrop-blur-xs"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat, i) => (
                        <div key={i}>
                            <div className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">{stat.value}</div>
                            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </motion.section>

            <section className="py-32 relative">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="mb-16 md:w-5/12">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Всё для глубокого погружения</h2>
                        <p className="text-muted-foreground">Мы переосмыслили процесс обучения, объединив строгую структуру с современными AI-инструментами.</p>
                    </div>

                    <motion.div
                        className="grid grid-cols-12 gap-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        {features.map((feature, i) => (
                            <FeatureCard key={i} feature={feature} />
                        ))}
                    </motion.div>
                </div>
            </section>

            <section className="py-32 border-t border-border/20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Образовательные треки</h2>
                            <p className="text-muted-foreground">От основ фронтенда до архитектуры баз данных и контейнеризации.</p>
                        </div>
                        <button onClick={() => navigate('/courses')} className="inline-flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
                            Смотреть каталог <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {courses.map((course, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-muted/20 dark:bg-muted/5 border border-border/40 hover:bg-muted/40 dark:hover:bg-muted/10 transition-all duration-300">
                                <course.icon className="w-8 h-8 mb-6 text-blue-400" />
                                <div className="flex gap-2 mb-4">
                                    <span className="text-[11px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-background border border-border text-foreground">
                                        {course.level}
                                    </span>
                                    <span className="text-[11px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-background border border-border text-muted-foreground">
                                        {course.modules} модулей
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                                <p className="text-sm text-muted-foreground">{course.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}