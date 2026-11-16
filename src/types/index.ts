export type ZoneId = 'home' | 'vandung' | 'leaderboard';

export type ConnectionMode = 'connected' | 'offline';

export interface StudentProfile {
  student_id: string;
  full_name: string;
  display_name: string;
  school: string;
  class_name: string;
  join_time: string;
  last_active: string;
  total_score: number;
  total_correct: number;
  total_attempts: number;
}

export interface AttemptRecord {
  attempt_id: string;
  student_id: string;
  question_id: string;
  question_type: string;
  answer: string;
  is_correct: boolean;
  score: number;
  duration: number;
  submitted_at: string;
}

export interface BadgeInfo {
  id: string;
  title: string;
  description: string;
  color: string;
  unlocked: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  student_id: string;
  display_name: string;
  school: string;
  class_name: string;
  total_score: number;
  total_correct: number;
  total_attempts: number;
  accuracy: number;
  last_active: string;
}

export interface AppConfig {
  grade_level: string;
  subject_name: string;
  lesson_title: string;
}

export type VanDungQuestionId = 'VD_Q1' | 'VD_Q2' | 'VD_Q3' | 'VD_Q4' | 'VD_Q5';

export type VanDungType = 'single_choice' | 'multi_choice' | 'drag_drop' | 'fill_blank' | 'matching';

export interface VanDungOption {
  id: string;
  label: string;
  badge?: string;
}

export interface VanDungMatchItem {
  id: string;
  text: string;
}

export interface VanDungQuestion {
  id: VanDungQuestionId;
  index: number;
  title: string;
  subtitle: string;
  type: VanDungType;
  typeLabel: string;
  prompt: string;
  instruction?: string;
  points: number; // 20
  // Dành cho Single Choice & Multi Choice
  options?: VanDungOption[];
  // Dành cho Drag & Drop (Thử thách 3)
  textBefore?: string;
  textMiddle?: string;
  textAfter?: string;
  dragItems?: string[];
  // Dành cho Fill in blank (Thử thách 4)
  formulaDisplay?: string;
  hint?: string;
  // Dành cho Matching (Thử thách 5)
  columnA?: VanDungMatchItem[];
  columnB?: VanDungMatchItem[];
  // Đáp án đúng
  correctAnswer: unknown;
  explanationCorrect: string;
  explanationIncorrect: string;
}

export interface GradeFeedback {
  ok: boolean;
  is_correct: boolean;
  score: number;
  awarded_delta: number;
  max_score: number;
  explanation: string;
  student?: StudentProfile;
  error?: string;
}
