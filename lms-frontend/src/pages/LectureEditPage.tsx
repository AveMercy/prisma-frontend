import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { lecturesApi } from '@/api/lectures';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LectureEditor from '@/components/lecture/editor/LectureEditor';
import BlockRenderer from '@/components/lecture/BlockRenderer';
import type { LectureBlock } from '@/types/lecture';
import { Loader2, Eye, Pen, Save } from 'lucide-react';

export default function LectureEditPage() {
    const { lectureId } = useParams<{ lectureId: string }>();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [type, setType] = useState<'theory' | 'practice' | 'quiz'>('theory');
    const [orderIndex, setOrderIndex] = useState(1);
    const [blocks, setBlocks] = useState<LectureBlock[]>([]);

    const { data: lecture, isLoading } = useQuery({
        queryKey: ['lecture', lectureId],
        queryFn: () => lecturesApi.getById(parseInt(lectureId!)),
        enabled: !!lectureId,
    });

    useEffect(() => {
        if (lecture) {
            setTitle(lecture.title);
            setType(lecture.type);
            setOrderIndex(lecture.orderIndex);

            // Пробуем распарсить JSON-блоки
            if (lecture.content) {
                try {
                    const parsed = JSON.parse(lecture.content);
                    if (Array.isArray(parsed)) {
                        setBlocks(parsed);
                    }
                } catch {
                    // Старый Markdown — не трогаем
                }
            }
        }
    }, [lecture]);

    const updateMutation = useMutation({
        mutationFn: () =>
            lecturesApi.update(parseInt(lectureId!), {
                title,
                content: JSON.stringify(blocks),
                type,
                orderIndex,
            }),
        onSuccess: () => {
            navigate(-1);
        },
    });

    const handleSubmit = () => {
        updateMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Редактирование лекции</h1>

            <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Заголовок</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Порядковый номер</Label>
                        <Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(parseInt(e.target.value))} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Тип</Label>
                    <div className="flex gap-2">
                        {(['theory', 'practice', 'quiz'] as const).map((t) => (
                            <Button
                                key={t}
                                type="button"
                                variant={type === t ? 'default' : 'outline'}
                                onClick={() => setType(t)}
                            >
                                {t === 'theory' ? 'Теория' : t === 'practice' ? 'Практика' : 'Тест'}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="edit">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="edit" className="flex items-center gap-2">
                            <Pen className="h-4 w-4" /> Конструктор
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" /> Предпросмотр
                        </TabsTrigger>
                    </TabsList>

                    <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохранение...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Сохранить
                            </>
                        )}
                    </Button>
                </div>

                <TabsContent value="edit">
                    <LectureEditor blocks={blocks} onChange={setBlocks} />
                </TabsContent>

                <TabsContent value="preview">
                    <Card>
                        <CardHeader>
                            <CardTitle>{title || 'Без названия'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BlockRenderer blocks={blocks} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Отмена</Button>
            </div>
        </div>
    );
}