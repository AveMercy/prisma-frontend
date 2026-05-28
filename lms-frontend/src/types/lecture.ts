export type BlockType = 'heading' | 'text' | 'section' | 'code' | 'info' | 'warning' | 'success' | 'image';

export interface LectureBlock {
    id: string;
    type: BlockType;
    // Для heading
    content?: string;
    level?: 1 | 2 | 3;
    // Для text
    // content?: string;
    // Для section
    title?: string;
    number?: number;
    // content?: string;
    // Для code
    language?: string;
    code?: string;
    // Для info/warning/success
    // title?: string;
    // content?: string;
    // Для image
    src?: string;
    alt?: string;
}

export interface LectureData {
    title: string;
    type: 'theory' | 'practice' | 'quiz';
    orderIndex: number;
    moduleId: number;
    blocks: LectureBlock[];
}