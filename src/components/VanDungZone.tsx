import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  CornerDownLeft,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  User,
  XCircle,
} from 'lucide-react';
import {
  AttemptRecord,
  GradeFeedback,
  StudentProfile,
  VanDungQuestion,
} from '../types';
import { ScratchCatAvatar, ScratchCatGuide } from './ScratchCatGuide';
import { getShortStudentName } from '../services/apiService';

interface VanDungZoneProps {
  student: StudentProfile;
  attempts: AttemptRecord[];
  questions: VanDungQuestion[];
  onBack: () => void;
  onGoToLeaderboard: () => void;
  onOpenProfile: () => void;
  onSubmitAnswer: (params: {
    question_id: string;
    question_type: string;
    answer: unknown;
    duration: number;
  }) => Promise<GradeFeedback>;
}

export function VanDungZone({
  student,
  attempts,
  questions,
  onBack,
  onGoToLeaderboard,
  onOpenProfile,
  onSubmitAnswer,
}: VanDungZoneProps) {
  const shortName = getShortStudentName(student.full_name);

  // Câu hỏi hiện tại (0 -> 4)
  const [currentIdx, setCurrentIdx] = useState(0);

  // State đáp án tạm thời của từng câu
  const [ans1, setAns1] = useState<string>(''); // single_choice: 'C'
  const [ans2, setAns2] = useState<string[]>([]); // multi_choice: ['A', 'B']
  const [ans3, setAns3] = useState<{ blank1: string; blank2: string }>({ blank1: '', blank2: '' }); // drag_drop
  const [selectedWordToPlace, setSelectedWordToPlace] = useState<string | null>(null); // Hỗ trợ click-to-place trên mobile
  const [ans4, setAns4] = useState<string>(''); // fill_blank: '360/n'
  const [ans5, setAns5] = useState<Record<string, string>>({}); // matching: { '1': 'C', '2': 'A' }
  const [matchingSelectedA, setMatchingSelectedA] = useState<string | null>(null);

  // Thời gian làm câu hỏi hiện tại
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);

  // Trạng thái nộp bài & phản hồi
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<GradeFeedback | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Đồng hồ tính thời gian tổng thể
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTotalElapsedTime((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Lấy kết quả tốt nhất của từng câu từ lịch sử attempts
  const bestScores: Record<string, { score: number; is_correct: boolean; answer: string }> = {};
  attempts.forEach((att) => {
    if (!bestScores[att.question_id] || att.score > bestScores[att.question_id].score) {
      bestScores[att.question_id] = { score: att.score, is_correct: att.is_correct, answer: att.answer };
    } else if (att.is_correct) {
      bestScores[att.question_id].is_correct = true;
    }
  });

  const currentQ = questions[currentIdx] || questions[0];

  // Khi chuyển câu: reset trạng thái form tạm thời hoặc khôi phục đáp án trước đó
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setFeedback(null);
    setIsAnswerSubmitted(false);

    // Khôi phục nếu đã từng nộp câu này
    const prev = bestScores[currentQ.id];
    if (prev) {
      try {
        if (currentQ.type === 'single_choice') {
          setAns1(prev.answer.replace(/"/g, ''));
        } else if (currentQ.type === 'multi_choice') {
          const parsed = JSON.parse(prev.answer);
          if (Array.isArray(parsed)) setAns2(parsed);
        } else if (currentQ.type === 'drag_drop') {
          const parsed = JSON.parse(prev.answer);
          if (parsed && typeof parsed === 'object') setAns3(parsed);
        } else if (currentQ.type === 'fill_blank') {
          setAns4(prev.answer.replace(/"/g, ''));
        } else if (currentQ.type === 'matching') {
          const parsed = JSON.parse(prev.answer);
          if (parsed && typeof parsed === 'object') setAns5(parsed);
        }
      } catch {
        // Fallback
      }
    }
  }, [currentIdx, currentQ.id]);

  // Kiểm tra xem câu hiện tại đã hoàn thành chưa
  const completedCount = questions.filter((q) => bestScores[q.id]?.is_correct || (bestScores[q.id]?.score || 0) > 0).length;
  const isAllCompleted = completedCount === questions.length;

  // Xử lý nộp bài
  const handleSubmit = async () => {
    if (submitting) return;

    let payloadAnswer: unknown = null;
    if (currentQ.type === 'single_choice') {
      if (!ans1) return;
      payloadAnswer = ans1;
    } else if (currentQ.type === 'multi_choice') {
      if (ans2.length === 0) return;
      payloadAnswer = ans2;
    } else if (currentQ.type === 'drag_drop') {
      if (!ans3.blank1 && !ans3.blank2) return;
      payloadAnswer = ans3;
    } else if (currentQ.type === 'fill_blank') {
      if (!ans4.trim()) return;
      payloadAnswer = ans4.trim();
    } else if (currentQ.type === 'matching') {
      if (Object.keys(ans5).length === 0) return;
      payloadAnswer = ans5;
    }

    const durationSec = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    setSubmitting(true);

    try {
      const fb = await onSubmitAnswer({
        question_id: currentQ.id,
        question_type: currentQ.type,
        answer: payloadAnswer,
        duration: durationSec,
      });
      setFeedback(fb);
      setIsAnswerSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Nút TIẾP TỤC: sang câu kế tiếp hoặc hiển thị màn hình tổng kết
  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((idx) => idx + 1);
    } else {
      setShowSummary(true);
    }
  };

  // Nút làm lại toàn bộ
  const handleRestart = () => {
    setShowSummary(false);
    setCurrentIdx(0);
    setAns1('');
    setAns2([]);
    setAns3({ blank1: '', blank2: '' });
    setAns4('');
    setAns5({});
    setFeedback(null);
    setIsAnswerSubmitted(false);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m > 0 ? `${m} phút ` : ''}${s} giây`;
  };

  /* ==================== MÀN HÌNH TỔNG KẾT ==================== */
  if (showSummary) {
    const totalAchievedScore = questions.reduce(
      (sum, q) => sum + (bestScores[q.id]?.score || 0),
      0
    );
    const totalCorrectCount = questions.filter((q) => bestScores[q.id]?.is_correct).length;
    const isPerfect = totalAchievedScore >= 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EBF5FF] via-[#F4F9FF] to-[#FFF8ED] px-4 py-8 text-slate-800">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Về Trang chủ</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Mã học sinh:</span>
              <span className="font-mono text-xs font-bold text-[#2389D8]">{student.student_id}</span>
            </div>
          </div>

          {/* Celebration Card */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl card-3d sm:p-10 text-center">
            {/* Mascot & Trophy */}
            <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FFD34F]/30 to-[#FF9850]/20 animate-pulse" />
              <ScratchCatAvatar mood="cheering" size={96} className="relative z-10 drop-shadow-md" />
              <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD34F] text-amber-900 shadow-md">
                <Trophy className="h-7 w-7 fill-amber-500 text-amber-700" />
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              CHÚC MỪNG BẠN ĐÃ CHINH PHỤC 5 THỬ THÁCH!
            </h1>
            <p className="mt-2 text-base font-semibold text-[#2389D8]">
              Chúc mừng <span className="font-extrabold text-slate-900">{student.full_name}</span> ({student.school} · Lớp {student.class_name})!
            </p>

            {/* Score Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-blue-100 bg-[#F0F8FF] p-4 text-center">
                <p className="text-xs font-bold text-slate-500">TỔNG ĐIỂM ĐẠT</p>
                <p className="mt-1 text-2xl font-black text-[#2389D8] tabular-nums sm:text-3xl">
                  {totalAchievedScore}
                  <span className="text-sm font-bold text-slate-400">/100</span>
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-[#F0FDF4] p-4 text-center">
                <p className="text-xs font-bold text-slate-500">SỐ CÂU ĐÚNG</p>
                <p className="mt-1 text-2xl font-black text-emerald-600 tabular-nums sm:text-3xl">
                  {totalCorrectCount}
                  <span className="text-sm font-bold text-slate-400">/5</span>
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-[#FAF5FF] p-4 text-center">
                <p className="text-xs font-bold text-slate-500">THỜI GIAN</p>
                <p className="mt-1 text-lg font-black text-purple-700 sm:text-xl">
                  {formatTime(totalElapsedTime)}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-[#FFFBEB] p-4 text-center">
                <p className="text-xs font-bold text-slate-500">DANH HIỆU</p>
                <p className="mt-1 text-xs font-extrabold text-amber-800 sm:text-sm">
                  {isPerfect ? 'Nhà Vô Địch Dữ Liệu' : totalAchievedScore >= 70 ? 'Chuyên Gia Scratch' : 'Nhà Khám Phá Trẻ'}
                </p>
              </div>
            </div>

            {/* Questions Detailed Breakdown */}
            <div className="mt-8 text-left">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                Kết quả chi tiết 5 thử thách
              </h3>
              <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200">
                {questions.map((q) => {
                  const result = bestScores[q.id];
                  const sc = result?.score || 0;
                  const isOk = result?.is_correct;
                  return (
                    <div key={q.id} className="flex items-center justify-between p-3.5 sm:px-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                            isOk
                              ? 'bg-emerald-100 text-emerald-700'
                              : sc > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {q.index}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 sm:text-sm">{q.title}</p>
                          <p className="text-[11px] text-slate-500">{q.typeLabel}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-black text-slate-800">
                          {sc}/{q.points} đ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onGoToLeaderboard}
                className="btn-3d flex items-center gap-2 rounded-2xl bg-[#2389D8] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#1C76BD]"
              >
                <Trophy className="h-4 w-4" />
                <span>Xem Bảng xếp hạng toàn quốc</span>
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Làm lại thử thách</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <span>Về trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==================== MÀN HÌNH LÀM BÀI 5 CÂU HỎI ==================== */
  return (
    <div className="min-h-screen bg-[#F4F9FF] text-slate-800 pb-12">
      {/* 1. HEADER KHU VỰC VẬN DỤNG */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Back button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              title="Quay lại Trang chủ"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:border-[#2389D8] hover:text-[#2389D8]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-[#2389D8] sm:text-lg">
                  DATA ADVENTURE
                </span>
                <span className="hidden text-xs font-semibold text-slate-400 sm:inline">·</span>
                <span className="hidden text-xs font-bold text-slate-600 sm:inline">
                  Vận dụng – Chinh phục 5 thử thách
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Chào <span className="font-bold text-slate-800">{shortName}</span>! Chúc bạn hoàn thành xuất sắc.
              </p>
            </div>
          </div>

          {/* Right Header: Points & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Score Pill */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-[#FFD34F]/25 px-3 py-1.5 text-xs font-extrabold text-amber-900 shadow-xs sm:px-4 sm:py-2">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="tabular-nums">{student.total_score} điểm</span>
            </div>

            {/* Leaderboard Shortcut */}
            <button
              type="button"
              onClick={onGoToLeaderboard}
              title="Xem Bảng xếp hạng"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:border-[#2389D8] hover:text-[#2389D8]"
            >
              <Trophy className="h-4 w-4" />
            </button>

            {/* Profile Avatar Button */}
            <button
              type="button"
              onClick={onOpenProfile}
              title="Xem hồ sơ cá nhân"
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-[#2389D8]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#2389D8]/10 text-[#2389D8]">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden md:inline max-w-[100px] truncate">{student.full_name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. KHU VỰC TIẾN TRÌNH 5 THỬ THÁCH */}
      <section className="border-b border-slate-200/60 bg-white py-3 shadow-xs">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Tiến trình thử thách
            </span>
            <span className="text-xs font-extrabold text-[#2389D8] tabular-nums">
              {completedCount}/5 câu hoàn thành
            </span>
          </div>

          {/* Stepper Grid (5 buttons) */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {questions.map((q, idx) => {
              const res = bestScores[q.id];
              const isCurrent = idx === currentIdx;
              const isDone = res?.is_correct || (res?.score || 0) > 0;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`group relative flex flex-col items-center justify-center rounded-2xl border p-2 sm:py-2.5 transition-all duration-200 ${
                    isCurrent
                      ? 'border-[#2389D8] bg-[#E8F4FF] shadow-sm ring-2 ring-[#2389D8]/20'
                      : isDone
                      ? 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/60'
                      : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                        isCurrent
                          ? 'bg-[#2389D8] text-white'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    {isDone && <CheckCircle2 className="hidden h-3.5 w-3.5 text-emerald-600 sm:inline" />}
                  </div>

                  <span
                    className={`mt-1 hidden text-[11px] font-bold md:block truncate max-w-full ${
                      isCurrent ? 'text-[#2389D8]' : isDone ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {q.title.replace(/Thử thách \d:\s*/, '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. KHU VỰC NỘI DUNG THỬ THÁCH (1 câu trên 1 màn hình) */}
      <main className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 card-3d shadow-sm sm:p-8">
          {/* Question Title & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="inline-block rounded-full bg-[#2389D8]/10 px-3 py-1 text-xs font-black text-[#2389D8]">
                {currentQ.title}
              </span>
              <p className="mt-1 text-xs font-medium text-slate-500">{currentQ.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                Điểm tối đa: {currentQ.points} đ
              </span>
            </div>
          </div>

          {/* Prompt */}
          <div className="mt-5">
            <h2 className="text-base font-extrabold leading-snug text-slate-900 sm:text-lg">
              {currentQ.prompt}
            </h2>
            {currentQ.instruction && (
              <p className="mt-1 text-xs font-semibold text-slate-500 flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-[#2389D8]" />
                <span>{currentQ.instruction}</span>
              </p>
            )}
          </div>

          {/* ==================== CÂU HỎI 1: CHỌN 1 ĐÁP ÁN ==================== */}
          {currentQ.type === 'single_choice' && currentQ.options && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {currentQ.options.map((opt) => {
                const isSelected = ans1 === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => setAns1(opt.id)}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 card-3d ${
                      isSelected
                        ? 'border-[#2389D8] bg-[#E8F4FF] shadow-md ring-2 ring-[#2389D8]/30 -translate-y-0.5'
                        : 'border-slate-200 bg-white hover:border-[#2389D8]/60 hover:bg-slate-50/80'
                    } ${isAnswerSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-black ${
                          isSelected ? 'bg-[#2389D8] text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <div>
                        <p className="font-mono text-base font-bold text-slate-900">{opt.label}</p>
                        {opt.badge && <p className="text-xs text-slate-500">{opt.badge}</p>}
                      </div>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#2389D8] bg-[#2389D8]' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ==================== CÂU HỎI 2: CHỌN NHIỀU ĐÁP ÁN ==================== */}
          {currentQ.type === 'multi_choice' && currentQ.options && (
            <div className="mt-6 space-y-2.5">
              <div className="grid gap-3 sm:grid-cols-2">
                {currentQ.options.map((opt) => {
                  const isChecked = ans2.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => {
                        if (isChecked) {
                          setAns2(ans2.filter((id) => id !== opt.id));
                        } else {
                          setAns2([...ans2, opt.id]);
                        }
                      }}
                      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 card-3d ${
                        isChecked
                          ? 'border-[#38C9B1] bg-[#E8FAF6] shadow-md ring-2 ring-[#38C9B1]/30 -translate-y-0.5'
                          : 'border-slate-200 bg-white hover:border-[#38C9B1]/60 hover:bg-slate-50'
                      } ${isAnswerSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-black ${
                            isChecked ? 'bg-[#38C9B1] text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{opt.label}</p>
                          {opt.badge && <p className="text-xs text-slate-500">{opt.badge}</p>}
                        </div>
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-colors ${
                          isChecked
                            ? 'border-[#38C9B1] bg-[#38C9B1] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 italic">
                * Mẹo: Bạn có thể chọn nhiều hơn 1 đáp án. Hãy chọn tất cả các phép toán logic nhé!
              </p>
            </div>
          )}

          {/* ==================== CÂU HỎI 3: KÉO THẢ CHỮ VÀO Ô TRỐNG ==================== */}
          {currentQ.type === 'drag_drop' && currentQ.dragItems && (
            <div className="mt-6 space-y-6">
              {/* Vùng từ vựng dạng viên thuốc để kéo / click chọn */}
              <div className="rounded-2xl border border-slate-200 bg-[#FFFDF7] p-4 text-center">
                <p className="text-xs font-bold text-slate-600 mb-2.5">
                  Thẻ từ cho sẵn (Kéo hoặc chạm vào từ rồi chạm vào ô trống):
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {currentQ.dragItems.map((word) => {
                    const isPlaced1 = ans3.blank1 === word;
                    const isPlaced2 = ans3.blank2 === word;
                    const isSelected = selectedWordToPlace === word;

                    return (
                      <div
                        key={word}
                        draggable={!isAnswerSubmitted}
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', word)}
                        onClick={() => {
                          if (isAnswerSubmitted) return;
                          setSelectedWordToPlace(isSelected ? null : word);
                        }}
                        className={`cursor-grab active:cursor-grabbing select-none rounded-2xl px-5 py-2.5 text-sm font-extrabold shadow-sm transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#FF9850] text-white ring-4 ring-[#FF9850]/30 scale-105'
                            : isPlaced1 || isPlaced2
                            ? 'bg-slate-200 text-slate-500 opacity-60'
                            : 'bg-gradient-to-r from-[#FF9850] to-[#FFB073] text-white hover:scale-105'
                        }`}
                      >
                        {word}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Đoạn văn chứa 2 ô trống */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 leading-relaxed text-sm sm:text-base text-slate-800">
                <div className="space-y-4">
                  {/* Dòng 1: Biến */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span>Biến được dùng để lưu trữ giá trị có thể</span>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (isAnswerSubmitted) return;
                        const w = e.dataTransfer.getData('text/plain');
                        if (w) setAns3((prev) => ({ ...prev, blank1: w }));
                      }}
                      onClick={() => {
                        if (isAnswerSubmitted) return;
                        if (selectedWordToPlace) {
                          setAns3((prev) => ({ ...prev, blank1: selectedWordToPlace }));
                          setSelectedWordToPlace(null);
                        } else if (ans3.blank1) {
                          setAns3((prev) => ({ ...prev, blank1: '' }));
                        }
                      }}
                      className={`inline-flex min-h-[42px] min-w-[130px] items-center justify-center rounded-xl border-2 border-dashed px-3 py-1 font-bold text-sm transition-colors ${
                        ans3.blank1
                          ? 'border-[#2389D8] bg-[#E8F4FF] text-[#2389D8]'
                          : selectedWordToPlace
                          ? 'border-[#FF9850] bg-amber-50/60 animate-pulse'
                          : 'border-slate-300 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {ans3.blank1 ? (
                        <span className="flex items-center gap-1.5 font-extrabold text-[#2389D8]">
                          {ans3.blank1}
                          {!isAnswerSubmitted && <span className="text-xs text-slate-400">×</span>}
                        </span>
                      ) : (
                        <span>[ Ô TRỐNG 1 ]</span>
                      )}
                    </div>
                    <span>trong quá trình thực hiện chương trình.</span>
                  </div>

                  {/* Dòng 2: Hằng */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <span>Hằng là giá trị</span>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (isAnswerSubmitted) return;
                        const w = e.dataTransfer.getData('text/plain');
                        if (w) setAns3((prev) => ({ ...prev, blank2: w }));
                      }}
                      onClick={() => {
                        if (isAnswerSubmitted) return;
                        if (selectedWordToPlace) {
                          setAns3((prev) => ({ ...prev, blank2: selectedWordToPlace }));
                          setSelectedWordToPlace(null);
                        } else if (ans3.blank2) {
                          setAns3((prev) => ({ ...prev, blank2: '' }));
                        }
                      }}
                      className={`inline-flex min-h-[42px] min-w-[130px] items-center justify-center rounded-xl border-2 border-dashed px-3 py-1 font-bold text-sm transition-colors ${
                        ans3.blank2
                          ? 'border-[#38C9B1] bg-[#E8FAF6] text-[#127A69]'
                          : selectedWordToPlace
                          ? 'border-[#FF9850] bg-amber-50/60 animate-pulse'
                          : 'border-slate-300 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {ans3.blank2 ? (
                        <span className="flex items-center gap-1.5 font-extrabold text-[#127A69]">
                          {ans3.blank2}
                          {!isAnswerSubmitted && <span className="text-xs text-slate-400">×</span>}
                        </span>
                      ) : (
                        <span>[ Ô TRỐNG 2 ]</span>
                      )}
                    </div>
                    <span>trong quá trình thực hiện chương trình.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== CÂU HỎI 4: ĐIỀN ĐÁP ÁN (BIỂU THỨC) ==================== */}
          {currentQ.type === 'fill_blank' && (
            <div className="mt-6 space-y-6">
              {/* Minh họa chú mèo Scratch vẽ đa giác đều */}
              <div className="grid gap-4 sm:grid-cols-12 rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4">
                <div className="sm:col-span-4 flex flex-col items-center justify-center p-2 text-center">
                  <ScratchCatAvatar mood="thinking" size={80} />
                  <p className="mt-2 text-xs font-bold text-slate-600">Mèo Scratch vẽ đa giác n cạnh</p>
                </div>
                <div className="sm:col-span-8 flex flex-col justify-center">
                  <div className="rounded-xl border border-blue-200/60 bg-white p-3.5 shadow-xs">
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                      💡 <strong>Nguyên lý vẽ đa giác đều n cạnh trong Scratch:</strong> Nhân vật di chuyển một đoạn rồi xoay một góc bằng <strong>tổng số đo góc một vòng tròn (360°)</strong> chia cho <strong>số cạnh (n)</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ô nhập biểu thức */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <div className="inline-flex flex-wrap items-center justify-center gap-3">
                  <span className="text-base font-black tracking-tight text-slate-800">GÓC QUAY =</span>
                  <input
                    type="text"
                    disabled={isAnswerSubmitted}
                    value={ans4}
                    onChange={(e) => setAns4(e.target.value)}
                    placeholder="ví dụ: 360/n"
                    className="w-48 sm:w-56 rounded-2xl border-2 border-[#2389D8] px-4 py-2.5 text-center font-mono text-lg font-black text-[#2389D8] shadow-inner focus:outline-none focus:ring-4 focus:ring-[#2389D8]/20"
                  />
                </div>

                {/* Bàn phím số / ký hiệu hỗ trợ nhanh */}
                {!isAnswerSubmitted && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {['3', '6', '0', '/', 'n', '(', ')'].map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setAns4((prev) => prev + key)}
                        className="h-10 w-11 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm font-black text-slate-700 shadow-xs hover:bg-[#2389D8] hover:text-white"
                      >
                        {key}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAns4((prev) => prev.slice(0, -1))}
                      className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 shadow-xs hover:bg-rose-50 hover:text-rose-600"
                    >
                      ⌫ Xóa
                    </button>
                    <button
                      type="button"
                      onClick={() => setAns4('')}
                      className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 shadow-xs hover:bg-rose-50 hover:text-rose-600"
                    >
                      Xóa hết
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== CÂU HỎI 5: GHÉP ĐÔI (MATCHING) ==================== */}
          {currentQ.type === 'matching' && currentQ.columnA && currentQ.columnB && (
            <div className="mt-6 space-y-4">
              <p className="text-xs text-slate-500 italic">
                * Hướng dẫn: Chạm chọn 1 mục ở <strong>Cột A (Phép toán)</strong> rồi chạm tiếp vào mục tương ứng ở <strong>Cột B (Kiểu dữ liệu)</strong> để nối.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Cột A */}
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase text-[#2389D8]">Cột A – Nhóm phép toán</div>
                  {currentQ.columnA.map((item) => {
                    const isSelected = matchingSelectedA === item.id;
                    const matchedB = ans5[item.id];
                    const matchedBObj = currentQ.columnB?.find((b) => b.id === matchedB);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isAnswerSubmitted}
                        onClick={() => {
                          setMatchingSelectedA(isSelected ? null : item.id);
                        }}
                        className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? 'border-[#2389D8] bg-[#E8F4FF] ring-2 ring-[#2389D8]/30 shadow-xs'
                            : matchedB
                            ? 'border-emerald-300 bg-emerald-50/50'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#2389D8] text-xs font-black text-white">
                            {item.id}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-slate-800">{item.text}</p>
                            {matchedBObj && (
                              <p className="mt-1 text-xs font-extrabold text-emerald-700">
                                ➔ Đã nối với: [{matchedBObj.id}] {matchedBObj.text}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Cột B */}
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase text-[#38C9B1]">Cột B – Kiểu dữ liệu</div>
                  {currentQ.columnB.map((item) => {
                    // Tìm xem mục A nào đang nối với mục B này
                    const linkedA = Object.keys(ans5).find((key) => ans5[key] === item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isAnswerSubmitted}
                        onClick={() => {
                          if (!matchingSelectedA) return;
                          setAns5((prev) => ({
                            ...prev,
                            [matchingSelectedA]: item.id,
                          }));
                          setMatchingSelectedA(null);
                        }}
                        className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                          matchingSelectedA
                            ? 'border-[#FF9850] bg-amber-50/50 hover:bg-amber-100/60 cursor-pointer animate-pulse'
                            : linkedA
                            ? 'border-emerald-300 bg-emerald-50/50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#38C9B1] text-xs font-black text-white">
                              {item.id}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-800">{item.text}</span>
                          </div>
                          {linkedA && (
                            <span className="rounded-md bg-emerald-200/60 px-2 py-0.5 text-[11px] font-extrabold text-emerald-800">
                              Từ [{linkedA}]
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {Object.keys(ans5).length > 0 && !isAnswerSubmitted && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setAns5({})}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600"
                  >
                    Hủy tất cả ghép nối
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================== PHẢN HỒI TỪ CHÚ MÈO SCRATCH ==================== */}
          {feedback && (
            <div className="mt-6 animate-fadeIn">
              <ScratchCatGuide
                mood={feedback.is_correct ? 'cheering' : 'encourage'}
                title={
                  feedback.is_correct
                    ? `Chính xác! (+${feedback.score} điểm)`
                    : feedback.score > 0
                    ? `Đúng một phần! (+${feedback.score} điểm)`
                    : 'Chưa chính xác'
                }
                message={feedback.explanation}
              />
            </div>
          )}

          {/* ==================== ACTION BUTTONS (XÁC NHẬN / TIẾP TỤC) ==================== */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2">
              {currentIdx > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((i) => i - 1)}
                  className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Câu trước</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="btn-3d flex items-center gap-2 rounded-2xl bg-[#2389D8] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[#1C76BD] disabled:opacity-60"
                >
                  {submitting ? (
                    <span>Đang chấm điểm...</span>
                  ) : (
                    <>
                      <span>XÁC NHẬN</span>
                      <CornerDownLeft className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-3d flex items-center gap-2 rounded-2xl bg-[#38C9B1] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[#2EB8A1]"
                >
                  <span>{currentIdx < questions.length - 1 ? 'TIẾP TỤC' : 'HOÀN THÀNH & TỔNG KẾT'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
