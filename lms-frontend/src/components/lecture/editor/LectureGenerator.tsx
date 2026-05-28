import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generatorApi } from '@/api/generator.ts';
import { Button } from '@/components/ui/button.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Loader2, Sparkles, Upload, FileText, X } from 'lucide-react';
import type { LectureBlock } from '@/types/lecture.ts';

interface Props {
    onBlocksGenerated: (blocks: LectureBlock[]) => void;
    onClose: () => void;
}

export default function LectureGenerator({ onBlocksGenerated, onClose }: Props) {
    const [text, setText] = useState('');
    const [fileName, setFileName] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const generateMutation = useMutation({
        mutationFn: (inputText: string) => generatorApi.generate(inputText),
        onSuccess: (res) => {
            if (res.data.blocks?.length > 0) {
                onBlocksGenerated(res.data.blocks);
            }
        },
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);

        try {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
            setText(result.value);
        } catch (err) {
            console.error('Ошибка чтения файла:', err);
        }
    };

    const handleGenerate = () => {
        if (!text.trim() || generateMutation.isPending) return;
        generateMutation.mutate(text);
    };

    const handleClearFile = () => {
        setFileName('');
        setText('');
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div className="border rounded-xl p-6 bg-card space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Генератор лекции</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="file">
                <TabsList>
                    <TabsTrigger value="file" className="flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        Файл
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Текст
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="mt-4">
                    {fileName ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm flex-1 truncate">{fileName}</span>
                                <Button variant="ghost" size="icon" onClick={handleClearFile}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Текст извлечён. Проверьте и нажмите «Сгенерировать».
                            </p>
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-xl hover:bg-muted/50 transition-colors">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-center">
                                <p className="text-sm font-medium">Загрузите Word-файл</p>
                                <p className="text-xs text-muted-foreground">.docx</p>
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".docx"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    )}
                </TabsContent>

                <TabsContent value="text" className="mt-4">
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Вставьте текст лекции..."
                        className="min-h-[200px]"
                    />
                </TabsContent>
            </Tabs>

            {/* Превью текста */}
            {text && (
                <div className="max-h-40 overflow-y-auto p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground whitespace-pre-wrap">
                    {text.slice(0, 500)}
                    {text.length > 500 && '...'}
                </div>
            )}

            <Button
                onClick={handleGenerate}
                disabled={!text.trim() || generateMutation.isPending}
                className="w-full"
            >
                {generateMutation.isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Генерация...
                    </>
                ) : (
                    <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Сгенерировать лекцию
                    </>
                )}
            </Button>

            {generateMutation.isError && (
                <p className="text-sm text-destructive text-center">
                    {(generateMutation.error as any)?.response?.data?.error || 'Ошибка генерации'}
                </p>
            )}
        </div>
    );
}