export type SlideType = 'text' | 'poll' | 'wordcloud';

export interface Slide {
    id: string;
    type: SlideType;
    question: string;
    options: Record<string, number>;
}

export interface Response {
    id: string;
    slideId: string;
    type: SlideType;
    content: string;
    timestamp: number;
}

export interface AppState {
    slides: Slide[];
    currentSlideIndex: number;
    currentSlide: Slide;
    responses: Response[];
    pollCounts: Record<string, number>;
    isActive: boolean;
    customBlocklist: string[];
}

export const InitialState: AppState = {
    slides: [],
    currentSlideIndex: 0,
    currentSlide: { id: '', type: 'text', question: 'Loading...', options: {} },
    responses: [],
    pollCounts: {},
    isActive: true,
    customBlocklist: []
};
