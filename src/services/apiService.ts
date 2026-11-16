import {
  AppConfig,
  AttemptRecord,
  BadgeInfo,
  ConnectionMode,
  GradeFeedback,
  GroupAssignment,
  LeaderboardEntry,
  StudentProfile,
  TeamGroup,
  TeamQuestion,
} from '../types';
import {
  CHALLENGE_QUESTIONS,
  DEFAULT_ASSIGNMENTS,
  DEFAULT_GROUPS,
  DEFAULT_TEAM_QUESTIONS,
} from '../data/lessonData';

const STORAGE_KEYS = {
  GAS_URL: 'data_adventure_gas_url',
  STUDENT: 'data_adventure_student',
  ATTEMPTS: 'data_adventure_attempts',
  OFFLINE_GROUPS: 'data_adventure_offline_groups',
  OFFLINE_ASSIGNMENTS: 'data_adventure_offline_assignments',
  OFFLINE_TEAM_Q: 'data_adventure_offline_team_questions',
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

export function computeBadges(student: StudentProfile | null, attempts: AttemptRecord[]): BadgeInfo[] {
  const passedIds = new Set(attempts.filter((a) => a.is_correct).map((a) => a.question_id));
  const groupADone = ['SGK_A1', 'SGK_A2', 'SGK_A3', 'SGK_A4'].every((id) => passedIds.has(id));
  const groupBDone = ['SGK_B5', 'SGK_B6', 'SGK_B7'].every((id) => passedIds.has(id));
  const groupCDone = ['SGK_C_EXPR', 'SGK_C8_PRACTICE'].every((id) => passedIds.has(id));
  const allChallengesDone = CHALLENGE_QUESTIONS.every((q) => passedIds.has(q.id));

  return [
    {
      id: 'starter',
      title: 'Nhà thám hiểm tập sự',
      description: 'Đăng nhập và bắt đầu hành trình DATA ADVENTURE',
      color: '#2389D8',
      unlocked: Boolean(student),
    },
    {
      id: 'datatypes',
      title: 'Bậc thầy kiểu dữ liệu',
      description: 'Hoàn thành Chặng 1 và Nhóm câu hỏi A',
      color: '#38C9B1',
      unlocked: passedIds.has('STAGE_1') && groupADone,
    },
    {
      id: 'vars',
      title: 'Chuyên gia hằng và biến',
      description: 'Hoàn thành Chặng 2 và Nhóm câu hỏi B',
      color: '#FF9850',
      unlocked: passedIds.has('STAGE_2') && groupBDone,
    },
    {
      id: 'expr',
      title: 'Chiến binh biểu thức',
      description: 'Hoàn thành Chặng 3 (Scratch) và Nhóm câu hỏi C',
      color: '#A88BFA',
      unlocked: passedIds.has('STAGE_3') && groupCDone,
    },
    {
      id: 'champion',
      title: 'Nhà vô địch DATA ADVENTURE',
      description: 'Hoàn thành toàn bộ 3 chặng học và tất cả thử thách SGK + mở rộng',
      color: '#FFD34F',
      unlocked:
        passedIds.has('STAGE_1') &&
        passedIds.has('STAGE_2') &&
        passedIds.has('STAGE_3') &&
        allChallengesDone,
    },
  ];
}

export function computeLessonProgress(attempts: AttemptRecord[]): number {
  const passedIds = new Set(attempts.filter((a) => a.is_correct).map((a) => a.question_id));
  const requiredIds = ['STAGE_1', 'STAGE_2', 'STAGE_3', ...CHALLENGE_QUESTIONS.map((q) => q.id)];
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
  // Sử dụng text/plain để tránh CORS preflight khi gọi Google Apps Script Web App
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
  student_id?: string;
}): Promise<{ student: StudentProfile; attempts: AttemptRecord[]; synced: boolean; warning?: string }> {
  const existing = loadLocalStudent();
  const reuseId =
    existing &&
    existing.full_name.toLowerCase() === input.full_name.trim().toLowerCase() &&
    existing.school.toLowerCase() === input.school.trim().toLowerCase() &&
    existing.class_name.toLowerCase() === input.class_name.trim().toLowerCase()
      ? existing.student_id
      : input.student_id || generateLocalId('HS');

  const now = new Date().toISOString();

  if (getStoredGasUrl()) {
    try {
      const res = await gasPost<{
        ok: boolean;
        student: StudentProfile;
        attempts: AttemptRecord[];
      }>({
        action: 'registerStudent',
        student_id: reuseId,
        full_name: input.full_name.trim(),
        school: input.school.trim(),
        class_name: input.class_name.trim(),
      });
      saveLocalStudent(res.student);
      saveLocalAttempts(res.attempts || []);
      return { student: res.student, attempts: res.attempts || [], synced: true };
    } catch (err) {
      const fallbackStudent: StudentProfile = {
        student_id: reuseId,
        full_name: input.full_name.trim(),
        display_name: createDisplayName(input.full_name),
        school: input.school.trim(),
        class_name: input.class_name.trim(),
        join_time: existing?.join_time || now,
        last_active: now,
        total_score: existing?.total_score || 0,
        total_correct: existing?.total_correct || 0,
        total_attempts: existing?.total_attempts || 0,
      };
      saveLocalStudent(fallbackStudent);
      return {
        student: fallbackStudent,
        attempts: loadLocalAttempts(),
        synced: false,
        warning: err instanceof Error ? err.message : 'Đang lưu tạm trên thiết bị (OFFLINE).',
      };
    }
  }

  const localStudent: StudentProfile = {
    student_id: reuseId,
    full_name: input.full_name.trim(),
    display_name: createDisplayName(input.full_name),
    school: input.school.trim(),
    class_name: input.class_name.trim(),
    join_time: existing?.join_time || now,
    last_active: now,
    total_score: existing?.student_id === reuseId ? existing.total_score : 0,
    total_correct: existing?.student_id === reuseId ? existing.total_correct : 0,
    total_attempts: existing?.student_id === reuseId ? existing.total_attempts : 0,
  };
  saveLocalStudent(localStudent);
  const attempts = existing?.student_id === reuseId ? loadLocalAttempts() : [];
  saveLocalAttempts(attempts);
  return { student: localStudent, attempts, synced: false };
}

export async function syncExistingStudentProfile(
  student: StudentProfile
): Promise<{ student: StudentProfile; attempts: AttemptRecord[]; synced: boolean }> {
  if (!getStoredGasUrl()) {
    return { student, attempts: loadLocalAttempts(), synced: false };
  }
  try {
    const res = await gasGet<{ ok: boolean; student: StudentProfile; attempts: AttemptRecord[] }>(
      'getStudentProfile',
      { student_id: student.student_id }
    );
    saveLocalStudent(res.student);
    saveLocalAttempts(res.attempts || []);
    return { student: res.student, attempts: res.attempts || [], synced: true };
  } catch {
    return { student, attempts: loadLocalAttempts(), synced: false };
  }
}

/* ============================================================================
 * LOCAL DEMO GRADING MIRROR (CHỈ DÙNG KHI CHƯA KẾT NỐI GOOGLE APPS SCRIPT)
 * Khi đã kết nối GAS, điểm được xác minh hoàn toàn phía máy chủ Code.gs
 * ============================================================================ */

function norm(val: unknown): string {
  return String(val ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function gradeLocallyForDemo(
  questionId: string,
  answer: unknown,
  teamQuestions: TeamQuestion[]
): { isCorrect: boolean; score: number; maxScore: number; explanation: string } {
  if (questionId === 'STAGE_1' || questionId === 'STAGE_2' || questionId === 'STAGE_3') {
    return {
      isCorrect: true,
      score: 20,
      maxScore: 20,
      explanation: 'Hoàn thành chặng học tập (+20 điểm).',
    };
  }
  if (questionId === 'LESSON_COMPLETE_BONUS') {
    return {
      isCorrect: true,
      score: 30,
      maxScore: 30,
      explanation: 'Hoàn thành toàn bộ Bài 13 (+30 điểm).',
    };
  }

  const a = (answer && typeof answer === 'object' ? answer : {}) as Record<string, unknown>;

  switch (questionId) {
    case 'SGK_A1': {
      const ok1 = norm(a['Tin học']) === 'xâu kí tự';
      const ok2 = norm(a['3.141592']) === 'số';
      const hits = (ok1 ? 1 : 0) + (ok2 ? 1 : 0);
      return {
        isCorrect: hits === 2,
        score: Math.round((hits / 2) * 10),
        maxScore: 10,
        explanation: '"Tin học" là xâu kí tự; 3.141592 là số thập phân thuộc kiểu số.',
      };
    }
    case 'SGK_A2': {
      const c1 = norm(a.c1) === '8';
      const c2 = norm(a.c2_val) === '35' && norm(a.c2_type) === 'xâu kí tự';
      const c3 = norm(a.c3_val) === 'true' && norm(a.c3_type) === 'logic';
      const hits = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
      return {
        isCorrect: hits === 3,
        score: Math.round((hits / 3) * 15),
        maxScore: 15,
        explanation: 'A1+B1 = 8 (Số); A1&B1 = "35" (Xâu kí tự); A1<B1 = TRUE (Logic).',
      };
    }
    case 'SGK_A3': {
      const ok1 = norm(a['Cộng, trừ, nhân, chia']) === 'số';
      const ok2 = norm(a['JOIN']) === 'xâu kí tự';
      const ok3 = norm(a['So sánh, AND, OR, NOT']) === 'logic';
      const hits = (ok1 ? 1 : 0) + (ok2 ? 1 : 0) + (ok3 ? 1 : 0);
      return {
        isCorrect: hits === 3,
        score: Math.round((hits / 3) * 15),
        maxScore: 15,
        explanation: 'Số dùng +, -, ×, /; Xâu kí tự dùng JOIN; Logic dùng so sánh và AND, OR, NOT.',
      };
    }
    case 'SGK_A4':
      return gradeMultiLocal(
        answer,
        ['and_both', 'or_one', 'not_invert'],
        15,
        'AND đúng khi cả hai điều kiện đúng; OR đúng khi ít nhất một điều kiện đúng; NOT đảo ngược giá trị logic.'
      );
    case 'SGK_B5': {
      const ok = String(answer) === 'var_mutable';
      return {
        isCorrect: ok,
        score: ok ? 10 : 0,
        maxScore: 10,
        explanation: 'Biến dùng để lưu trữ giá trị có thể thay đổi trong khi thực hiện chương trình.',
      };
    }
    case 'SGK_B6': {
      const ok1 = norm(a['3.14']) === 'hằng số';
      const ok2 = norm(a['"Xin chào!"']) === 'hằng xâu kí tự';
      const ok3 = norm(a['true']) === 'hằng logic';
      const hits = (ok1 ? 1 : 0) + (ok2 ? 1 : 0) + (ok3 ? 1 : 0);
      return {
        isCorrect: hits === 3,
        score: Math.round((hits / 3) * 15),
        maxScore: 15,
        explanation: '3.14 là hằng số; "Xin chào!" là hằng xâu kí tự; true là hằng logic.',
      };
    }
    case 'SGK_B7': {
      const ok = String(answer) === 'expr_combo';
      return {
        isCorrect: ok,
        score: ok ? 10 : 0,
        maxScore: 10,
        explanation: 'Biểu thức là sự kết hợp của biến, hằng, dấu ngoặc, phép toán và hàm để trả về một giá trị.',
      };
    }
    case 'SGK_C_EXPR': {
      const aOk = norm(a.a_val) === 'true' && norm(a.a_type) === 'logic';
      const bOk = Number(a.b_val) === 31.4 && norm(a.b_type) === 'số';
      const cValNorm = norm(a.c_val).replace(/^["“]|["”]$/g, '');
      const cOk = cValNorm === 'chu vi đường tròn là 31.4' && norm(a.c_type) === 'xâu kí tự';
      const hits = (aOk ? 1 : 0) + (bOk ? 1 : 0) + (cOk ? 1 : 0);
      return {
        isCorrect: hits === 3,
        score: Math.round((hits / 3) * 15),
        maxScore: 15,
        explanation:
          'Với r = 5: r > 0 là TRUE (Logic); 2×3.14×r là 31.4 (Số); JOIN tạo "Chu vi đường tròn là 31.4" (Xâu kí tự).',
      };
    }
    case 'SGK_C8_PRACTICE': {
      const r = Number(a.r);
      const c = Number(a.c);
      const s = Number(a.s);
      if (isNaN(r) || r < 0 || isNaN(c) || isNaN(s)) {
        return {
          isCorrect: false,
          score: 0,
          maxScore: 20,
          explanation: 'Bán kính r phải là số không âm và kết quả C, S phải hợp lệ.',
        };
      }
      const expC = 2 * 3.14 * r;
      const expS = 3.14 * r * r;
      const cOk = Math.abs(c - expC) < 0.05;
      const sOk = Math.abs(s - expS) < 0.05;
      const hits = (cOk ? 1 : 0) + (sOk ? 1 : 0);
      return {
        isCorrect: hits === 2,
        score: hits * 10,
        maxScore: 20,
        explanation: `Với r = ${r}: Chu vi C = ${expC.toFixed(2)}; Diện tích S = ${expS.toFixed(2)} (Kiểu Số).`,
      };
    }
    case 'EXT_1': {
      const ok = String(answer) === 'B';
      return {
        isCorrect: ok,
        score: ok ? 10 : 0,
        maxScore: 10,
        explanation: '"Computer" là một dãy các kí tự nên thuộc kiểu Xâu kí tự (B).',
      };
    }
    case 'EXT_2':
      return gradeMultiLocal(
        answer,
        ['A', 'B', 'C'],
        15,
        'Ba phép toán logic là AND (A), OR (B), NOT (C).'
      );
    case 'EXT_3': {
      const exp: Record<string, string> = {
        '15': 'số',
        '3.141592': 'số',
        '@': 'xâu kí tự',
        Computer: 'xâu kí tự',
        true: 'logic',
        false: 'logic',
      };
      let hits = 0;
      Object.keys(exp).forEach((k) => {
        if (norm(a[k]) === exp[k]) hits++;
      });
      return {
        isCorrect: hits === 6,
        score: Math.round((hits / 6) * 15),
        maxScore: 15,
        explanation: 'Số: 15, 3.141592; Xâu kí tự: @, Computer; Logic: true, false.',
      };
    }
    case 'EXT_4': {
      const b1 = norm(a.blank1) === 'thay đổi';
      const b2 = norm(a.blank2) === 'không đổi';
      const hits = (b1 ? 1 : 0) + (b2 ? 1 : 0);
      return {
        isCorrect: hits === 2,
        score: hits * 5,
        maxScore: 10,
        explanation: 'Biến lưu trữ giá trị có thể thay đổi; Hằng là giá trị không đổi.',
      };
    }
    case 'EXT_5': {
      const ok1 = norm(a['Biến']) === 'change';
      const ok2 = norm(a['Hằng']) === 'constant';
      const ok3 = norm(a['Biểu thức']) === 'expression';
      const hits = (ok1 ? 1 : 0) + (ok2 ? 1 : 0) + (ok3 ? 1 : 0);
      return {
        isCorrect: hits === 3,
        score: Math.round((hits / 3) * 15),
        maxScore: 15,
        explanation: 'Biến -> thay đổi; Hằng -> không đổi; Biểu thức -> trả lại một giá trị.',
      };
    }
    default: {
      const found = teamQuestions.find((q) => q.question_id === questionId);
      if (found) {
        const ok = norm(answer) === norm(found.correct_answer);
        return {
          isCorrect: ok,
          score: ok ? found.points : 0,
          maxScore: found.points,
          explanation: found.explanation,
        };
      }
      return { isCorrect: false, score: 0, maxScore: 10, explanation: 'Không tìm thấy mã câu hỏi.' };
    }
  }
}

function gradeMultiLocal(
  answer: unknown,
  correctArr: string[],
  maxScore: number,
  explanation: string
) {
  const selected = Array.isArray(answer) ? answer.map(String) : [];
  let correctCount = 0;
  let wrongCount = 0;
  selected.forEach((s) => {
    if (correctArr.includes(s)) correctCount++;
    else wrongCount++;
  });
  const net = Math.max(0, correctCount - wrongCount);
  return {
    isCorrect: correctCount === correctArr.length && wrongCount === 0,
    score: Math.round((net / correctArr.length) * maxScore),
    maxScore,
    explanation,
  };
}

export async function submitAnswer(params: {
  student: StudentProfile;
  question_id: string;
  question_type: string;
  answer: unknown;
  duration: number;
  teamQuestions?: TeamQuestion[];
}): Promise<{ feedback: GradeFeedback; updatedStudent: StudentProfile; attempts: AttemptRecord[]; synced: boolean }> {
  const nonce = generateLocalId('ATT');

  if (getStoredGasUrl()) {
    try {
      const res = await gasPost<GradeFeedback & { attempt_id?: string }>({
        action: 'submitAnswer',
        student_id: params.student.student_id,
        question_id: params.question_id,
        question_type: params.question_type,
        answer: params.answer,
        duration: params.duration,
        submission_nonce: nonce,
      });

      const localAttempts = loadLocalAttempts();
      const newAttempt: AttemptRecord = {
        attempt_id: res.attempt_id || nonce,
        student_id: params.student.student_id,
        question_id: params.question_id,
        question_type: params.question_type,
        answer: typeof params.answer === 'string' ? params.answer : JSON.stringify(params.answer),
        is_correct: res.is_correct,
        score: res.score,
        duration: params.duration,
        submitted_at: new Date().toISOString(),
      };
      const nextAttempts = [...localAttempts, newAttempt];
      saveLocalAttempts(nextAttempts);

      const updatedStudent = res.student || params.student;
      saveLocalStudent(updatedStudent);

      return { feedback: res, updatedStudent, attempts: nextAttempts, synced: true };
    } catch (err) {
      return {
        feedback: {
          ok: false,
          is_correct: false,
          score: 0,
          awarded_delta: 0,
          max_score: 0,
          explanation: '',
          error:
            err instanceof Error
              ? `Không thể gửi kết quả lên Google Sheets: ${err.message}`
              : 'Mất kết nối mạng khi gửi bài.',
        },
        updatedStudent: params.student,
        attempts: loadLocalAttempts(),
        synced: false,
      };
    }
  }

  // DEMO / OFFLINE fallback
  const localAttempts = loadLocalAttempts();
  const prevBest = localAttempts
    .filter((a) => a.question_id === params.question_id)
    .reduce((max, a) => Math.max(max, a.score), 0);

  const graded = gradeLocallyForDemo(
    params.question_id,
    params.answer,
    params.teamQuestions || DEFAULT_TEAM_QUESTIONS
  );
  const awardedDelta = Math.max(0, graded.score - prevBest);

  const newAttempt: AttemptRecord = {
    attempt_id: nonce,
    student_id: params.student.student_id,
    question_id: params.question_id,
    question_type: params.question_type,
    answer: typeof params.answer === 'string' ? params.answer : JSON.stringify(params.answer),
    is_correct: graded.isCorrect,
    score: graded.score,
    duration: params.duration,
    submitted_at: new Date().toISOString(),
  };

  const nextAttempts = [...localAttempts, newAttempt];
  saveLocalAttempts(nextAttempts);

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
  Object.values(bestByQ).forEach((v) => {
    totalScore += v.score;
    if (v.correct) totalCorrect++;
  });

  const updatedStudent: StudentProfile = {
    ...params.student,
    last_active: new Date().toISOString(),
    total_score: totalScore,
    total_correct: totalCorrect,
    total_attempts: nextAttempts.length,
  };
  saveLocalStudent(updatedStudent);

  return {
    feedback: {
      ok: true,
      is_correct: graded.isCorrect,
      score: graded.score,
      awarded_delta: awardedDelta,
      max_score: graded.maxScore,
      explanation: graded.explanation,
      student: updatedStudent,
    },
    updatedStudent,
    attempts: nextAttempts,
    synced: false,
  };
}

export async function fetchLeaderboard(studentId: string): Promise<{
  connected: boolean;
  total_students: number;
  top10: LeaderboardEntry[];
  top50: LeaderboardEntry[];
  my_rank: LeaderboardEntry | null;
  updated_at?: string;
  error?: string;
}> {
  if (!getStoredGasUrl()) {
    return {
      connected: false,
      total_students: 0,
      top10: [],
      top50: [],
      my_rank: null,
    };
  }
  try {
    const res = await gasGet<{
      ok: boolean;
      total_students: number;
      top10: LeaderboardEntry[];
      top50: LeaderboardEntry[];
      my_rank: LeaderboardEntry | null;
      updated_at: string;
    }>('getLeaderboard', { student_id: studentId });
    return {
      connected: true,
      total_students: res.total_students,
      top10: res.top10 || [],
      top50: res.top50 || [],
      my_rank: res.my_rank || null,
      updated_at: res.updated_at,
    };
  } catch (err) {
    return {
      connected: true,
      total_students: 0,
      top10: [],
      top50: [],
      my_rank: null,
      error: err instanceof Error ? err.message : 'Không thể tải bảng xếp hạng.',
    };
  }
}

export async function fetchInitialSharedData(): Promise<{
  config: AppConfig;
  groups: TeamGroup[];
  assignments: GroupAssignment[];
  questionBank: TeamQuestion[];
  synced: boolean;
}> {
  if (getStoredGasUrl()) {
    try {
      const res = await gasGet<{
        ok: boolean;
        config: AppConfig;
        groups: TeamGroup[];
        assignments: GroupAssignment[];
        questionBank: TeamQuestion[];
      }>('getInitialData');
      return {
        config: res.config || DEFAULT_CONFIG,
        groups: res.groups?.length ? res.groups : DEFAULT_GROUPS,
        assignments: res.assignments?.length ? res.assignments : DEFAULT_ASSIGNMENTS,
        questionBank: res.questionBank?.length ? res.questionBank : DEFAULT_TEAM_QUESTIONS,
        synced: true,
      };
    } catch {
      // Fallback to local saved teacher edits or defaults
    }
  }

  return {
    config: readLocalJson<AppConfig>(STORAGE_KEYS.OFFLINE_CONFIG, DEFAULT_CONFIG),
    groups: readLocalJson<TeamGroup[]>(STORAGE_KEYS.OFFLINE_GROUPS, DEFAULT_GROUPS),
    assignments: readLocalJson<GroupAssignment[]>(STORAGE_KEYS.OFFLINE_ASSIGNMENTS, DEFAULT_ASSIGNMENTS),
    questionBank: readLocalJson<TeamQuestion[]>(STORAGE_KEYS.OFFLINE_TEAM_Q, DEFAULT_TEAM_QUESTIONS),
    synced: false,
  };
}

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/* ============================================================================
 * TEACHER API CALLS
 * ============================================================================ */

export async function teacherLoginRemote(password: string): Promise<{ ok: boolean; token?: string; error?: string }> {
  if (!getStoredGasUrl()) {
    return {
      ok: false,
      error: 'Chưa cấu hình URL Google Apps Script. Vui lòng dán URL Apps Script trước khi xác thực mật khẩu máy chủ.',
    };
  }
  try {
    const res = await gasPost<{ ok: boolean; teacher_token?: string; error?: string }>({
      action: 'teacherLogin',
      password,
    });
    return { ok: true, token: res.teacher_token };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Đăng nhập thất bại.',
    };
  }
}

export async function fetchTeacherOverview(teacherToken: string): Promise<{
  students: StudentProfile[];
  groups: TeamGroup[];
  assignments: GroupAssignment[];
  questionBank: TeamQuestion[];
  config: AppConfig;
  stats: { total_students: number; completed_students: number; total_score: number };
  synced: boolean;
}> {
  if (getStoredGasUrl() && teacherToken && teacherToken !== 'OFFLINE_PREVIEW') {
    const res = await gasPost<{
      ok: boolean;
      students: StudentProfile[];
      groups: TeamGroup[];
      assignments: GroupAssignment[];
      questionBank: TeamQuestion[];
      config: AppConfig;
      stats: { total_students: number; completed_students: number; total_score: number };
    }>({
      action: 'getTeacherOverview',
      teacher_token: teacherToken,
    });
    return { ...res, synced: true };
  }

  const st = loadLocalStudent();
  const students = st ? [st] : [];
  return {
    students,
    groups: readLocalJson(STORAGE_KEYS.OFFLINE_GROUPS, DEFAULT_GROUPS),
    assignments: readLocalJson(STORAGE_KEYS.OFFLINE_ASSIGNMENTS, DEFAULT_ASSIGNMENTS),
    questionBank: readLocalJson(STORAGE_KEYS.OFFLINE_TEAM_Q, DEFAULT_TEAM_QUESTIONS),
    config: readLocalJson(STORAGE_KEYS.OFFLINE_CONFIG, DEFAULT_CONFIG),
    stats: {
      total_students: students.length,
      completed_students: students.filter((s) => s.total_correct >= 10).length,
      total_score: students.reduce((acc, s) => acc + s.total_score, 0),
    },
    synced: false,
  };
}

export async function saveTeacherGroups(teacherToken: string, groups: TeamGroup[]): Promise<TeamGroup[]> {
  if (getStoredGasUrl() && teacherToken !== 'OFFLINE_PREVIEW') {
    const res = await gasPost<{ ok: boolean; groups: TeamGroup[] }>({
      action: 'saveGroups',
      teacher_token: teacherToken,
      groups: groups.map((g) => ({
        group_id: g.group_id,
        group_name: g.group_name,
        member_ids: g.members.map((m) => m.student_id),
      })),
    });
    return res.groups;
  }
  localStorage.setItem(STORAGE_KEYS.OFFLINE_GROUPS, JSON.stringify(groups));
  return groups;
}

export async function saveTeacherAssignment(
  teacherToken: string,
  assignment: GroupAssignment
): Promise<GroupAssignment[]> {
  if (getStoredGasUrl() && teacherToken !== 'OFFLINE_PREVIEW') {
    const res = await gasPost<{ ok: boolean; assignments: GroupAssignment[] }>({
      action: 'saveAssignment',
      teacher_token: teacherToken,
      assignment,
    });
    return res.assignments;
  }
  const current = readLocalJson<GroupAssignment[]>(STORAGE_KEYS.OFFLINE_ASSIGNMENTS, DEFAULT_ASSIGNMENTS);
  const idx = current.findIndex((a) => a.assignment_id === assignment.assignment_id);
  const next = idx >= 0 ? current.map((a, i) => (i === idx ? assignment : a)) : [...current, assignment];
  localStorage.setItem(STORAGE_KEYS.OFFLINE_ASSIGNMENTS, JSON.stringify(next));
  return next;
}

export async function saveTeacherQuestionBank(
  teacherToken: string,
  questions: TeamQuestion[]
): Promise<TeamQuestion[]> {
  if (getStoredGasUrl() && teacherToken !== 'OFFLINE_PREVIEW') {
    const res = await gasPost<{ ok: boolean; questions: TeamQuestion[] }>({
      action: 'updateQuestionBank',
      teacher_token: teacherToken,
      questions,
    });
    return res.questions;
  }
  localStorage.setItem(STORAGE_KEYS.OFFLINE_TEAM_Q, JSON.stringify(questions));
  return questions;
}

export async function saveTeacherAppConfig(teacherToken: string, config: AppConfig): Promise<AppConfig> {
  if (getStoredGasUrl() && teacherToken !== 'OFFLINE_PREVIEW') {
    const res = await gasPost<{ ok: boolean; config: AppConfig }>({
      action: 'saveAppConfig',
      teacher_token: teacherToken,
      config,
    });
    return res.config;
  }
  localStorage.setItem(STORAGE_KEYS.OFFLINE_CONFIG, JSON.stringify(config));
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
    return { ok: true, teacher_token: res.teacher_token };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Không thể đổi mật khẩu.',
    };
  }
}
