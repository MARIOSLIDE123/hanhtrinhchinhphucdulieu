import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, RotateCw, Zap } from 'lucide-react';
import { FLASHCARDS, MIND_MAP_BRANCHES, QUICK_REVIEW_QUESTIONS } from '../data/lessonData';
import { getShortStudentName } from '../services/apiService';
import { StudentProfile } from '../types';
import { DataBotGuide, RobotMood } from './DataBotGuide';

interface ReviewZoneProps {
  student: StudentProfile;
  onBack: () => void;
}

export function ReviewZone({ student, onBack }: ReviewZoneProps) {
  const shortName = getShortStudentName(student.full_name);
  const [selectedBranch, setSelectedBranch] = useState(MIND_MAP_BRANCHES[0].id);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quick Review modal state
  const [quickQuizOpen, setQuickQuizOpen] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [botMood, setBotMood] = useState<RobotMood>('happy');
  const [botMessage, setBotMessage] = useState(
    `Chạm vào từng nhánh trên bản đồ tư duy hoặc lật thẻ ghi nhớ để ôn lại kiến thức Bài 13 nhé ${shortName}!`
  );

  const currentBranch = MIND_MAP_BRANCHES.find((b) => b.id === selectedBranch) || MIND_MAP_BRANCHES[0];
  const currentCard = FLASHCARDS[cardIndex];
  const currentQuickQ = QUICK_REVIEW_QUESTIONS[quizIndex];

  const openRandomQuickReview = () => {
    const nextIdx = Math.floor(Math.random() * QUICK_REVIEW_QUESTIONS.length);
    setQuizIndex(nextIdx);
    setSelectedOpt(null);
    setQuickQuizOpen(true);
  };

  const handleAnswerQuick = (opt: string) => {
    setSelectedOpt(opt);
    if (opt === currentQuickQ.correct) {
      setBotMood('cheering');
      setBotMessage(`Tuyệt vời ${shortName}! Bạn đã trả lời chính xác!`);
    } else {
      setBotMood('encourage');
      setBotMessage(`Cố gắng thêm một chút nhé ${shortName}!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9FF] pb-10">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Bản đồ</span>
            </button>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">Khu vực 2 · Ôn tập kiến thức</h1>
              <p className="text-xs text-slate-500">Bản đồ tư duy · Thẻ ghi nhớ 3D · Ôn tập nhanh</p>
            </div>
          </div>

          <button
            type="button"
            onClick={openRandomQuickReview}
            className="btn-3d flex items-center gap-2 rounded-2xl bg-[#FF9850] px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_0_#C86420] hover:bg-[#F0863B]"
          >
            <Zap className="h-4 w-4" />
            <span>ÔN TẬP NHANH</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        <DataBotGuide message={botMessage} mood={botMood} compact />

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left: Interactive Mind Map */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 card-3d lg:col-span-7">
            <h2 className="text-base font-extrabold text-slate-900">Bản đồ tư duy · Bài 13: Biểu diễn dữ liệu</h2>
            <p className="text-xs text-slate-500">Chọn một nhánh kiến thức để xem chi tiết.</p>

            {/* Central Node */}
            <div className="mt-5 flex flex-col items-center">
              <div className="rounded-2xl bg-gradient-to-r from-[#2389D8] to-[#38C9B1] px-6 py-3 text-center text-sm font-extrabold text-white shadow-md">
                BÀI 13: BIỂU DIỄN DỮ LIỆU
              </div>

              <div className="mt-5 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {MIND_MAP_BRANCHES.map((branch) => {
                  const active = branch.id === selectedBranch;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => {
                        setSelectedBranch(branch.id);
                        setBotMood('thinking');
                        setBotMessage(`Đang ôn nhánh "${branch.title}": ${branch.points[0]}`);
                      }}
                      className={`rounded-2xl border p-3.5 text-left transition-all ${
                        active
                          ? 'border-[#2389D8] bg-[#F4F9FF] ring-2 ring-[#2389D8]/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-extrabold" style={{ color: branch.color }}>
                        {branch.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{branch.points[0]}</p>
                    </button>
                  );
                })}
              </div>

              {/* Active Branch Detail Panel */}
              <div className="mt-5 w-full rounded-2xl border border-slate-200 bg-[#F8FBFF] p-5">
                <h3 className="text-sm font-extrabold" style={{ color: currentBranch.color }}>
                  {currentBranch.title}
                </h3>
                <ul className="mt-2.5 space-y-2 text-sm font-medium text-slate-700">
                  {currentBranch.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2">
                      <span style={{ color: currentBranch.color }}>•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Right: 3D Flip Flashcards */}
          <section className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 card-3d lg:col-span-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900">Thẻ ghi nhớ</h2>
                <span className="text-xs font-bold text-slate-500 tabular-nums">
                  Thẻ {cardIndex + 1}/{FLASHCARDS.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">Chạm vào thẻ để lật xem khái niệm và ví dụ.</p>

              <div className="perspective-1000 mt-5">
                <button
                  type="button"
                  onClick={() => setIsFlipped((f) => !f)}
                  className={`transform-style-3d relative h-72 w-full transition-transform duration-500 ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front */}
                  <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-[#2389D8]/25 bg-gradient-to-br from-[#EAF4FF] to-white p-6 text-center shadow-sm">
                    <span className="text-xs font-bold text-[#2389D8]">{currentCard.category}</span>
                    <h3 className="mt-3 text-2xl font-extrabold text-slate-900">{currentCard.term}</h3>
                    <span className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>Chạm để lật xem định nghĩa</span>
                    </span>
                  </div>

                  {/* Back */}
                  <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-[#38C9B1]/35 bg-gradient-to-br from-[#E7FAF6] to-white p-6 text-center shadow-sm">
                    <span className="text-xs font-bold text-[#127A69]">{currentCard.term}</span>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-800">
                      {currentCard.definition}
                    </p>
                    <p className="mt-3 rounded-xl bg-white px-3 py-2 font-mono text-xs font-bold text-[#2389D8]">
                      {currentCard.example}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex((i) => (i - 1 + FLASHCARDS.length) % FLASHCARDS.length);
                }}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Thẻ trước</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFlipped((f) => !f)}
                className="rounded-xl bg-[#2389D8]/10 px-4 py-2.5 text-xs font-bold text-[#2389D8] hover:bg-[#2389D8]/20"
              >
                Lật thẻ
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex((i) => (i + 1) % FLASHCARDS.length);
                }}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <span>Thẻ sau</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Modal ÔN TẬP NHANH */}
      {quickQuizOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Ôn tập nhanh</h3>
              <button
                type="button"
                onClick={() => setQuickQuizOpen(false)}
                className="rounded-xl px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>

            <p className="mt-4 text-base font-bold text-slate-800">{currentQuickQ.q}</p>

            <div className="mt-4 space-y-2.5">
              {currentQuickQ.options.map((opt) => {
                const picked = selectedOpt === opt;
                const isCorrect = opt === currentQuickQ.correct;
                let style = 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
                if (selectedOpt) {
                  if (isCorrect) style = 'border-[#38C9B1] bg-[#38C9B1]/15 text-[#127A69]';
                  else if (picked) style = 'border-rose-400 bg-rose-50 text-rose-800';
                }
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={Boolean(selectedOpt)}
                    onClick={() => handleAnswerQuick(opt)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-colors ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedOpt && (
              <div className="mt-4 rounded-2xl bg-[#F4F9FF] p-4 text-sm font-medium text-slate-700">
                {currentQuickQ.explanation}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={openRandomQuickReview}
                className="flex items-center gap-1.5 rounded-xl bg-[#2389D8] px-4 py-2.5 text-xs font-bold text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Câu khác</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
