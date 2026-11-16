export type ZoneId = 'home' | 'learn' | 'review' | 'challenge' | 'leaderboard' | 'team';

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

export interface GroupMemberSummary {
  student_id: string;
  display_name: string;
  school: string;
  class_name: string;
  total_score: number;
}

export interface TeamGroup {
  group_id: string;
  group_name: string;
  members: GroupMemberSummary[];
  group_score: number;
  updated_at?: string;
}

export interface GroupAssignment {
  assignment_id: string;
  group_id: string;
  title: string;
  description: string;
  questions: string[];
  max_score: number;
  status: string;
  created_at?: string;
}

export interface TeamQuestion {
  question_id: string;
  assignment_id: string;
  question_text: string;
  question_type: 'single_choice' | 'text';
  options: string[];
  correct_answer: string;
  points: number;
  explanation: string;
}

export interface AppConfig {
  grade_level: string;
  subject_name: string;
  lesson_title: string;
}

export type ChallengeGroupKey = 'A' | 'B' | 'C' | 'EXT';

export type ChallengeInteractionType =
  | 'single_choice'
  | 'multi_choice'
  | 'drag_drop'
  | 'fill_blank'
  | 'matching'
  | 'expression_table'
  | 'circle_practice';

export interface ChallengeQuestion {
  id: string;
  group: ChallengeGroupKey;
  groupLabel: string;
  numberLabel: string;
  type: ChallengeInteractionType;
  typeLabel: string;
  prompt: string;
  maxScore: number;
  options?: { id: string; label: string }[];
  dragItems?: string[];
  dropZones?: string[];
  matchLeft?: string[];
  matchRight?: { id: string; label: string }[];
  blankTemplate?: string;
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
