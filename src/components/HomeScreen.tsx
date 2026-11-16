import React from 'react';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Compass,
  LogOut,
  Play,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
  Trophy,
  User,
} from 'lucide-react';
import { getShortStudentName } from '../services/apiService';
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
    <div className="min-h-screen bg-[#F4F9FF] pb-12">
      {/* 1. TOP HEADER */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2389D8] text-white shadow-sm">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-[#2389D8] whitespace-nowrap">
                DATA ADVENTURE
              </span>
              <p className="text-xs font-medium text-slate-500">
                {appConfig.grade_level} · {appConfig.lesson_title}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Điểm số */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-[#FFD34F]/25 px-3.5 py-1.5 text-xs font-extrabold text-amber-900 shadow-xs tabular-nums">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>{student.total_score} điểm</span>
            </div>

            {/* Bảng xếp hạng */}
            <button
              type="button"
              onClick={() => onSelectZone('leaderboard')}
              className="btn-3d flex items-center gap-1.5 rounded-2xl bg-[#2389D8] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1D78BF] whitespace-nowrap"
            >
              <Trophy className="h-4 w-4" />
              <span>Bảng xếp hạng</span>
            </button>

            {/* Hồ sơ cá nhân */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#2389D8] whitespace-nowrap"
            >
              <User className="h-4 w-4 text-[#2389D8]" />
              <span className="hidden sm:inline">Hồ sơ</span>
            </button>

            {/* Đổi học sinh */}
            <button
              type="button"
              onClick={onSwitchStudent}
              title="Đổi tài khoản học sinh"
              className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Đổi bạn</span>
            </button>

            {/* Cài đặt Giáo viên */}
            <button
              type="button"
              onClick={onOpenTeacher}
              aria-label="Cài đặt Giáo viên"
              title="Cài đặt Giáo viên"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:border-[#2389D8] hover:text-[#2389D8]"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {/* Lời chào từ Mèo Scratch */}
        <ScratchCatGuide
          mood="happy"
          message={`Xin chào ${shortName}! Chào mừng bạn đến với DATA ADVENTURE (Bài 13: Biểu diễn dữ liệu). Hãy cùng Mèo Scratch chinh phục hành trình 5 thử thách tương tác và ghi tên mình lên bảng xếp hạng toàn quốc nhé!`}
        />

        {/* ============================================================== */}
        {/* 3. CHỨC NĂNG DUY NHẤT TRUNG TÂM: VẬN DỤNG – CHINH PHỤC 5 THỬ THÁCH */}
        {/* ============================================================== */}
        <section className="mt-6">
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#2389D8]/30 bg-gradient-to-br from-white via-[#F0F8FF] to-[#E6F3FF] p-6 shadow-xl card-3d sm:p-10">
            {/* Background decoration */}
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#FFD34F]/15 blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-[#2389D8]/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
              {/* Left Column: Info & Action */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#2389D8] px-3.5 py-1 text-xs font-black text-white shadow-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>KHU VỰC TRỌNG TÂM DUY NHẤT</span>
                </div>

                <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  VẬN DỤNG – CHINH PHỤC 5 THỬ THÁCH
                </h1>
                <p className="mt-2 text-sm sm:text-base font-semibold leading-relaxed text-slate-600">
                  Hành trình 5 thử thách tương tác đa dạng bám sát SGK Bài 13: Biểu diễn dữ liệu. Thử thách kiến thức về kiểu dữ liệu, hằng, biến và biểu thức Scratch!
                </p>

                {/* Progress Bar inside Card */}
                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-slate-700">Tiến trình hoàn thành:</span>
                    <span className="text-[#2389D8] tabular-nums font-black text-sm">
                      {completedCount}/5 thử thách ({progressPercent}%)
                    </span>
                  </div>
                  <div className="mt-2.5 h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2389D8] via-[#38C9B1] to-[#FFD34F] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Tổng điểm tích lũy:</span>
                    <span className="font-extrabold text-amber-700 tabular-nums">
                      {student.total_score} / 100 điểm
                    </span>
                  </div>
                </div>

                {/* Big Button: Start / Continue */}
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onSelectZone('vandung')}
                    className="btn-3d flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#2389D8] to-[#1E7BC4] px-8 py-4 text-base font-black text-white shadow-lg hover:from-[#1E7BC4] hover:to-[#17629E] transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <Play className="h-5 w-5 fill-white text-white" />
                    <span>
                      {completedCount === 0
                        ? 'BẮT ĐẦU CHINH PHỤC NGAY'
                        : completedCount === 5
                        ? 'LUYỆN TẬP LẠI (NÂNG ĐIỂM)'
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
              <div className="lg:col-span-5 space-y-2.5">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Danh sách 5 chặng thử thách:
                </p>
                {questions.map((q, idx) => {
                  const res = bestScores[q.id];
                  const isDone = res?.is_correct || (res?.score || 0) > 0;

                  return (
                    <div
                      key={q.id}
                      onClick={() => onSelectZone('vandung')}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3 transition-all duration-200 card-3d ${
                        isDone
                          ? 'border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/70'
                          : 'border-slate-200/90 bg-white/90 hover:border-[#2389D8]/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                            isDone ? 'bg-emerald-600 text-white' : 'bg-[#2389D8]/10 text-[#2389D8]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-extrabold text-slate-900">{q.title}</p>
                          <p className="text-[11px] font-semibold text-slate-500">{q.typeLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <span className="font-mono text-xs font-black text-emerald-700">
                            {res?.score}/{q.points} đ
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">{q.points} đ</span>
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 4. 2 CHỨC NĂNG BỔ TRỢ: BẢNG XẾP HẠNG & HỒ SƠ CÁ NHÂN */}
        {/* ============================================================== */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {/* Card 1: Bảng Xếp Hạng */}
          <div
            onClick={() => onSelectZone('leaderboard')}
            className="group cursor-pointer flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 card-3d shadow-sm hover:border-[#2389D8] transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A88BFA]/15 text-[#6D3ECF]">
                  <Trophy className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-extrabold text-purple-800">
                  Toàn quốc
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900 group-hover:text-[#2389D8]">
                BẢNG XẾP HẠNG TOÀN QUỐC
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                So tài điểm số và độ chính xác với các bạn học sinh trên toàn quốc. Xem TOP 10, TOP 50 và vị trí thứ hạng của bạn!
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-[#2389D8]">
              <span>Khám phá bảng vàng</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 2: Hồ Sơ Cá Nhân & Huy Hiệu */}
          <div
            onClick={onOpenProfile}
            className="group cursor-pointer flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 card-3d shadow-sm hover:border-[#FF9850] transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF9850]/15 text-[#D96B00]">
                  <Award className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800 tabular-nums">
                  {unlockedBadges.length}/{badges.length} huy hiệu
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900 group-hover:text-[#FF9850]">
                HỒ SƠ CÁ NHÂN & HUY HIỆU
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Xem lại hồ sơ học tập của <strong>{student.full_name}</strong>, chi tiết điểm số 5 thử thách và danh sách các huy hiệu đã mở khóa.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-[#FF9850]">
              <span>Mở hồ sơ cá nhân</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
