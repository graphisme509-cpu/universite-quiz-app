
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface QuizQuestionOption {
  text: string;
}

export interface QuizQuestion {
  key_name: string;
  question: string;
  options: QuizQuestionOption[];
  correct_index: number;
  explanation?: string;
}

export interface Quiz {
  id: number;
  name: string;
  matiere: string;
  questions_count: number;
  questions: QuizQuestion[];
}

export interface StatsData {
    totalUsers?: number;
    totalQuiz?: number;
    totalScores?: number;
    avgTime?: number;
    monthlyLabels?: string[];
    monthlyScores?: number[];
}

export interface ClassementEntry {
    rank: number;
    name: string;
    score: number;
    xp: number;
    badges: string[];
}

export interface ProgressionData {
    xp?: number;
    level?: number;
    levelName?: string;
    badges?: string[];
    feedbacks?: {
        question: string;
        user_answer: string;
        correct: boolean;
        explanation: string;
    }[];
    matiereLabels?: string[];
    matiereScores?: number[];
}

export interface DashboardData {
    stats: StatsData;
    classement: ClassementEntry[];
    progression: ProgressionData;
    quizzes: Quiz[];
}
