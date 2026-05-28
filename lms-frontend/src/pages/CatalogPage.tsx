import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from '@/api/courses';
import { categoriesApi, type Category } from '@/api/categories';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Loader2, Search } from 'lucide-react';

const levelLabels = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
};

const levelColors = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
} as const;

export default function CatalogPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await categoriesApi.getAll();
            return res.data;
        },
    });

    const { data: courses, isLoading } = useQuery({
        queryKey: ['courses', selectedCategory, selectedLevel],
        queryFn: async () => {
            const res = await coursesApi.getAll({
                categoryId: selectedCategory || undefined,
                level: selectedLevel || undefined,
            });
            return res.data;
        },
    });

    const filteredCourses = courses?.filter(
        (c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Каталог курсов</h1>
                <p className="text-muted-foreground mt-1">
                    Найдите курс под ваши цели и уровень
                </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-4 mb-8 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск курсов..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Category filter */}
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedCategory === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                    >
                        Все
                    </Button>
                    {categories?.map((cat: Category) => (
                        <Button
                            key={cat.id}
                            variant={selectedCategory === cat.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {/* Level filter */}
                <div className="flex gap-2">
                    <Button
                        variant={selectedLevel === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedLevel(null)}
                    >
                        Все уровни
                    </Button>
                    {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                        <Button
                            key={lvl}
                            variant={selectedLevel === lvl ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedLevel(lvl)}
                        >
                            {levelLabels[lvl]}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Course grid */}
            {isLoading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {!isLoading && filteredCourses?.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    Курсы не найдены
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses?.map((course) => (
                    <Card
                        key={course.id}
                        className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                        onClick={() => navigate(`/course/${course.id}`)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <Badge variant="secondary" className={levelColors[course.level]}>
                                    {levelLabels[course.level]}
                                </Badge>
                            </div>

                            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{course.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {course.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course._count.modules} модулей
        </span>
                                <span className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
                                    {course.author.fullName}
        </span>
                            </div>

                            {course.category && (
                                <Badge variant="outline" className="mt-3">
                                    {course.category.name}
                                </Badge>
                            )}

                            {/* Теги */}
                            {course.tags && course.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {course.tags.slice(0, 3).map((tag) => (
                                        <Badge key={tag.id} variant="secondary" className="text-xs">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                    {course.tags.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{course.tags.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}