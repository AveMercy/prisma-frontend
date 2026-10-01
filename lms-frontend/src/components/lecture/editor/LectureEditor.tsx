import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Plus, Heading, Type, Hash, Code, Info, AlertTriangle, CheckCircle, Image } from 'lucide-react';
import EditableBlock from './EditableBlock';
import type { LectureBlock } from '@/types/lecture';

interface Props {
    blocks: LectureBlock[];
    onChange: (blocks: LectureBlock[]) => void;
}

let blockCounter = 0;
const generateId = () => `block-${Date.now()}-${++blockCounter}`;

const blockTypes: Array<{
    type: LectureBlock['type'];
    icon: React.ElementType;
    label: string;
    default: LectureBlock;
}> = [
    {
        type: 'heading',
        icon: Heading,
        label: 'Заголовок',
        default: { id: '', type: 'heading', content: '', level: 2 },
    },
    {
        type: 'text',
        icon: Type,
        label: 'Текст',
        default: { id: '', type: 'text', content: '' },
    },
    {
        type: 'section',
        icon: Hash,
        label: 'Секция',
        default: { id: '', type: 'section', title: '', number: 1, content: '' },
    },
    {
        type: 'code',
        icon: Code,
        label: 'Код',
        default: { id: '', type: 'code', language: 'javascript', code: '' },
    },
    {
        type: 'info',
        icon: Info,
        label: 'Инфо',
        default: { id: '', type: 'info', title: '', content: '' },
    },
    {
        type: 'warning',
        icon: AlertTriangle,
        label: 'Важно',
        default: { id: '', type: 'warning', title: '', content: '' },
    },
    {
        type: 'success',
        icon: CheckCircle,
        label: 'Успех',
        default: { id: '', type: 'success', title: '', content: '' },
    },
    {
        type: 'image',
        icon: Image,
        label: 'Картинка',
        default: { id: '', type: 'image', src: '', alt: '' },
    },
];

export default function LectureEditor({ blocks, onChange }: Props) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = blocks.findIndex((b) => b.id === active.id);
            const newIndex = blocks.findIndex((b) => b.id === over.id);
            onChange(arrayMove(blocks, oldIndex, newIndex));
        }
    };

    const addBlock = (type: LectureBlock['type']) => {
        const defaults = blockTypes.find((b) => b.type === type)!;
        const newBlock: LectureBlock = { ...defaults.default, id: generateId() };
        onChange([...blocks, newBlock]);
    };

    const updateBlock = (index: number, block: LectureBlock) => {
        const updated = [...blocks];
        updated[index] = block;
        onChange(updated);
    };

    const deleteBlock = (index: number) => {
        onChange(blocks.filter((_, i) => i !== index));
    };

    const moveUp = (index: number) => {
        if (index > 0) {
            onChange(arrayMove(blocks, index, index - 1));
        }
    };

    const moveDown = (index: number) => {
        if (index < blocks.length - 1) {
            onChange(arrayMove(blocks, index, index + 1));
        }
    };

    return (
        <div className="space-y-4">
            {/* Add block buttons */}
            <div className="flex flex-wrap gap-2">
                {blockTypes.map(({ type, icon: Icon, label }) => (
                    <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        onClick={() => addBlock(type)}
                    >
                        <Icon className="h-4 w-4 mr-1" />
                        {label}
                    </Button>
                ))}
            </div>

            {/* Blocks */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {blocks.map((block, index) => (
                            <EditableBlock
                                key={block.id}
                                block={block}
                                onChange={(updated) => updateBlock(index, updated)}
                                onDelete={() => deleteBlock(index)}
                                onMoveUp={index > 0 ? () => moveUp(index) : undefined}
                                onMoveDown={index < blocks.length - 1 ? () => moveDown(index) : undefined}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {blocks.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                    Добавьте блоки, чтобы создать лекцию
                </p>
            )}
        </div>
    );
}