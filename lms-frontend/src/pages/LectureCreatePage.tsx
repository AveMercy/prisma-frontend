import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { lecturesApi } from '@/api/lectures';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LectureEditor from '@/components/lecture/editor/LectureEditor';
import LectureGenerator from '@/components/lecture/editor/LectureGenerator';
import BlockRenderer from '@/components/lecture/BlockRenderer';
import type { LectureBlock } from '@/types/lecture';
import { Loader2, Eye, Pen, Save, Sparkles } from 'lucide-react';

export default function LectureCreatePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const moduleId = parseInt(searchParams.get('moduleId') || '0');

    const [title, setTitle] = useState('');
    const [type, setType] = useState<'theory' | 'practice' | 'quiz'>('theory');
    const [orderIndex, setOrderIndex] = useState(1);
    const [blocks, setBlocks] = useState<LectureBlock[]>([]);
    const [showGenerator, setShowGenerator] = useState(false);

    const createMutation = useMutation({
        mutationFn: () =>
            lecturesApi.create({
                title,
                content: JSON.stringify(blocks),
                type,
                orderIndex,
                moduleId,
            }),
        onSuccess: () => {
            navigate(-1);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate();
    };

    const handleBlocksGenerated = (newBlocks: LectureBlock[]) => {
        // Добавляем ID к блокам
        const blocksWithIds = newBlocks.map((block, i) => ({
            ...block,
            id: `gen-${Date.now()}-${i}`,
        }));
        setBlocks((prev) => [...prev, ...blocksWithIds]);
        setShowGenerator(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Создание лекции</h1>

            <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Заголовок</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Название лекции"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Порядковый номер</Label>
                        <Input
                            type="number"
                            value={orderIndex}
                            onChange={(e) => setOrderIndex(parseInt(e.target.value))}
                        />
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
                                {t === 'theory' ? 'Теория' : t === 'practice' ? 'Практика' : 'Квиз'}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Кнопка генератора */}
            {!showGenerator && (
                <Button
                    variant="outline"
                    className="mb-6"
                    onClick={() => setShowGenerator(true)}
                >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Сгенерировать лекцию из Word
                </Button>
            )}

            {/* Генератор */}
            {showGenerator && (
                <div className="mb-6">
                    <LectureGenerator
                        onBlocksGenerated={handleBlocksGenerated}
                        onClose={() => setShowGenerator(false)}
                    />
                </div>
            )}

            <Tabs defaultValue="edit">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="edit" className="flex items-center gap-2">
                            <Pen className="h-4 w-4" />
                            Конструктор
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Предпросмотр
                        </TabsTrigger>
                    </TabsList>

                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                        {createMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Сохранение...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Сохранить лекцию
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
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Отмена
                </Button>
            </div>
        </div>
    );
}