import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { coursesApi } from '@/api/courses';
import { practiceApi } from '@/api/practice';
import { assignmentsApi } from '@/api/assignments';
import { progressApi } from '@/api/progress';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    BookOpen, GraduationCap, Loader2, Star, Code, FileText,
    TrendingUp, Clock, CheckCircle, AlertCircle, ChevronRight,
    Zap, Trophy, Activity, Calendar,
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';

function StudentDashboard() {
    const navigate = useNavigate();

    // Прогресс
    const { data: progressData } = useQuery({
        queryKey: ['myProgress'],
        queryFn: async () => { const res = await progressApi.getMy(); return res.data?.progress || []; },
    });

    // Практические
    const { data: practiceSubs = [] } = useQuery({
        queryKey: ['myGrades'],
        queryFn: async () => { const res = await practiceApi.getMyGrades(); return res.data?.submissions || []; },
    });

    // Задания
    const { data: myAssignments = [] } = useQuery({
        queryKey: ['myAssignments'],
        queryFn: async () => {
            const res = await assignmentsApi.getMyAssignments();
            const data = res.data;
            return Array.isArray(data) ? data : data?.assignments || [];
        },
    });

    // Курсы
    const { data: coursesData } = useQuery({
        queryKey: ['myCourses'],
        queryFn: async () => { const res = await coursesApi.getMy(); return res.data?.courses || []; },
    });

    const courses = Array.isArray(coursesData) ? coursesData : [];
    const completedLectures = progressData?.filter((p: any) => p.isCompleted).length || 0;
    const totalLectures = progressData?.length || 0;
    const gradedPractice = practiceSubs.filter((s: any) => s.grade != null);
    const avgGrade = gradedPractice.length > 0
        ? (gradedPractice.reduce((sum: number, s: any) => sum + s.grade, 0) / gradedPractice.length).toFixed(1)
        : null;
    const pendingAssignments = myAssignments.filter((a: any) => a.submissions?.[0] && a.submissions[0].grade == null).length;

    // Данные для графика активности
    const activityData = generateActivityData();

    // Календарь
    const calendarData = generateCalendarData(progressData);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Дашборд</h1>
            <p className="text-muted-foreground mb-8">Ваш прогресс и активность</p>

            {/* Карточки статистики */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                        <BookOpen className="h-5 w-5 text-primary mb-2" />
                        <div className="text-2xl font-bold">{courses.length}</div>
                        <div className="text-xs text-muted-foreground">Активных курсов</div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="p-4">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mb-2" />
                        <div className="text-2xl font-bold">{completedLectures}/{totalLectures}</div>
                        <div className="text-xs text-muted-foreground">Пройдено лекций</div>
                    </CardContent>
                </Card>
                <Card className="bg-amber-500/5 border-amber-500/20">
                    <CardContent className="p-4">
                        <Trophy className="h-5 w-5 text-amber-500 mb-2" />
                        <div className="text-2xl font-bold">{avgGrade || '—'}</div>
                        <div className="text-xs text-muted-foreground">Средний балл</div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardContent className="p-4">
                        <AlertCircle className="h-5 w-5 text-blue-500 mb-2" />
                        <div className="text-2xl font-bold">{pendingAssignments}</div>
                        <div className="text-xs text-muted-foreground">На проверке</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
                {/* График активности */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Активность за неделю
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                                <Tooltip
                                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {activityData.map((_, i) => (
                                        <Cell key={i} fill={i === activityData.length - 1 ? '#3b82f6' : '#3b82f640'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Прогресс по курсам */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Прогресс по курсам
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {courses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Нет активных курсов</p>
                        ) : (
                            <div className="space-y-4">
                                {courses.slice(0, 5).map((course: any) => (
                                    <div key={course.id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="truncate max-w-[200px]">{course.title}</span>
                                            <span className="text-muted-foreground">{course._count?.modules || 0} мод.</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress || 0}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Календарь активности */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Календарь активности
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1">
                        {calendarData.map((day, i) => (
                            <div
                                key={i}
                                className="w-3.5 h-3.5 rounded-sm"
                                style={{
                                    backgroundColor: day.count === 0
                                        ? 'var(--muted)'
                                        : day.count <= 2
                                            ? '#3b82f640'
                                            : day.count <= 5
                                                ? '#3b82f680'
                                                : '#3b82f6',
                                }}
                                title={`${day.date}: ${day.count} лекций`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Меньше</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-sm bg-[var(--muted)]" />
                            <div className="w-3 h-3 rounded-sm bg-[#3b82f640]" />
                            <div className="w-3 h-3 rounded-sm bg-[#3b82f680]" />
                            <div className="w-3 h-3 rounded-sm bg-[#3b82f6]" />
                        </div>
                        <span>Больше</span>
                    </div>
                </CardContent>
            </Card>

            {/* Быстрые ссылки */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/my-courses')}>
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Мои курсы</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/playground')}>
                    <Code className="h-6 w-6" />
                    <span className="text-sm">Code Playground</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/assignments')}>
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Задания</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/grades')}>
                    <Trophy className="h-6 w-6" />
                    <span className="text-sm">Успеваемость</span>
                </Button>
            </div>
        </div>
    );
}

function generateActivityData() {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days.map(day => ({
        day,
        count: Math.floor(Math.random() * 5),
    }));
}

function generateCalendarData(progressData: any) {
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = progressData?.filter((p: any) =>
            p.completedAt?.startsWith(dateStr)
        ).length || 0;
        days.push({ date: dateStr, count });
    }
    return days;
}

function TeacherDashboard() {
    const navigate = useNavigate();
    const { data: practiceSubmissions = [] } = useQuery({
        queryKey: ['practiceSubmissions'],
        queryFn: async () => { const res = await practiceApi.getAllSubmissions(); return res.data?.submissions || []; },
    });
    const { data: assignments = [] } = useQuery({
        queryKey: ['teacherAssignments'],
        queryFn: async () => {
            const res = await assignmentsApi.getTeacherAssignments();
            const data = res.data;
            return Array.isArray(data) ? data : data?.assignments || [];
        },
    });
    const { data: allCourses = [] } = useQuery({
        queryKey: ['allCourses'],
        queryFn: async () => { const res = await coursesApi.getAll(); return res.data || []; },
    });

    const newPractice = practiceSubmissions.filter((s: any) => s.grade === null).length;
    const ungradedSubmissions = assignments.reduce((sum: number, a: any) =>
        sum + (a.submissions?.filter((s: any) => s.grade === null).length || 0), 0);
    const totalStudents = allCourses.reduce((sum: number, c: any) => sum + (c._count?.enrollments || 0), 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Дашборд преподавателя</h1>
            <p className="text-muted-foreground mb-8">Обзор активности</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <Card className="bg-amber-500/5 border-amber-500/20">
                    <CardContent className="p-4">
                        <AlertCircle className="h-5 w-5 text-amber-500 mb-2" />
                        <div className="text-2xl font-bold">{newPractice + ungradedSubmissions}</div>
                        <div className="text-xs text-muted-foreground">На проверку</div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="p-4">
                        <GraduationCap className="h-5 w-5 text-emerald-500 mb-2" />
                        <div className="text-2xl font-bold">{totalStudents || '—'}</div>
                        <div className="text-xs text-muted-foreground">Студентов</div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardContent className="p-4">
                        <BookOpen className="h-5 w-5 text-blue-500 mb-2" />
                        <div className="text-2xl font-bold">{allCourses.length}</div>
                        <div className="text-xs text-muted-foreground">Курсов</div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-500/5 border-purple-500/20">
                    <CardContent className="p-4">
                        <FileText className="h-5 w-5 text-purple-500 mb-2" />
                        <div className="text-2xl font-bold">{assignments.length}</div>
                        <div className="text-xs text-muted-foreground">Заданий</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/teacher/courses')}>
                    <BookOpen className="h-6 w-6" />Управление курсами
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/teacher/groups')}>
                    <GraduationCap className="h-6 w-6" />Группы
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/assignments')}>
                    <CheckCircle className="h-6 w-6" />Проверить работы
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/catalog')}>
                    <BookOpen className="h-6 w-6" />Каталог
                </Button>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

    if (isTeacher) return <TeacherDashboard />;
    return <StudentDashboard />;
}