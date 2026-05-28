import { useState } from 'react';
import CodeEditor from '@/components/CodePlayground/CodeEditor';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Code, Star, Zap, Trophy, Flame, LayoutGrid, Terminal } from 'lucide-react';

interface Task {
    id: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    language: string;
    starterCode: string;
}

const tasks: Task[] = [
    {
        id: 1,
        title: 'Сложение двух чисел',
        description: 'Напишите функцию sum(a, b), которая возвращает сумму двух чисел.',
        difficulty: 'easy',
        language: 'javascript',
        starterCode: 'function sum(a, b) {\n  // Ваш код здесь\n  \n}',
    },
    {
        id: 2,
        title: 'Проверка на чётность',
        description: 'Напишите функцию isEven(n), которая возвращает true для чётных чисел и false для нечётных.',
        difficulty: 'easy',
        language: 'javascript',
        starterCode: 'function isEven(n) {\n  // Ваш код здесь\n  \n}',
    },
    {
        id: 3,
        title: 'Переворот строки',
        description: 'Напишите функцию reverseString(str), которая переворачивает строку. Например: "hello" → "olleh".',
        difficulty: 'easy',
        language: 'javascript',
        starterCode: 'function reverseString(str) {\n  // Ваш код здесь\n  \n}',
    },
    {
        id: 4,
        title: 'FizzBuzz',
        description: 'Напишите функцию fizzBuzz(n), которая возвращает массив чисел от 1 до n. Для чисел кратных 3 — "Fizz", кратных 5 — "Buzz", кратных и 3 и 5 — "FizzBuzz".',
        difficulty: 'medium',
        language: 'javascript',
        starterCode: 'function fizzBuzz(n) {\n  // Ваш код здесь\n  \n}',
    },
    {
        id: 5,
        title: 'Поиск максимального числа',
        description: 'Напишите функцию findMax(arr), которая находит максимальное число в массиве без использования Math.max().',
        difficulty: 'medium',
        language: 'javascript',
        starterCode: 'function findMax(arr) {\n  // Ваш код здесь\n  \n}',
    },
    {
        id: 6,
        title: 'Проверка палиндрома',
        description: 'Напишите функцию isPalindrome(str), которая проверяет, является ли строка палиндромом (читается одинаково в обе стороны).',
        difficulty: 'medium',
        language: 'javascript',
        starterCode: 'function isPalindrome(str) {\n  // Ваш код здесь\n  \n}',
    },
    {
        id: 7,
        title: 'Сортировка пузырьком',
        description: 'Напишите функцию bubbleSort(arr), которая сортирует массив чисел по возрастанию методом пузырька.',
        difficulty: 'hard',
        language: 'javascript',
        starterCode: 'function bubbleSort(arr) {\n  // Ваш код здесь\n  \n}',
    },
    {
        id: 8,
        title: 'Фибоначчи',
        description: 'Напишите функцию fibonacci(n), которая возвращает n-е число Фибоначчи (нумерация с 0: fib(0)=0, fib(1)=1).',
        difficulty: 'hard',
        language: 'javascript',
        starterCode: 'function fibonacci(n) {\n  // Ваш код здесь\n  \n}',
    },
];

const difficultyConfig = {
    easy: { label: 'Простая', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    medium: { label: 'Средняя', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    hard: { label: 'Сложная', icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

export default function CodePlaygroundPage() {
    const [selectedTask, setSelectedTask] = useState<Task>(tasks[0]);
    const [filter, setFilter] = useState<string>('all');

    const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.difficulty === filter);

    return (
        <div className="min-h-screen bg-background text-foreground relative py-8 px-4 overflow-x-hidden">
            {/* Неоновые сферы на фоне */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/5 blur-[120px]" />
            </div>

            <div className="container mx-auto max-w-7xl">
                {/* Верхняя панель (Header) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-card/20 p-6 rounded-3xl border border-border/40 backdrop-blur-xl">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                            Code Playground
                        </h1>
                        <p className="text-sm text-muted-foreground font-light mt-1">
                            Интерактивная песочница. Тренируйтесь писать чистый код под присмотром ИИ.
                        </p>
                    </div>

                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[180px] rounded-xl bg-muted/40 border-border/60 focus:ring-blue-500/20">
                            <SelectValue placeholder="Сложность" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-popover/90 backdrop-blur-xl border-border">
                            <SelectItem value="all">Все задачи</SelectItem>
                            <SelectItem value="easy">Простые</SelectItem>
                            <SelectItem value="medium">Средние</SelectItem>
                            <SelectItem value="hard">Сложные</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Основная рабочая область */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* Список задач (Слева) */}
                    <div className="w-full lg:w-80 flex-shrink-0 space-y-3 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto pr-1">
                        <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1 pl-1 flex items-center gap-1.5">
                            <LayoutGrid className="w-3.5 h-3.5" /> Доступные кейсы
                        </div>
                        {filteredTasks.map((task) => {
                            const diff = difficultyConfig[task.difficulty];
                            const Icon = diff.icon;
                            const isSelected = selectedTask.id === task.id;

                            return (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                                        isSelected
                                            ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                            : 'bg-card/30 border-border/50 hover:border-foreground/20 hover:bg-card/50'
                                    }`}
                                >
                                    <div className="flex flex-col gap-2 relative z-10">
                                        <h3 className={`font-bold text-sm tracking-tight transition-colors ${isSelected ? 'text-blue-400' : 'text-foreground'}`}>
                                            {task.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground/80 font-light line-clamp-2 leading-relaxed">
                                            {task.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-[9px] font-mono font-bold tracking-wider uppercase bg-muted/60 border border-border/40 text-muted-foreground px-2 py-0.5 rounded-md">
                                                {task.language}
                                            </Badge>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${diff.color} ${diff.bg} px-2.5 py-0.5 rounded-md border`}>
                                                <Icon className="h-2.5 w-2.5" />
                                                {diff.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Панель описания текущей задачи + Редактор кода (Справа) */}
                    <div className="flex-1 min-w-0 w-full space-y-6">
                        <div className="p-6 rounded-3xl bg-card/20 border border-border/40 backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold tracking-tight">{selectedTask.title}</h2>
                                <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${difficultyConfig[selectedTask.difficulty].color} ${difficultyConfig[selectedTask.difficulty].bg} px-2.5 py-0.5 rounded-md border`}>
                                    {difficultyConfig[selectedTask.difficulty].label}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed font-light">{selectedTask.description}</p>
                        </div>

                        {/* Ключ key={selectedTask.id} ГАРАНТИРУЕТ сброс кода и панели ревью при переключении задач */}
                        <CodeEditor
                            key={selectedTask.id}
                            initialCode={selectedTask.starterCode}
                            language={selectedTask.language}
                            taskDescription={selectedTask.description}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}