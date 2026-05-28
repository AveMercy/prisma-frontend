import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Label } from '@/components/ui/label';
import { GripVertical, Trash2, ChevronUp, ChevronDown, Upload  } from 'lucide-react';
import type { LectureBlock } from '@/types/lecture';

interface Props {
    block: LectureBlock;
    onChange: (block: LectureBlock) => void;
    onDelete: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}

const blockLabels: Record<string, string> = {
    heading: 'Заголовок',
    text: 'Текст',
    section: 'Секция с номером',
    code: 'Код',
    info: 'Инфо-панель',
    warning: 'Предупреждение',
    success: 'Успех',
    image: 'Изображение',
};

export default function EditableBlock({ block, onChange, onDelete, onMoveUp, onMoveDown }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: block.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const update = (data: Partial<LectureBlock>) => {
        onChange({ ...block, ...data });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border rounded-xl p-4 bg-card space-y-3"
        >
            {/* Header */}
            <div className="flex items-center gap-2">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                >
                    <GripVertical className="h-5 w-5" />
                </button>
                <span className="text-xs font-medium text-muted-foreground uppercase flex-1">
          {blockLabels[block.type]}
        </span>
                {onMoveUp && (
                    <Button variant="ghost" size="icon" onClick={onMoveUp}>
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                )}
                {onMoveDown && (
                    <Button variant="ghost" size="icon" onClick={onMoveDown}>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                )}
                <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* heading */}
            {block.type === 'heading' && (
                <div className="flex gap-2">
                    <select
                        value={block.level || 1}
                        onChange={(e) => update({ level: parseInt(e.target.value) as 1 | 2 | 3 })}
                        className="w-20 rounded-lg border bg-muted px-2 py-1 text-sm"
                    >
                        <option value={1}>H1</option>
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                    </select>
                    <Input
                        value={block.content || ''}
                        onChange={(e) => update({ content: e.target.value })}
                        placeholder="Заголовок..."
                        className="flex-1"
                    />
                </div>
            )}

            {/* text */}
            {block.type === 'text' && (
                <Textarea
                    value={block.content || ''}
                    onChange={(e) => update({ content: e.target.value })}
                    placeholder="Текст с **Markdown**..."
                    className="min-h-[80px]"
                />
            )}

            {/* section */}
            {block.type === 'section' && (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            value={block.number || ''}
                            onChange={(e) => update({ number: parseInt(e.target.value) || 1 })}
                            placeholder="№"
                            className="w-20"
                            type="number"
                        />
                        <Input
                            value={block.title || ''}
                            onChange={(e) => update({ title: e.target.value })}
                            placeholder="Заголовок секции"
                            className="flex-1"
                        />
                    </div>
                    <Textarea
                        value={block.content || ''}
                        onChange={(e) => update({ content: e.target.value })}
                        placeholder="Содержимое секции..."
                        className="min-h-[60px]"
                    />
                </div>
            )}

            {/* code */}
            {block.type === 'code' && (
                <div className="space-y-2">
                    <Input
                        value={block.language || ''}
                        onChange={(e) => update({ language: e.target.value })}
                        placeholder="Язык (javascript, python...)"
                        className="w-48"
                    />
                    <Textarea
                        value={block.code || ''}
                        onChange={(e) => update({ code: e.target.value })}
                        placeholder="Код..."
                        className="min-h-[100px] font-mono text-sm"
                    />
                </div>
            )}

            {/* info / warning / success */}
            {['info', 'warning', 'success'].includes(block.type) && (
                <div className="space-y-2">
                    <Input
                        value={block.title || ''}
                        onChange={(e) => update({ title: e.target.value })}
                        placeholder="Заголовок панели"
                    />
                    <Textarea
                        value={block.content || ''}
                        onChange={(e) => update({ content: e.target.value })}
                        placeholder="Текст..."
                        className="min-h-[60px]"
                    />
                </div>
            )}

            {/* image */}
            {block.type === 'image' && (
                <div className="space-y-3">
                    {!block.src ? (
                        <label className="cursor-pointer flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-xl hover:bg-muted/50 transition-colors">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">Загрузить изображение</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF до 5MB</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append('file', file); // ← 'file', не 'image'

                                    try {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch('http://localhost:5000/api/upload/single', {
                                            method: 'POST',
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                            body: formData,
                                        });

                                        if (!res.ok) {
                                            const errData = await res.json();
                                            alert(errData.error || 'Ошибка загрузки');
                                            return;
                                        }

                                        const data = await res.json();
                                        update({ src: data.url });
                                    } catch (err) {
                                        console.error('Ошибка загрузки:', err);
                                        alert('Не удалось загрузить изображение');
                                    }
                                }}
                            />
                        </label>
                    ) : (
                        <div className="relative group">
                            <img
                                src={`http://localhost:5000${block.src}`}
                                alt={block.alt || ''}
                                className="rounded-xl w-full max-h-60 object-cover"
                            />
                            <button
                                onClick={() => update({ src: '' })}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">Описание:</Label>
                        <Input
                            value={block.alt || ''}
                            onChange={(e) => update({ alt: e.target.value })}
                            placeholder="Подпись к картинке"
                            className="h-8 text-sm"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}