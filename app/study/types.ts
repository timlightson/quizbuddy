export type Mastery = 0 | 1 | 2 | 3 | 4;

export type Card = {
  id: string;
  term: string;
  definition: string;
  starred: boolean;
  mastery: Mastery;
  correct: number;
  wrong: number;
};

export type StudySet = {
  id: string;
  title: string;
  subject: string;
  description: string;
  termLanguage: string;
  definitionLanguage: string;
  cards: Card[];
  source: string;
  notes?: string;
  color: string;
  createdAt: number;
  updatedAt: number;
};

export type AppSettings = {
  theme: 'dark' | 'light' | 'system';
  dailyGoal: number;
  newCardsPerSession: number;
  grading: 'strict' | 'normal' | 'lenient';
  promptSide: 'term' | 'definition';
  sounds: boolean;
  readAloud: boolean;
  speechRate: number;
};

export type StudyStats = {
  reviews: number;
  correct: number;
  seconds: number;
  streak: number;
  xp: number;
  activity: Record<string, number>;
};

export type Mode =
  | 'home'
  | 'studio'
  | 'library'
  | 'set'
  | 'edit'
  | 'guide'
  | 'progress'
  | 'settings'
  | 'flashcards'
  | 'learn'
  | 'test'
  | 'write'
  | 'match'
  | 'rush'
  | 'meteor';
