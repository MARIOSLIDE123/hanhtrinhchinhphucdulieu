import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CornerDownLeft,
  HelpCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  User,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  AttemptRecord,
  GradeFeedback,
  StudentProfile,
  VanDungQuestion,
} from '../types';
import { ScratchCatAvatar, ScratchCatGuide } from './ScratchCatGuide';
import { getShortStudentName, syncStudentScoreToGas } from '../services/apiService';
import { soundService } from '../services/soundService';

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
  const [selectedWordToPlace, setSelectedWordToPlace] = useState<string | null>(null); // Hỗ trợ click-to-place
  const [ans4, setAns4] = useState<string>(''); // fill_blank: '360/n'
  const [ans5, setAns5] = useState<Record<string, string>>({}); // matching: { '1': 'C', '2': 'A' }
  const [matchingSelectedA, setMatchingSelectedA] = useState<string | null>(null);

  // Thời gian làm câu hỏi
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);

  // Trạng thái nộp bài & phản hồi
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<GradeFeedback | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Chế độ Toàn màn hình 16:9 (Fullscreen)
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Trạng thái âm thanh & đồng bộ Google Sheets
  const [isMuted, setIsMuted] = useState(soundService.getIsMuted());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('Đã kết nối Google Sheets');

  const toggleMute = () => {
    const next = soundService.toggleMute();
    setIsMuted(next);
  };

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatusMsg('Đang đồng bộ Google Sheets...');
    const res = await syncStudentScoreToGas(student);
    if (res.ok) {
      setSyncStatusMsg('Đã đồng bộ Google Sheets ✓');
    } else {
      setSyncStatusMsg('Chưa cập nhật Sheet');
    }
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg('Đã kết nối Google Sheets');
    }, 3000);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

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
  const completedCount = questions.filter(
    (q) => bestScores[q.id]?.is_correct || (bestScores[q.id]?.score || 0) > 0
  ).length;

  // Xử lý nộp bài tức thì (0ms phản hồi)
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

      // Phát âm thanh tương tác Đúng / Sai
      if (fb.is_correct || fb.score > 0) {
        soundService.playCorrect();
      } else {
        soundService.playIncorrect();
      }
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
    return `${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  /* ==================== MÀN HÌNH TỔNG KẾT (16:9 COMPACT) ==================== */
  if (showSummary) {
    const totalAchievedScore = questions.reduce(
      (sum, q) => sum + (bestScores[q.id]?.score || 0),
      0
    );
    const totalCorrectCount = questions.filter((q) => bestScores[q.id]?.is_correct).length;
    const isPerfect = totalAchievedScore >= 100;

    return (
      <div className="h-screen max-h-screen w-full flex flex-col justify-center items-center p-3 sm:p-6 bg-gradient-to-b from-[#EBF5FF] via-[#F4F9FF] to-[#FFF8ED] text-slate-800 overflow-y-auto select-none">
        <div className="w-full max-w-4xl mx-auto flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 shadow-2xl card-3d my-auto">
          {/* Header Compact */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Về Trang chủ</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">Mã học sinh:</span>
              <span className="font-mono text-xs font-extrabold text-[#2389D8]">{student.student_id}</span>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-[#2389D8]"
                title="Toàn màn hình 16:9"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Celebration Body */}
          <div className="py-4 text-center">
            {/* Mascot & Trophy */}
            <div className="relative mx-auto mb-3 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FFD34F]/30 to-[#FF9850]/20 animate-pulse" />
              <ScratchCatAvatar mood="cheering" size={80} className="relative z-10 drop-shadow-md" />
              <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFD34F] text-amber-900 shadow-md">
                <Trophy className="h-5 w-5 fill-amber-500 text-amber-700" />
              </div>
            </div>

            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              CHÚC MỪNG BẠN ĐÃ CHINH PHỤC 5 THỬ THÁCH!
            </h1>
            <p className="mt-1 text-sm font-semibold text-[#2389D8]">
              Chúc mừng <span className="font-extrabold text-slate-900">{student.full_name}</span> ({student.school} · Lớp {student.class_name})!
            </p>

            {/* Score Stats Grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-2xl mx-auto">
              <div className="rounded-2xl border border-blue-100 bg-[#F0F8FF] p-3 text-center">
                <p className="text-[11px] font-bold text-slate-500">TỔNG ĐIỂM</p>
                <p className="mt-0.5 text-2xl font-black text-[#2389D8] tabular-nums">
                  {totalAchievedScore}
                  <span className="text-xs font-bold text-slate-400">/100</span>
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-center">
                <p className="text-[11px] font-bold text-slate-500">CÂU ĐÚNG</p>
                <p className="mt-0.5 text-2xl font-black text-emerald-600 tabular-nums">
                  {totalCorrectCount}
                  <span className="text-xs font-bold text-slate-400">/5</span>
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3 text-center">
                <p className="text-[11px] font-bold text-slate-500">DANH HIỆU</p>
                <p className="mt-1 text-xs font-extrabold text-amber-800">
                  {isPerfect ? '🌟 Bậc Thầy Dữ Liệu' : totalAchievedScore >= 80 ? '⭐ Chuyên Gia Dữ Liệu' : '🚀 Nhà Thám Hiểm'}
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-3 text-center">
                <p className="text-[11px] font-bold text-slate-500">THỜI GIAN</p>
                <p className="mt-0.5 text-2xl font-black text-purple-700 tabular-nums">
                  {formatTime(totalElapsedTime)}
                </p>
              </div>
            </div>

            {/* 5 Questions Mini Grid */}
            <div className="mt-4 grid grid-cols-5 gap-2 max-w-2xl mx-auto">
              {questions.map((q, idx) => {
                const res = bestScores[q.id];
                const sc = res?.score || 0;
                const isMax = sc === q.points;
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-2 text-center ${
                      isMax ? 'border-emerald-300 bg-emerald-50/60' : sc > 0 ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span className="text-[11px] font-black text-slate-500">Câu {idx + 1}</span>
                    <p className="font-mono text-sm font-black text-slate-800">{sc}/{q.points}đ</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGoToLeaderboard}
              className="btn-3d flex items-center gap-2 rounded-2xl bg-[#2389D8] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1C76BD]"
            >
              <Trophy className="h-4 w-4" />
              <span>Xem Bảng xếp hạng</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Làm lại thử thách</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <span>Về Trang chủ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ==================== MÀN HÌNH LÀM BÀI 16:9 (FULL SCREEN 0-SCROLL) ==================== */
  return (
    <div className="h-screen max-h-screen w-full flex flex-col overflow-hidden bg-gradient-to-b from-[#EBF5FF] via-[#F4F9FF] to-[#E3F0FC] text-slate-800 select-none">
      {/* 1. TOP HEADER (COMPACT 16:9) */}
      <header className="h-14 sm:h-15 px-3 sm:px-6 bg-white/95 border-b border-slate-200/80 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            title="Quay lại Trang chủ"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs hover:border-[#2389D8] hover:text-[#2389D8]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#2389D8]">
                DATA ADVENTURE
              </span>
              <span className="hidden sm:inline text-xs font-bold text-slate-400">·</span>
              <span className="hidden sm:inline text-xs font-bold text-slate-600">
                5 Thử thách Vận dụng
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 truncate">
              Chào <span className="font-bold text-slate-700">{shortName}</span>! Hãy hoàn thành 5 câu hỏi để ghi danh.
            </p>
          </div>
        </div>

        {/* Right: Realtime Sheet, Sound, Score, Fullscreen, Leaderboard, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Trạng thái Google Sheets Realtime */}
          <button
            type="button"
            onClick={handleManualSync}
            title="Đồng bộ điểm vào Google Sheets theo thời gian thực (Bấm để đồng bộ ngay)"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-[11px] font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncStatusMsg}</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? 'Bật âm thanh tương tác' : 'Tắt âm thanh tương tác'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-[#2389D8] hover:text-[#2389D8] shadow-2xs cursor-pointer"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-500" /> : <Volume2 className="h-4 w-4 text-[#2389D8]" />}
          </button>

          {/* Score Pill */}
          <div className="flex items-center gap-1.5 rounded-xl bg-[#FFD34F]/25 px-3 py-1.5 text-xs font-extrabold text-amber-900 shadow-2xs">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="tabular-nums font-black">{student.total_score} đ</span>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Bật toàn màn hình 16:9'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-[#2389D8] hover:text-[#2389D8] shadow-2xs"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Leaderboard Button */}
          <button
            type="button"
            onClick={onGoToLeaderboard}
            title="Xem Bảng xếp hạng"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-[#2389D8] hover:text-[#2389D8] shadow-2xs"
          >
            <Trophy className="h-4 w-4" />
          </button>

          {/* Profile Button */}
          <button
            type="button"
            onClick={onOpenProfile}
            title="Xem hồ sơ cá nhân"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-[#2389D8] shadow-2xs"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2389D8]/10 text-[#2389D8]">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="hidden lg:inline max-w-[90px] truncate">{student.full_name}</span>
          </button>
        </div>
      </header>

      {/* 2. PROGRESS STEPPER (COMPACT 16:9, HEIGHT ~48px) */}
      <nav className="h-12 px-3 sm:px-6 bg-white/80 border-b border-slate-200/60 flex items-center justify-between shrink-0 z-10">
        <div className="mx-auto max-w-5xl w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline text-xs font-black uppercase tracking-wider text-slate-500">
              Tiến trình:
            </span>
            <span className="text-xs font-extrabold text-[#2389D8] tabular-nums">
              {completedCount}/5 câu
            </span>
          </div>

          {/* 5 Stepper Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {questions.map((q, idx) => {
              const res = bestScores[q.id];
              const isCurrent = idx === currentIdx;
              const isDone = res?.is_correct || (res?.score || 0) > 0;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`flex items-center gap-1 sm:gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                    isCurrent
                      ? 'border border-[#2389D8] bg-[#E8F4FF] text-[#2389D8] ring-2 ring-[#2389D8]/20 shadow-xs'
                      : isDone
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/60'
                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${
                      isCurrent
                        ? 'bg-[#2389D8] text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="hidden md:inline text-[11px] max-w-[80px] truncate">
                    {q.title.replace(/Thử thách \d:\s*/, '')}
                  </span>
                  {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 3. MAIN CARD CONTAINER (VỪA VẶN 1 KHUNG HÌNH 16:9) */}
      <main className="flex-1 min-h-0 flex flex-col p-2 sm:p-3 md:p-4 max-w-5xl mx-auto w-full">
        <div className="flex-1 min-h-0 flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-lg overflow-hidden relative card-3d">
          
          {/* Card Header (Tiêu đề & Đề bài) */}
          <div className="shrink-0 border-b border-slate-100 pb-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#2389D8]/10 px-2.5 py-0.5 text-xs font-black text-[#2389D8]">
                  {currentQ.title}
                </span>
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  {currentQ.subtitle}
                </span>
              </div>
              <span className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                {currentQ.points} điểm
              </span>
            </div>

            {/* Prompt */}
            <h2 className="mt-2 text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
              {currentQ.prompt}
            </h2>
            {currentQ.instruction && (
              <p className="mt-0.5 text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <HelpCircle className="h-3 w-3 text-[#2389D8] shrink-0" />
                <span>{currentQ.instruction}</span>
              </p>
            )}
          </div>

          {/* Card Body: Khu vực tương tác câu hỏi (Tối ưu chiều cao 16:9) */}
          <div className="flex-1 min-h-0 flex flex-col justify-center py-2 sm:py-3 overflow-y-auto">
            
            {/* ========== CÂU 1: CHỌN 1 ĐÁP ÁN (SINGLE CHOICE) ========== */}
            {currentQ.type === 'single_choice' && currentQ.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl mx-auto w-full">
                {currentQ.options.map((opt) => {
                  const isSelected = ans1 === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => setAns1(opt.id)}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-left transition-all duration-150 card-3d ${
                        isSelected
                          ? 'border-[#2389D8] bg-[#E8F4FF] shadow-md ring-2 ring-[#2389D8]/30 -translate-y-0.5'
                          : 'border-slate-200 bg-white hover:border-[#2389D8]/60 hover:bg-slate-50/80'
                      } ${isAnswerSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black ${
                            isSelected ? 'bg-[#2389D8] text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <div>
                          <p className="font-mono text-sm sm:text-base font-bold text-slate-900">{opt.label}</p>
                          {opt.badge && <p className="text-[10px] text-slate-500">{opt.badge}</p>}
                        </div>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-[#2389D8] bg-[#2389D8]' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ========== CÂU 2: CHỌN NHIỀU ĐÁP ÁN (MULTI CHOICE) ========== */}
            {currentQ.type === 'multi_choice' && currentQ.options && (
              <div className="max-w-2xl mx-auto w-full space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                        className={`flex items-center justify-between rounded-2xl border p-2.5 sm:p-3 text-left transition-all duration-150 card-3d ${
                          isChecked
                            ? 'border-[#38C9B1] bg-[#E8FAF6] shadow-md ring-2 ring-[#38C9B1]/30 -translate-y-0.5'
                            : 'border-slate-200 bg-white hover:border-[#38C9B1]/60 hover:bg-slate-50'
                        } ${isAnswerSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black ${
                              isChecked ? 'bg-[#38C9B1] text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-slate-900">{opt.label}</p>
                            {opt.badge && <p className="text-[10px] text-slate-500">{opt.badge}</p>}
                          </div>
                        </div>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-colors ${
                            isChecked ? 'border-[#38C9B1] bg-[#38C9B1] text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 italic text-center">
                  * Mẹo: Chọn tất cả các phép toán logic (có thể chọn nhiều hơn 1 đáp án).
                </p>
              </div>
            )}

            {/* ========== CÂU 3: KÉO THẢ CHỮ VÀO Ô TRỐNG (DRAG DROP) ========== */}
            {currentQ.type === 'drag_drop' && currentQ.dragItems && (
              <div className="max-w-2xl mx-auto w-full space-y-3">
                {/* Thẻ từ cho sẵn */}
                <div className="rounded-2xl border border-slate-200 bg-[#FFFDF7] p-2.5 text-center">
                  <p className="text-[11px] font-bold text-slate-600 mb-1.5">
                    Thẻ từ cho sẵn (Kéo hoặc chạm chọn từ rồi chạm vào ô trống):
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
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
                          className={`cursor-grab active:cursor-grabbing select-none rounded-xl px-4 py-1.5 text-xs font-black shadow-xs transition-all ${
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

                {/* Đoạn văn 2 câu điền vào ô trống */}
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-3">
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
                      className={`inline-flex min-h-[36px] min-w-[120px] items-center justify-center rounded-xl border-2 border-dashed px-3 py-0.5 font-bold text-xs transition-colors cursor-pointer ${
                        ans3.blank1
                          ? 'border-[#2389D8] bg-[#E8F4FF] text-[#2389D8]'
                          : selectedWordToPlace
                          ? 'border-[#FF9850] bg-amber-50/60 animate-pulse'
                          : 'border-slate-300 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {ans3.blank1 ? (
                        <span className="flex items-center gap-1 font-extrabold text-[#2389D8]">
                          {ans3.blank1}
                          {!isAnswerSubmitted && <X className="h-3 w-3 text-slate-400" />}
                        </span>
                      ) : (
                        <span>[ Ô TRỐNG 1 ]</span>
                      )}
                    </div>
                    <span>trong quá trình thực hiện chương trình.</span>
                  </div>

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
                      className={`inline-flex min-h-[36px] min-w-[120px] items-center justify-center rounded-xl border-2 border-dashed px-3 py-0.5 font-bold text-xs transition-colors cursor-pointer ${
                        ans3.blank2
                          ? 'border-[#38C9B1] bg-[#E8FAF6] text-[#127A69]'
                          : selectedWordToPlace
                          ? 'border-[#FF9850] bg-amber-50/60 animate-pulse'
                          : 'border-slate-300 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {ans3.blank2 ? (
                        <span className="flex items-center gap-1 font-extrabold text-[#127A69]">
                          {ans3.blank2}
                          {!isAnswerSubmitted && <X className="h-3 w-3 text-slate-400" />}
                        </span>
                      ) : (
                        <span>[ Ô TRỐNG 2 ]</span>
                      )}
                    </div>
                    <span>trong quá trình thực hiện chương trình.</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========== CÂU 4: HOÀN THIỆN BIỂU THỨC (FILL BLANK) ========== */}
            {currentQ.type === 'fill_blank' && (
              <div className="max-w-2xl mx-auto w-full space-y-3">
                {/* Gợi ý & Mèo Scratch ngang gọn */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#F8FBFF] p-2.5">
                  <ScratchCatAvatar mood="thinking" size={56} className="shrink-0" />
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-600 leading-relaxed">
                    💡 <strong>Nguyên lý:</strong> Để vẽ hình đa giác đều <strong>n cạnh</strong> trong Scratch, góc quay nhân vật bằng <strong>tổng số đo góc một vòng tròn (360°)</strong> chia cho <strong>số cạnh (n)</strong>.
                  </p>
                </div>

                {/* Ô nhập biểu thức */}
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                  <div className="inline-flex items-center justify-center gap-2">
                    <span className="text-sm font-black tracking-tight text-slate-800">GÓC QUAY =</span>
                    <input
                      type="text"
                      disabled={isAnswerSubmitted}
                      value={ans4}
                      onChange={(e) => setAns4(e.target.value)}
                      placeholder="360/n"
                      className="w-40 sm:w-48 rounded-xl border-2 border-[#2389D8] px-3 py-1.5 text-center font-mono text-base font-black text-[#2389D8] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2389D8]/30"
                    />
                  </div>

                  {/* Bàn phím nhanh */}
                  {!isAnswerSubmitted && (
                    <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
                      {['3', '6', '0', '/', 'n', '(', ')'].map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setAns4((prev) => prev + key)}
                          className="h-8 w-9 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs font-black text-slate-700 shadow-2xs hover:bg-[#2389D8] hover:text-white"
                        >
                          {key}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAns4((prev) => prev.slice(0, -1))}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-rose-50 hover:text-rose-600"
                      >
                        ⌫ Xóa
                      </button>
                      <button
                        type="button"
                        onClick={() => setAns4('')}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-rose-50 hover:text-rose-600"
                      >
                        Xóa hết
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========== CÂU 5: GHÉP ĐÔI (MATCHING) ========== */}
            {currentQ.type === 'matching' && currentQ.columnA && currentQ.columnB && (
              <div className="max-w-2xl mx-auto w-full space-y-2">
                <p className="text-[11px] text-slate-500 italic text-center">
                  * Chạm chọn 1 mục ở <strong>Cột A (Phép toán)</strong> rồi chạm tiếp vào mục ở <strong>Cột B (Kiểu dữ liệu)</strong> để nối.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Cột A */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-black uppercase text-[#2389D8]">Cột A – Phép toán</div>
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
                          className={`w-full rounded-xl border p-2 text-left transition-all ${
                            isSelected
                              ? 'border-[#2389D8] bg-[#E8F4FF] ring-2 ring-[#2389D8]/30 shadow-xs'
                              : matchedB
                              ? 'border-emerald-300 bg-emerald-50/60'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#2389D8] text-[10px] font-black text-white">
                              {item.id}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate">{item.text}</p>
                              {matchedBObj && (
                                <p className="text-[10px] font-black text-emerald-700">
                                  ➔ [{matchedBObj.id}] {matchedBObj.text}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Cột B */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-black uppercase text-[#38C9B1]">Cột B – Kiểu dữ liệu</div>
                    {currentQ.columnB.map((item) => {
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
                          className={`w-full rounded-xl border p-2 text-left transition-all ${
                            matchingSelectedA
                              ? 'border-[#FF9850] bg-amber-50/60 hover:bg-amber-100 cursor-pointer animate-pulse'
                              : linkedA
                              ? 'border-emerald-300 bg-emerald-50/60'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#38C9B1] text-[10px] font-black text-white">
                                {item.id}
                              </span>
                              <span className="text-xs font-bold text-slate-800">{item.text}</span>
                            </div>
                            {linkedA && (
                              <span className="rounded bg-emerald-200/60 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-800">
                                [{linkedA}]
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
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-600"
                    >
                      Hủy các ghép nối
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ========== PHẢN HỒI COMPACT TỪ MÈO SCRATCH ========== */}
            {feedback && (
              <div className="mt-2.5 max-w-2xl mx-auto w-full animate-fadeIn">
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
          </div>

          {/* Card Footer: Thanh nút Xác nhận / Tiếp tục (Luôn hiển thị vừa vặn dưới đáy) */}
          <div className="shrink-0 border-t border-slate-100 pt-2.5 flex items-center justify-between gap-2">
            <div>
              {currentIdx > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((i) => i - 1)}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Câu trước</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="btn-3d flex items-center gap-1.5 rounded-xl bg-[#2389D8] px-5 py-2 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-[#1C76BD] disabled:opacity-60 cursor-pointer"
                >
                  <span>XÁC NHẬN</span>
                  <CornerDownLeft className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-3d flex items-center gap-1.5 rounded-xl bg-[#38C9B1] px-5 py-2 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-[#2EB8A1] cursor-pointer"
                >
                  <span>{currentIdx < questions.length - 1 ? 'TIẾP TỤC' : 'HOÀN THÀNH & TỔNG KẾT'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}