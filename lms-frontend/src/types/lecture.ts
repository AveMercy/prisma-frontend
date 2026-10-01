export type BlockType = 'heading' | 'text' | 'section' | 'code' | 'info' | 'warning' | 'success' | 'image';

export interface LectureBlock {
    id: string;
    type: BlockType;
    content?: string;
    level?: 1 | 2 | 3;
    title?: string;
    number?: number;
    language?: string;
    code?: string;
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