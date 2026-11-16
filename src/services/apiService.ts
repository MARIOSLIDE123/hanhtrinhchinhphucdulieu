import {
  AppConfig,
  AttemptRecord,
  BadgeInfo,
  ConnectionMode,
  GradeFeedback,
  LeaderboardEntry,
  StudentProfile,
  VanDungQuestion,
} from '../types';
import { DEFAULT_VAN_DUNG_QUESTIONS } from '../data/lessonData';

const STORAGE_KEYS = {
  GAS_URL: 'data_adventure_gas_url',
  STUDENT: 'data_adventure_student',
  ATTEMPTS: 'data_adventure_attempts',
  OFFLINE_VAN_DUNG_Q: 'data_adventure_vandung_questions',
  OFFLINE_CONFIG: 'data_adventure_offline_config',
};

/**
 * ============================================================================
 * CẤU HÌNH TRỰC TIẾP URL GOOGLE APPS SCRIPT WEB APP TẠI ĐÂY:
 * Dán URL Web App của bạn (dạng: https://script.google.com/macros/s/.../exec)
 * Khi cấu hình ở đây, toàn bộ ứng dụng sẽ tự động kết nối thẳng vào Google Sheet,
 * không cần giáo viên hay học sinh phải nhập URL trong giao diện nữa.
 * ============================================================================
 */
export const HARDCODED_GAS_URL =
  'https://script.google.com/macros/s/AKfycbyBw3D2MQ7SJMjZSiROdkPUwOVDNrOslMQ0i01e26th2c7P6KN0p_EJt_ft8bcOWHzbBw/exec';

export const DEFAULT_CONFIG: AppConfig = {
  grade_level: 'Tin học 7',
  subject_name: 'Tin học',
  lesson_title: 'Bài 13: Biểu diễn dữ liệu',
};

export function getStoredGasUrl(): string {
  // 1. Ưu tiên số 1: URL được cấu hình trực tiếp vào mã code
  if (HARDCODED_GAS_URL && HARDCODED_GAS_URL.trim() && !HARDCODED_GAS_URL.includes('YOUR_DEPLOYMENT_ID')) {
    return HARDCODED_GAS_URL.trim();
  }
  // 2. Ưu tiên số 2: Biến môi trường .env (nếu có)
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GAS_WEBAPP_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes('YOUR_DEPLOYMENT_ID')) {
    return envUrl.trim();
  }
  // 3. Fallback: URL từ query parameter (?gas=...) hoặc localStorage
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlFromQuery = params.get('gas');
    if (urlFromQuery && urlFromQuery.startsWith('https://')) {
      localStorage.setItem(STORAGE_KEYS.GAS_URL, urlFromQuery.trim());
      return urlFromQuery.trim();
    }
    const saved = localStorage.getItem(STORAGE_KEYS.GAS_URL);
    if (saved) return saved;
  }
  return '';
}

export function setStoredGasUrl(url: string): void {
  const clean = url.trim();
  if (clean) {
    localStorage.setItem(STORAGE_KEYS.GAS_URL, clean);
  } else {
    localStorage.removeItem(STORAGE_KEYS.GAS_URL);
  }
}

export function getConnectionMode(): ConnectionMode {
  return getStoredGasUrl() ? 'connected' : 'offline';
}

export function getShortStudentName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'bạn';
  return parts[parts.length - 1];
}

export function createDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || 'Học sinh';
  if (parts.length === 2) return `${parts[0].charAt(0)}. ${parts[1]}`;
  return `${parts[0].charAt(0)}. ${parts.slice(-2).join(' ')}`;
}

function generateLocalId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36).toUpperCase()}_${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;
}

export function loadLocalStudent(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT);
    return raw ? (JSON.parse(raw) as StudentProfile) : null;
  } catch {
    return null;
  }
}

export function saveLocalStudent(student: StudentProfile | null): void {
  if (!student) {
    localStorage.removeItem(STORAGE_KEYS.STUDENT);
  } else {
    localStorage.setItem(STORAGE_KEYS.STUDENT, JSON.stringify(student));
  }
}

export function loadLocalAttempts(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return raw ? (JSON.parse(raw) as AttemptRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalAttempts(attempts: AttemptRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
}

export function loadLocalVanDungQuestions(): VanDungQuestion[] {
  return readLocalJson<VanDungQuestion[]>(STORAGE_KEYS.OFFLINE_VAN_DUNG_Q, DEFAULT_VAN_DUNG_QUESTIONS);
}

export function saveLocalVanDungQuestions(questions: VanDungQuestion[]): void {
  localStorage.setItem(STORAGE_KEYS.OFFLINE_VAN_DUNG_Q, JSON.stringify(questions));
}

/**
 * Tính danh sách huy hiệu dựa trên 5 câu hỏi Vận dụng
 */
export function computeBadges(student: StudentProfile | null, attempts: AttemptRecord[]): BadgeInfo[] {
  const passedIds = new Set(attempts.filter((a) => a.is_correct).map((a) => a.question_id));
  const bestScores: Record<string, number> = {};
  attempts.forEach((a) => {
    bestScores[a.question_id] = Math.max(bestScores[a.question_id] || 0, a.score);
  });
  const totalScore = Object.values(bestScores).reduce((a, b) => a + b, 0);

  return [
    {
      id: 'starter',
      title: 'Nhà thám hiểm tập sự',
      description: 'Đăng nhập và sẵn sàng chinh phục 5 thử thách dữ liệu',
      color: '#2389D8',
      unlocked: Boolean(student),
    },
    {
      id: 'datatypes',
      title: 'Bậc thầy kiểu dữ liệu',
      description: 'Vượt qua Thử thách 1 (Xâu kí tự) và Thử thách 2 (Phép toán logic)',
      color: '#38C9B1',
      unlocked: passedIds.has('VD_Q1') && passedIds.has('VD_Q2'),
    },
    {
      id: 'vars',
      title: 'Chuyên gia Hằng & Biến',
      description: 'Vượt qua Thử thách 3 (Phân biệt bản chất Biến và Hằng)',
      color: '#FF9850',
      unlocked: passedIds.has('VD_Q3'),
    },
    {
      id: 'expr',
      title: 'Kỹ sư biểu thức Scratch',
      description: 'Vượt qua Thử thách 4 (Góc quay 360/n) và Thử thách 5 (Ghép nối tri thức)',
      color: '#A88BFA',
      unlocked: passedIds.has('VD_Q4') && passedIds.has('VD_Q5'),
    },
    {
      id: 'champion',
      title: 'Nhà vô địch 100/100',
      description: 'Đạt điểm tối đa trọn vẹn 100/100 điểm cho toàn bộ 5 thử thách',
      color: '#FFD34F',
      unlocked:
        totalScore >= 100 ||
        ['VD_Q1', 'VD_Q2', 'VD_Q3', 'VD_Q4', 'VD_Q5'].every((id) => (bestScores[id] || 0) >= 20),
    },
  ];
}

/**
 * Tính tiến trình hoàn thành 5 thử thách (0 - 100%)
 */
export function computeLessonProgress(attempts: AttemptRecord[]): number {
  const passedIds = new Set(attempts.filter((a) => a.is_correct || a.score > 0).map((a) => a.question_id));
  const requiredIds = ['VD_Q1', 'VD_Q2', 'VD_Q3', 'VD_Q4', 'VD_Q5'];
  let done = 0;
  requiredIds.forEach((id) => {
    if (passedIds.has(id)) done++;
  });
  return Math.round((done / requiredIds.length) * 100);
}

async function gasGet<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const baseUrl = getStoredGasUrl();
  if (!baseUrl) {
    throw new Error('OFFLINE_MODE');
  }
  const url = new URL(baseUrl);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Lỗi kết nối máy chủ (${res.status})`);
  }
  const data = await res.json();
  if (data && data.ok === false) {
    throw new Error(data.error || 'Lỗi từ Google Apps Script');
  }
  return data as T;
}

async function gasPost<T>(payload: Record<string, unknown>): Promise<T> {
  const baseUrl = getStoredGasUrl();
  if (!baseUrl) {
    throw new Error('OFFLINE_MODE');
  }
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Lỗi kết nối máy chủ (${res.status})`);
  }
  const data = await res.json();
  if (data && data.ok === false) {
    throw new Error(data.error || 'Lỗi từ Google Apps Script');
  }
  return data as T;
}

export async function testGasConnection(url: string): Promise<{ ok: boolean; message: string }> {
  try {
    const target = new URL(url.trim());
    target.searchParams.set('action', 'ping');
    const res = await fetch(target.toString(), { method: 'GET' });
    if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
    const data = await res.json();
    if (data && data.ok) {
      return { ok: true, message: 'Kết nối thành công tới Google Apps Script!' };
    }
    return { ok: false, message: data?.error || 'Phản hồi không hợp lệ từ Apps Script.' };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Không thể kết nối tới URL này.',
    };
  }
}

export async function registerStudent(input: {
  full_name: string;
  school: string;
  class_name: string;
}): Promise<{ student: StudentProfile; attempts: AttemptRecord[]; synced: boolean }> {
  const displayName = createDisplayName(input.full_name);
  const now = new Date().toISOString();

  if (getStoredGasUrl()) {
    try {
      const res = await gasPost<{
        ok: boolean;
        student: StudentProfile;
        attempts: AttemptRecord[];
      }>({
        action: 'registerStudent',
        full_name: input.full_name.trim(),
        display_name: displayName,
        school: input.school.trim(),
        class_name: input.class_name.trim(),
      });
      if (res && res.student) {
        saveLocalStudent(res.student);
        saveLocalAttempts(res.attempts || []);
        return { student: res.student, attempts: res.attempts || [], synced: true };
      }
    } catch {
      // Fallback xuống offline storage nếu có sự cố mạng
    }
  }

  const existing = loadLocalStudent();
  const studentId = existing?.student_id || generateLocalId('STU');
  const localStudent: StudentProfile = {
    student_id: studentId,
    full_name: input.full_name.trim(),
    display_name: displayName,
    school: input.school.trim(),
    class_name: input.class_name.trim(),
    join_time: existing?.join_time || now,
    last_active: now,
    total_score: existing?.total_score || 0,
    total_correct: existing?.total_correct || 0,
    total_attempts: existing?.total_attempts || 0,
  };
  saveLocalStudent(localStudent);
  const localAttempts = loadLocalAttempts();
  return { student: localStudent, attempts: localAttempts, synced: false };
}

export async function syncExistingStudentProfile(
  student: StudentProfile
): Promise<{ student: StudentProfile; attempts: AttemptRecord[]; synced: boolean }> {
  if (!getStoredGasUrl()) {
    return { student, attempts: loadLocalAttempts(), synced: false };
  }
  try {
    const res = await gasPost<{
      ok: boolean;
      student: StudentProfile;
      attempts: AttemptRecord[];
    }>({
      action: 'registerStudent',
      full_name: student.full_name,
      display_name: student.display_name,
      school: student.school,
      class_name: student.class_name,
    });
    if (res && res.student) {
      saveLocalStudent(res.student);
      saveLocalAttempts(res.attempts || []);
      return { student: res.student, attempts: res.attempts || [], synced: true };
    }
  } catch {
    // Không làm gián đoạn học sinh nếu mất mạng
  }
  return { student, attempts: loadLocalAttempts(), synced: false };
}

function norm(val: unknown): string {
  return String(val === undefined || val === null ? '' : val)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Chấm điểm 5 thử thách Vận dụng tại Client (Offline / Fallback)
 */
export function gradeVanDungQuestionLocally(
  questionId: string,
  answer: unknown,
  customQuestions?: VanDungQuestion[]
): { isCorrect: boolean; score: number; maxScore: number; explanation: string } {
  const questions = customQuestions || loadLocalVanDungQuestions();
  const q = questions.find((item) => item.id === questionId);

  switch (questionId) {
    case 'VD_Q1': {
      const isRight = norm(answer) === 'c' || norm(answer) === 'computer';
      return {
        isCorrect: isRight,
        score: isRight ? (q?.points || 20) : 0,
        maxScore: q?.points || 20,
        explanation: isRight
          ? (q?.explanationCorrect || 'Chính xác! Computer là dữ liệu thuộc kiểu xâu kí tự.')
          : (q?.explanationIncorrect || 'Chưa chính xác! Hãy nhớ rằng kiểu xâu kí tự bao gồm kí tự hoặc chuỗi kí tự.'),
      };
    }
    case 'VD_Q2': {
      const selected = Array.isArray(answer) ? answer.map((s) => String(s).toUpperCase()) : [];
      const correctArr = ['A', 'B', 'C'];
      let correctHits = 0;
      let wrongHits = 0;
      selected.forEach((item) => {
        if (correctArr.includes(item)) correctHits++;
        else wrongHits++;
      });
      const net = Math.max(0, correctHits - wrongHits);
      const maxPts = q?.points || 20;
      const score = Math.round((net / correctArr.length) * maxPts);
      const isExact = correctHits === correctArr.length && wrongHits === 0;
      return {
        isCorrect: isExact,
        score,
        maxScore: maxPts,
        explanation: isExact
          ? (q?.explanationCorrect || 'Hoàn thành! AND, OR, NOT là ba phép toán logic trong Scratch.')
          : (q?.explanationIncorrect || 'Chưa chính xác! AND, OR, NOT là ba phép toán logic trong Scratch.'),
      };
    }
    case 'VD_Q3': {
      const aObj = (typeof answer === 'object' && answer !== null ? answer : {}) as Record<string, unknown>;
      const b1 = norm(aObj.blank1) === 'thay đổi';
      const b2 = norm(aObj.blank2) === 'không đổi';
      const maxPts = q?.points || 20;
      const score = (b1 ? maxPts / 2 : 0) + (b2 ? maxPts / 2 : 0);
      const isExact = b1 && b2;
      return {
        isCorrect: isExact,
        score,
        maxScore: maxPts,
        explanation: isExact
          ? (q?.explanationCorrect || 'Rất tốt! Biến có thể thay đổi giá trị, còn hằng không thay đổi trong quá trình chương trình thực hiện.')
          : (q?.explanationIncorrect || 'Hãy chú ý: Biến có thể thay đổi, còn Hằng không đổi trong khi chạy chương trình.'),
      };
    }
    case 'VD_Q4': {
      const clean = String(answer || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(':', '/');
      const isRight = clean === '360/n' || clean === '(360/n)';
      const maxPts = q?.points || 20;
      return {
        isCorrect: isRight,
        score: isRight ? maxPts : 0,
        maxScore: maxPts,
        explanation: isRight
          ? (q?.explanationCorrect || 'Chính xác! Biểu thức 360/n giúp xác định góc quay khi nhân vật vẽ hình có n cạnh.')
          : (q?.explanationIncorrect || 'Hãy thử lại! Để vẽ hình có n cạnh đều, góc quay được tính bằng 360 chia cho n.'),
      };
    }
    case 'VD_Q5': {
      const mObj = (typeof answer === 'object' && answer !== null ? answer : {}) as Record<string, unknown>;
      const m1 = norm(mObj['1']) === 'c' || norm(mObj['1']) === 'kiểu số';
      const m2 = norm(mObj['2']) === 'a' || norm(mObj['2']) === 'kiểu xâu kí tự';
      const m3 = norm(mObj['3']) === 'b' || norm(mObj['3']) === 'kiểu logic';
      const hits = (m1 ? 1 : 0) + (m2 ? 1 : 0) + (m3 ? 1 : 0);
      const maxPts = q?.points || 20;
      const score = hits === 3 ? maxPts : Math.round((hits / 3) * maxPts);
      const isExact = hits === 3;
      return {
        isCorrect: isExact,
        score,
        maxScore: maxPts,
        explanation: isExact
          ? (q?.explanationCorrect || 'Xuất sắc! Bạn đã kết nối chính xác các phép toán với kiểu dữ liệu tương ứng.')
          : (q?.explanationIncorrect || 'Nhóm 1 -> Kiểu số (C); Nhóm 2 -> Kiểu xâu kí tự (A); Nhóm 3 -> Kiểu logic (B).'),
      };
    }
    default:
      return {
        isCorrect: false,
        score: 0,
        maxScore: 20,
        explanation: 'Mã câu hỏi không xác định.',
      };
  }
}

/**
 * Nộp bài thử thách Vận dụng:
 * Áp dụng Instant Optimistic Grading (chấm điểm và phản hồi 0ms tức thì tại Client)
 * Đồng thời đồng bộ ngầm (background non-blocking sync) lên Google Apps Script / Google Sheets
 * Giúp học sinh không phải chờ đợi máy chủ xử lý, trải nghiệm mượt mà không độ trễ.
 */
export async function submitAnswer(params: {
  student: StudentProfile;
  question_id: string;
  question_type: string;
  answer: unknown;
  duration: number;
  customQuestions?: VanDungQuestion[];
}): Promise<{ feedback: GradeFeedback; updatedStudent: StudentProfile; attempts: AttemptRecord[]; synced: boolean }> {
  const nonce = generateLocalId('ATT');

  // 1. Chấm điểm ngay tại Client (Tốc độ < 1ms)
  const localGrading = gradeVanDungQuestionLocally(params.question_id, params.answer, params.customQuestions);
  const localAttempts = loadLocalAttempts();

  // 2. Tìm điểm cao nhất của câu này trước đó để tính điểm thưởng cộng thêm
  const prevBestScore = localAttempts
    .filter((a) => a.question_id === params.question_id)
    .reduce((max, a) => Math.max(max, a.score), 0);
  const awardedDelta = Math.max(0, localGrading.score - prevBestScore);

  // 3. Tạo bản ghi Attempt mới và lưu local
  const newAttempt: AttemptRecord = {
    attempt_id: nonce,
    student_id: params.student.student_id,
    question_id: params.question_id,
    question_type: params.question_type,
    answer: typeof params.answer === 'string' ? params.answer : JSON.stringify(params.answer),
    is_correct: localGrading.isCorrect,
    score: localGrading.score,
    duration: params.duration,
    submitted_at: new Date().toISOString(),
  };
  const nextAttempts = [...localAttempts, newAttempt];
  saveLocalAttempts(nextAttempts);

  // 4. Tính lại tổng điểm tốt nhất của học sinh
  const bestByQ: Record<string, { score: number; correct: boolean }> = {};
  nextAttempts.forEach((att) => {
    if (!bestByQ[att.question_id] || att.score > bestByQ[att.question_id].score) {
      bestByQ[att.question_id] = { score: att.score, correct: att.is_correct };
    } else if (att.is_correct) {
      bestByQ[att.question_id].correct = true;
    }
  });

  let totalScore = 0;
  let totalCorrect = 0;
  Object.values(bestByQ).forEach((item) => {
    totalScore += item.score;
    if (item.correct) totalCorrect++;
  });

  const updatedStudent: StudentProfile = {
    ...params.student,
    total_score: totalScore,
    total_correct: totalCorrect,
    total_attempts: nextAttempts.length,
    last_active: new Date().toISOString(),
  };
  saveLocalStudent(updatedStudent);

  const feedback: GradeFeedback = {
    ok: true,
    is_correct: localGrading.isCorrect,
    score: localGrading.score,
    awarded_delta: awardedDelta,
    max_score: localGrading.maxScore,
    explanation: localGrading.explanation,
    student: updatedStudent,
  };

  // 5. ĐỒNG BỘ NGẦM LÊN GOOGLE APPS SCRIPT / GOOGLE SHEETS (NON-BLOCKING)
  // Không await để UI phản hồi tức thì 0 giây
  if (getStoredGasUrl()) {
    gasPost<GradeFeedback & { attempt_id?: string; student?: StudentProfile }>({
      action: 'submitAnswer',
      student_id: params.student.student_id,
      full_name: params.student.full_name,
      display_name: params.student.display_name,
      school: params.student.school,
      class_name: params.student.class_name,
      question_id: params.question_id,
      question_type: params.question_type,
      answer: params.answer,
      duration: params.duration,
      submission_nonce: nonce,
      score: localGrading.score,
      max_score: localGrading.maxScore,
      is_correct: localGrading.isCorrect,
      explanation: localGrading.explanation,
    })
      .then((serverRes) => {
        if (serverRes?.student) {
          const current = loadLocalStudent();
          if (current && current.student_id === serverRes.student.student_id) {
            // Giữ điểm số đồng bộ với máy chủ nếu máy chủ có cập nhật
            const merged: StudentProfile = {
              ...current,
              total_score: Math.max(current.total_score, serverRes.student.total_score || 0),
            };
            saveLocalStudent(merged);
          }
        }
      })
      .catch((err) => {
        // Lỗi mạng hoặc Google Apps Script timeout sẽ không làm ảnh hưởng trải nghiệm học sinh
        console.warn('Lưu ngầm lên Google Apps Script:', err);
      });
  }

  return { feedback, updatedStudent, attempts: nextAttempts, synced: true };
}

/**
 * Đồng bộ toàn bộ điểm số của học sinh lên Google Sheets theo thời gian thực
 */
export async function syncStudentScoreToGas(student: StudentProfile): Promise<{ ok: boolean; message: string }> {
  if (!getStoredGasUrl()) {
    return { ok: false, message: 'Chưa cấu hình URL Google Apps Script.' };
  }
  try {
    const attempts = loadLocalAttempts().filter((a) => a.student_id === student.student_id);
    for (const att of attempts) {
      await gasPost({
        action: 'submitAnswer',
        student_id: student.student_id,
        full_name: student.full_name,
        display_name: student.display_name,
        school: student.school,
        class_name: student.class_name,
        question_id: att.question_id,
        question_type: att.question_type,
        answer: att.answer,
        duration: att.duration || 5,
        submission_nonce: att.attempt_id,
        score: att.score,
        is_correct: att.is_correct,
      });
    }
    return { ok: true, message: 'Đã đồng bộ toàn bộ điểm số vào Google Sheets thành công!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: errorMsg || 'Lỗi khi đồng bộ Google Sheets' };
  }
}

export async function fetchLeaderboard(currentStudentId?: string): Promise<{
  top10: LeaderboardEntry[];
  top50: LeaderboardEntry[];
  myRank?: LeaderboardEntry;
  totalStudents: number;
  synced: boolean;
}> {
  if (getStoredGasUrl()) {
    try {
      const res = await gasGet<{
        ok: boolean;
        top10: LeaderboardEntry[];
        top50: LeaderboardEntry[];
        myRank?: LeaderboardEntry;
        totalStudents: number;
      }>('getLeaderboard', currentStudentId ? { student_id: currentStudentId } : {});
      return {
        top10: res.top10 || [],
        top50: res.top50 || [],
        myRank: res.myRank,
        totalStudents: res.totalStudents || 0,
        synced: true,
      };
    } catch {
      // Fallback offline
    }
  }

  const local = loadLocalStudent();
  if (!local) {
    return { top10: [], top50: [], totalStudents: 0, synced: false };
  }
  const entry: LeaderboardEntry = {
    rank: 1,
    student_id: local.student_id,
    display_name: local.display_name,
    school: local.school,
    class_name: local.class_name,
    total_score: local.total_score,
    total_correct: local.total_correct,
    total_attempts: local.total_attempts,
    accuracy: local.total_attempts > 0 ? Math.round((local.total_correct / local.total_attempts) * 100) : 100,
    last_active: local.last_active,
  };
  return { top10: [entry], top50: [entry], myRank: entry, totalStudents: 1, synced: false };
}

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function fetchInitialSharedData(): Promise<{
  config: AppConfig;
  vanDungQuestions: VanDungQuestion[];
  synced: boolean;
}> {
  if (getStoredGasUrl()) {
    try {
      const res = await gasGet<{
        ok: boolean;
        config: AppConfig;
        vanDungQuestions?: VanDungQuestion[];
      }>('getSharedData');
      if (res && res.config) {
        return {
          config: res.config,
          vanDungQuestions: res.vanDungQuestions || loadLocalVanDungQuestions(),
          synced: true,
        };
      }
    } catch {
      // Fallback offline
    }
  }

  return {
    config: readLocalJson<AppConfig>(STORAGE_KEYS.OFFLINE_CONFIG, DEFAULT_CONFIG),
    vanDungQuestions: loadLocalVanDungQuestions(),
    synced: false,
  };
}

export async function teacherLoginRemote(password: string): Promise<{ ok: boolean; token?: string; error?: string }> {
  if (!getStoredGasUrl()) {
    if (password === '2026') {
      return { ok: true, token: 'OFFLINE_PREVIEW' };
    }
    return { ok: false, error: 'Mật khẩu giáo viên mặc định là 2026.' };
  }
  try {
    const res = await gasPost<{ ok: boolean; token?: string; error?: string }>({
      action: 'teacherLogin',
      password,
    });
    return res;
  } catch (err) {
    if (password === '2026') {
      return { ok: true, token: 'OFFLINE_PREVIEW' };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ xác thực.',
    };
  }
}

export async function fetchTeacherOverview(teacherToken: string): Promise<{
  students: StudentProfile[];
  vanDungQuestions: VanDungQuestion[];
  config: AppConfig;
  stats: { total_students: number; completed_students: number; total_score: number };
  synced: boolean;
}> {
  if (getStoredGasUrl() && teacherToken && teacherToken !== 'OFFLINE_PREVIEW') {
    try {
      const res = await gasPost<{
        ok: boolean;
        students: StudentProfile[];
        vanDungQuestions?: VanDungQuestion[];
        config: AppConfig;
        stats: { total_students: number; completed_students: number; total_score: number };
      }>({
        action: 'getTeacherOverview',
        teacher_token: teacherToken,
      });
      return {
        students: res.students || [],
        vanDungQuestions: res.vanDungQuestions || loadLocalVanDungQuestions(),
        config: res.config || DEFAULT_CONFIG,
        stats: res.stats || { total_students: 0, completed_students: 0, total_score: 0 },
        synced: true,
      };
    } catch {
      // Fallback
    }
  }

  const st = loadLocalStudent();
  const students = st ? [st] : [];
  return {
    students,
    vanDungQuestions: loadLocalVanDungQuestions(),
    config: readLocalJson(STORAGE_KEYS.OFFLINE_CONFIG, DEFAULT_CONFIG),
    stats: {
      total_students: students.length,
      completed_students: students.filter((s) => s.total_score >= 100).length,
      total_score: students.reduce((acc, s) => acc + s.total_score, 0),
    },
    synced: false,
  };
}

export async function saveTeacherVanDungQuestions(
  teacherToken: string,
  questions: VanDungQuestion[]
): Promise<VanDungQuestion[]> {
  saveLocalVanDungQuestions(questions);
  if (getStoredGasUrl() && teacherToken !== 'OFFLINE_PREVIEW') {
    try {
      const res = await gasPost<{ ok: boolean; questions: VanDungQuestion[] }>({
        action: 'saveVanDungQuestions',
        teacher_token: teacherToken,
        questions,
      });
      if (res && res.questions) return res.questions;
    } catch {
      // local saved
    }
  }
  return questions;
}

export async function saveTeacherAppConfig(teacherToken: string, config: AppConfig): Promise<AppConfig> {
  localStorage.setItem(STORAGE_KEYS.OFFLINE_CONFIG, JSON.stringify(config));
  if (getStoredGasUrl() && teacherToken !== 'OFFLINE_PREVIEW') {
    try {
      const res = await gasPost<{ ok: boolean; config: AppConfig }>({
        action: 'saveAppConfig',
        teacher_token: teacherToken,
        config,
      });
      if (res && res.config) return res.config;
    } catch {
      // local saved
    }
  }
  return config;
}

export async function changeTeacherPasswordRemote(
  teacherToken: string,
  oldPassword: string,
  newPassword: string
): Promise<{ ok: boolean; teacher_token?: string; error?: string }> {
  if (!getStoredGasUrl() || teacherToken === 'OFFLINE_PREVIEW') {
    return {
      ok: false,
      error: 'Cần kết nối Google Apps Script để đổi mật khẩu trên máy chủ.',
    };
  }
  try {
    const res = await gasPost<{ ok: boolean; teacher_token?: string; error?: string }>({
      action: 'changeTeacherPassword',
      teacher_token: teacherToken,
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Không thể đổi mật khẩu.',
    };
  }
}
