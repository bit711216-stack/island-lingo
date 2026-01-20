
export interface WordItem {
  id: string;
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
}

export interface SentenceItem {
  id: string;
  english: string;
  korean: string;
  situation: string;
}

export interface DailyLesson {
  words: WordItem[];
  sentences: SentenceItem[];
  theme: string;
}

export enum AppState {
  HOME = 'HOME',
  LEARNING = 'LEARNING',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
  LOADING = 'LOADING'
}

export enum QuizType {
  WORD_MEANING = 'WORD_MEANING',
  SENTENCE_COMPLETION = 'SENTENCE_COMPLETION'
}
