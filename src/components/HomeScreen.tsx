import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Compass,
  LogOut,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
  Trophy,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { getShortStudentName } from '../services/apiService';
import { soundService } from '../services/soundService';
import {
  AppConfig,
  AttemptRecord,
  BadgeInfo,
  ConnectionMode,
  StudentProfile,
  VanDungQuestion,
  ZoneId,
} from '../types';
import { ScratchCatGuide } from './ScratchCatGuide';

interface HomeScreenProps {
  student: StudentProfile;
  attempts: AttemptRecord[];
  badges: BadgeInfo[];
  progressPercent: number;
  appConfig: AppConfig;
  connectionMode: ConnectionMode;
  questions: VanDungQuestion[];
  onSelectZone: (zone: ZoneId) => void;
  onOpenTeacher: () => void;
  onOpenProfile: () => void;
  onSwitchStudent: () => void;
}

export function HomeScreen({
  student,
  attempts,
  badges,
  progressPercent,
  appConfig,
  connectionMode,
  questions,
  onSelectZone,
  onOpenTeacher,
  onOpenProfile,
  onSwitchStudent,
}: HomeScreenProps) {
  const shortName = getShortStudentName(student.full_name);
  const unlockedBadges = badges.filter((b) => b.unlocked);

  // Fullscreen & Sound state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.getIsMuted());

  const toggleMute = () => {
    const next = soundService.toggleMute();
    setIsMuted(next);
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

  // Điểm tốt nhất từng câu
  const bestScores: Record<string, { score: number; is_correct: boolean }> = {};
  attempts.forEach((att) => {
    if (!bestScores[att.question_id] || att.score > bestScores[att.question_id].score) {
      bestScores[att.question_id] = { score: att.score, is_correct: att.is_correct };
    } else if (att.is_correct) {
      bestScores[att.question_id].is_correct = true;
    }
  });

  const completedCount = questions.filter(
    (q) => bestScores[q.id]?.is_correct || (bestScores[q.id]?.score || 0) > 0
  ).length;

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col bg-gradient-to-b from-[#EBF5FF] via-[#F4F9FF] to-[#E5F1FC] select-none">
      {/* 1. TOP HEADER (COMPACT 16:9) */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md shrink-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2389D8] text-white shadow-2xs">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-[#2389D8]">
                DATA ADVENTURE
              </span>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                {appConfig.grade_level} · {appConfig.lesson_title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Điểm số */}
            <div className="flex items-center gap-1 rounded-xl bg-[#FFD34F]/25 px-2.5 py-1 text-xs font-extrabold text-amber-900 shadow-2xs tabular-nums">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{student.total_score} đ</span>
            </div>

            {/* Âm thanh */}
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-[#2389D8] hover:text-[#2389D8] shadow-2xs cursor-pointer"
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-500" /> : <Volume2 className="h-3.5 w-3.5 text-[#2389D8]" />}
            </button>

            {/* Bật toàn màn hình */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình 16:9'}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-[#2389D8] hover:text-[#2389D8] shadow-2xs"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>

            {/* Bảng xếp hạng */}
            <button
              type="button"
              onClick={() => onSelectZone('leaderboard')}
              className="btn-3d flex items-center gap-1 rounded-xl bg-[#2389D8] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1D78BF] cursor-pointer"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bảng xếp hạng</span>
            </button>

            {/* Hồ sơ cá nhân */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-[#2389D8] shadow-2xs cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-[#2389D8]" />
              <span className="hidden md:inline max-w-[80px] truncate">{student.full_name}</span>
            </button>

            {/* Đổi học sinh */}
            <button
              type="button"
              onClick={onSwitchStudent}
              title="Đổi tài khoản học sinh"
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              <span className="hidden lg:inline text-[11px]">Đổi bạn</span>
            </button>

            {/* Cài đặt Giáo viên */}
            <button
              type="button"
              onClick={onOpenTeacher}
              aria-label="Cài đặt Giáo viên"
              title="Cài đặt Giáo viên"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-[#2389D8] hover:text-[#2389D8] cursor-pointer shadow-2xs"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER (TỐI ƯU KHUNG HÌNH 16:9) */}
      <main className="flex-1 min-h-0 flex flex-col justify-between max-w-6xl w-full mx-auto px-3 py-3 sm:px-6 overflow-y-auto lg:overflow-hidden">
        {/* Lời chào từ Mèo Scratch (Compact) */}
        <div className="shrink-0 mb-3">
          <ScratchCatGuide
            mood="happy"
            message={`Xin chào ${shortName}! Chào mừng bạn đến với DATA ADVENTURE (Bài 13: Biểu diễn dữ liệu). Hãy cùng Mèo Scratch chinh phục hành trình 5 thử thách tương tác và ghi tên mình lên bảng xếp hạng toàn quốc nhé!`}
          />
        </div>

        {/* 3. TRUNG TÂM: VẬN DỤNG – CHINH PHỤC 5 THỬ THÁCH */}
        <section className="flex-1 min-h-0 flex flex-col justify-center">
          <div className="relative overflow-hidden rounded-3xl border border-[#2389D8]/30 bg-gradient-to-br from-white via-[#F0F8FF] to-[#E6F3FF] p-4 sm:p-6 lg:p-7 shadow-xl card-3d">
            {/* Background decoration */}
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#FFD34F]/15 blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-[#2389D8]/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 grid gap-5 lg:grid-cols-12 items-center">
              {/* Left Column: Info & Action */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#2389D8] px-3 py-0.5 text-[11px] font-black text-white shadow-2xs">
                  <Sparkles className="h-3 w-3" />
                  <span>KHU VỰC TRỌNG TÂM DUY NHẤT</span>
                </div>

                <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  VẬN DỤNG – CHINH PHỤC 5 THỬ THÁCH
                </h1>
                <p className="mt-1 text-xs sm:text-sm font-semibold leading-relaxed text-slate-600">
                  Hành trình 5 thử thách tương tác đa dạng bám sát SGK Bài 13: Biểu diễn dữ liệu. Thử thách kiến thức về kiểu dữ liệu, hằng, biến và biểu thức Scratch!
                </p>

                {/* Progress Bar inside Card */}
                <div className="mt-3.5 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-slate-700">Tiến trình hoàn thành:</span>
                    <span className="text-[#2389D8] tabular-nums font-black text-xs sm:text-sm">
                      {completedCount}/5 thử thách ({progressPercent}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2389D8] via-[#38C9B1] to-[#FFD34F] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Tổng điểm tích lũy:</span>
                    <span className="font-extrabold text-amber-700 tabular-nums">
                      {student.total_score} / 100 điểm
                    </span>
                  </div>
                </div>

                {/* Big Button: Start / Continue */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectZone('vandung')}
                    className="btn-3d flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#2389D8] to-[#1E7BC4] px-6 py-3 text-sm font-black text-white shadow-lg hover:from-[#1E7BC4] hover:to-[#17629E] transition-transform duration-150 hover:scale-[1.02] cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-white text-white" />
                    <span>
                      {completedCount === 0
                        ? 'BẮT ĐẦU CHINH PHỤC NGAY'
                        : completedCount === 5
                        ? 'XEM LẠI BÀI LÀM & ĐIỂM SỐ'
                        : 'TIẾP TỤC HÀNH TRÌNH'}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Tự động chấm điểm & xếp hạng</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Journey Preview of 5 challenges */}
              <div className="lg:col-span-5 space-y-1.5">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Danh sách 5 chặng thử thách:
                </p>
                {questions.map((q, idx) => {
                  const res = bestScores[q.id];
                  const isDone = res?.is_correct || (res?.score || 0) > 0;

                  return (
                    <div
                      key={q.id}
                      onClick={() => onSelectZone('vandung')}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-2 transition-all duration-150 card-3d ${
                        isDone
                          ? 'border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/70'
                          : 'border-slate-200/90 bg-white/90 hover:border-[#2389D8]/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                            isDone ? 'bg-emerald-600 text-white' : 'bg-[#2389D8]/10 text-[#2389D8]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{q.title}</p>
                          <p className="text-[10px] font-semibold text-slate-500">{q.typeLabel}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isDone ? (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{res?.score || 0}đ</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">20đ</span>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 4. FOOTER STATS & BADGES (COMPACT 16:9) */}
        <section className="shrink-0 mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-600">Huy hiệu đạt được:</span>
            <div className="flex items-center gap-1.5">
              {unlockedBadges.map((b) => (
                <span
                  key={b.id}
                  title={`${b.title}: ${b.description}`}
                  className="rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-2xs flex items-center gap-1"
                >
                  <Award className="h-3 w-3 text-amber-500" />
                  <span>{b.title}</span>
                </span>
              ))}
              {unlockedBadges.length === 0 && (
                <span className="text-slate-400 text-xs italic">Chưa mở khóa</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-mono text-[11px]">Học sinh: {student.student_id}</span>
            <span>·</span>
            <span className="text-[11px] font-semibold">{student.school}</span>
          </div>
        </section>
      </main>
    </div>
  );
}