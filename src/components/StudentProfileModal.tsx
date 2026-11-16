import React from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  LogOut,
  Sparkles,
  Star,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { AttemptRecord, BadgeInfo, StudentProfile, VanDungQuestion } from '../types';
import { ScratchCatAvatar } from './ScratchCatGuide';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  attempts: AttemptRecord[];
  badges: BadgeInfo[];
  questions: VanDungQuestion[];
  onSwitchStudent: () => void;
}

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
  attempts,
  badges,
  questions,
  onSwitchStudent,
}: StudentProfileModalProps) {
  if (!isOpen) return null;

  // Lấy kết quả tốt nhất của từng câu
  const bestScores: Record<string, { score: number; is_correct: boolean }> = {};
  attempts.forEach((att) => {
    if (!bestScores[att.question_id] || att.score > bestScores[att.question_id].score) {
      bestScores[att.question_id] = { score: att.score, is_correct: att.is_correct };
    } else if (att.is_correct) {
      bestScores[att.question_id].is_correct = true;
    }
  });

  const correctCount = questions.filter((q) => bestScores[q.id]?.is_correct).length;
  const unlockedBadges = badges.filter((b) => b.unlocked);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2389D8]/10 text-[#2389D8]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Hồ Sơ Học Sinh</h2>
              <p className="text-xs text-slate-500">Mã học sinh: {student.student_id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Profile Summary Card */}
          <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-[#F0F8FF] to-[#F8FBFF] p-5">
            <ScratchCatAvatar mood={student.total_score >= 100 ? 'cheering' : 'happy'} size={72} />
            <div className="text-center sm:text-left min-w-0 flex-1">
              <h3 className="text-lg font-black text-slate-900 truncate">{student.full_name}</h3>
              <p className="text-xs font-semibold text-slate-600">
                {student.school} · Lớp <span className="font-extrabold text-[#2389D8]">{student.class_name}</span>
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 rounded-xl bg-[#FFD34F]/30 px-3 py-1 text-xs font-extrabold text-amber-900 tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {student.total_score}/100 điểm
                </span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 tabular-nums">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {correctCount}/5 câu đúng
                </span>
              </div>
            </div>
          </div>

          {/* 5 Thử thách Breakdown */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              Tiến độ 5 thử thách Vận dụng
            </h4>
            <div className="space-y-2 rounded-2xl border border-slate-200 p-3">
              {questions.map((q) => {
                const res = bestScores[q.id];
                const sc = res?.score || 0;
                const isOk = res?.is_correct;

                return (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50/70 p-3 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                          isOk
                            ? 'bg-emerald-600 text-white'
                            : sc > 0
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {q.index}
                      </span>
                      <span className="font-bold text-slate-800">{q.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900">
                        {sc}/{q.points} đ
                      </span>
                      {isOk && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Huy hiệu */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Bộ sưu tập huy hiệu ({unlockedBadges.length}/{badges.length})
              </h4>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`flex items-start gap-3 rounded-2xl border p-3 ${
                    b.unlocked
                      ? 'border-slate-200 bg-white shadow-xs'
                      : 'border-slate-100 bg-slate-50/50 opacity-50'
                  }`}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${b.color}15`, color: b.color }}
                  >
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-900">{b.title}</p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{b.description}</p>
                    <span className="mt-1 inline-block text-[10px] font-bold" style={{ color: b.color }}>
                      {b.unlocked ? '✓ Đã mở khóa' : 'Chưa mở khóa'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchStudent();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Đổi tài khoản học sinh</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#2389D8] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1D78BF]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
