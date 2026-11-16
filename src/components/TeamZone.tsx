import { useState } from 'react';
import { ArrowLeft, CheckCircle2, ClipboardList, Cpu, FlaskConical, Search, ShieldCheck, Users } from 'lucide-react';
import { getShortStudentName } from '../services/apiService';
import { AttemptRecord, GradeFeedback, GroupAssignment, StudentProfile, TeamGroup, TeamQuestion } from '../types';
import { DataBotGuide, RobotMood } from './DataBotGuide';

interface TeamZoneProps {
  student: StudentProfile;
  attempts: AttemptRecord[];
  groups: TeamGroup[];
  assignments: GroupAssignment[];
  teamQuestions: TeamQuestion[];
  onBack: () => void;
  onSubmitTeamAnswer: (params: {
    question_id: string;
    question_type: string;
    answer: unknown;
    duration: number;
  }) => Promise<GradeFeedback>;
}

const GROUP_STYLES = [
  { bg: 'bg-[#2389D8]/10', border: 'border-[#2389D8]/30', accent: '#2389D8', Icon: FlaskConical },
  { bg: 'bg-[#FF9850]/10', border: 'border-[#FF9850]/30', accent: '#FF9850', Icon: Cpu },
  { bg: 'bg-[#38C9B1]/10', border: 'border-[#38C9B1]/30', accent: '#38C9B1', Icon: Search },
  { bg: 'bg-[#A88BFA]/10', border: 'border-[#A88BFA]/30', accent: '#A88BFA', Icon: ShieldCheck },
];

export function TeamZone({
  student,
  attempts,
  groups,
  assignments,
  teamQuestions,
  onBack,
  onSubmitTeamAnswer,
}: TeamZoneProps) {
  const shortName = getShortStudentName(student.full_name);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string>(assignments[0]?.assignment_id || '');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [questionFeedback, setQuestionFeedback] = useState<Record<string, GradeFeedback>>({});
  const [submittingQ, setSubmittingQ] = useState<string | null>(null);
  const [botMood, setBotMood] = useState<RobotMood>('happy');
  const [botMessage, setBotMessage] = useState(
    `Chào ${shortName}! Hãy cùng đồng đội thảo luận nhiệm vụ nhóm và trả lời các câu hỏi bên dưới nhé!`
  );

  const passedIds = new Set(attempts.filter((a) => a.is_correct).map((a) => a.question_id));
  const activeQuestions = teamQuestions.filter((q) => q.assignment_id === activeAssignmentId);

  const handleAnswerTeamQ = async (q: TeamQuestion) => {
    const ans = selectedAnswers[q.question_id];
    if (!ans) return;
    setSubmittingQ(q.question_id);
    try {
      const fb = await onSubmitTeamAnswer({
        question_id: q.question_id,
        question_type: q.question_type,
        answer: ans,
        duration: 5,
      });
      setQuestionFeedback((prev) => ({ ...prev, [q.question_id]: fb }));
      if (fb.is_correct) {
        setBotMood('cheering');
        setBotMessage(`Tuyệt vời ${shortName}! Bạn đã hoàn thành câu hỏi nhóm (+${fb.score} điểm)!`);
      } else {
        setBotMood('encourage');
        setBotMessage(`Cố gắng thêm một chút nhé ${shortName}! Hãy thảo luận lại với nhóm mình.`);
      }
    } finally {
      setSubmittingQ(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9FF] pb-12">
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
              <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
                ĐẤU TRƯỜNG ĐỒNG ĐỘI – CÙNG NHAU CHINH PHỤC DỮ LIỆU
              </h1>
              <p className="text-xs text-slate-500">Nhiệm vụ nhóm & Câu hỏi đồng đội do giáo viên cấu hình</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        <DataBotGuide message={botMessage} mood={botMood} compact />

        {/* TOP: Mission Cards (Editable by Teacher) */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#2389D8]" />
            <h2 className="text-lg font-extrabold text-slate-900">Nhiệm vụ đồng đội đang mở</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {assignments.map((asm, idx) => {
              const targetGroup = groups.find((g) => g.group_id === asm.group_id);
              const isSelected = asm.assignment_id === activeAssignmentId;
              const qs = teamQuestions.filter((q) => q.assignment_id === asm.assignment_id);
              const doneCount = qs.filter((q) => passedIds.has(q.question_id)).length;
              return (
                <div
                  key={asm.assignment_id}
                  className={`flex flex-col justify-between rounded-3xl border bg-white p-6 card-3d transition-all ${
                    isSelected ? 'border-[#2389D8] ring-4 ring-[#2389D8]/10' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                      <span className="text-[#2389D8]">
                        NHIỆM VỤ {idx + 1} · {targetGroup ? targetGroup.group_name : asm.group_id}
                      </span>
                      <span className="text-slate-500 tabular-nums">Điểm tối đa: {asm.max_score}đ</span>
                    </div>
                    <h3 className="mt-2 text-xl font-extrabold text-slate-900">{asm.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{asm.description}</p>

                    {asm.questions.length > 0 && (
                      <ul className="mt-3 space-y-1.5 rounded-2xl bg-[#F8FBFF] p-3.5 text-xs font-semibold text-slate-700">
                        {asm.questions.map((req, rIdx) => (
                          <li key={rIdx}>• {req}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-bold text-slate-500">
                      Trạng thái: {asm.status} · {doneCount}/{qs.length} câu hỏi
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveAssignmentId(asm.assignment_id)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold ${
                        isSelected
                          ? 'bg-[#2389D8] text-white'
                          : 'bg-[#2389D8]/10 text-[#2389D8] hover:bg-[#2389D8]/20'
                      }`}
                    >
                      {isSelected ? 'Đang mở câu hỏi' : 'Thực hiện nhiệm vụ'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Team Question Bank Section */}
        {activeQuestions.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 card-3d">
            <h3 className="text-base font-extrabold text-slate-900">
              Trả lời câu hỏi nhiệm vụ ({assignments.find((a) => a.assignment_id === activeAssignmentId)?.title})
            </h3>
            <div className="mt-4 space-y-4">
              {activeQuestions.map((q) => {
                const fb = questionFeedback[q.question_id];
                const solved = passedIds.has(q.question_id);
                return (
                  <div key={q.question_id} className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900">{q.question_text}</p>
                      <span className="text-xs font-bold text-[#2389D8] tabular-nums">
                        {solved ? '✓ Đã đạt điểm' : `${q.points} điểm`}
                      </span>
                    </div>

                    {q.options.length > 0 ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setSelectedAnswers((prev) => ({ ...prev, [q.question_id]: opt }))
                            }
                            className={`rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors ${
                              selectedAnswers[q.question_id] === opt
                                ? 'border-[#2389D8] bg-[#2389D8] text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nhập câu trả lời của nhóm..."
                        value={selectedAnswers[q.question_id] || ''}
                        onChange={(e) =>
                          setSelectedAnswers((prev) => ({ ...prev, [q.question_id]: e.target.value }))
                        }
                        className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                      />
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        disabled={!selectedAnswers[q.question_id] || submittingQ === q.question_id}
                        onClick={() => handleAnswerTeamQ(q)}
                        className="rounded-xl bg-[#38C9B1] px-4 py-2 text-xs font-bold text-white hover:bg-[#2EB7A0] disabled:opacity-50"
                      >
                        {submittingQ === q.question_id ? 'Đang kiểm tra...' : 'Gửi đáp án nhóm'}
                      </button>

                      {fb && (
                        <span
                          className={`text-xs font-bold ${
                            fb.is_correct ? 'text-[#127A69]' : 'text-amber-700'
                          }`}
                        >
                          {fb.is_correct ? `Chính xác (+${fb.score}đ): ` : 'Chưa đúng: '}
                          {fb.explanation}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* BOTTOM: 4 Group Cards */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#FF8EAA]" />
            <h2 className="text-lg font-extrabold text-slate-900">Bốn khu vực nhóm thám hiểm</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {groups.map((grp, idx) => {
              const st = GROUP_STYLES[idx % GROUP_STYLES.length];
              const IconComp = st.Icon;
              const grpAssignment = assignments.find((a) => a.group_id === grp.group_id);
              const isMember = grp.members.some((m) => m.student_id === student.student_id);

              return (
                <div
                  key={grp.group_id}
                  className={`flex flex-col justify-between rounded-3xl border ${st.border} bg-white p-5 card-3d`}
                >
                  <div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${st.bg}`}>
                      <IconComp className="h-6 w-6" style={{ color: st.accent }} />
                    </div>

                    <h3 className="mt-3 text-sm font-extrabold text-slate-900">{grp.group_name}</h3>
                    {isMember && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#127A69]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Nhóm của bạn</span>
                      </p>
                    )}

                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs">
                      <p className="font-bold text-slate-600">Nhiệm vụ được giao:</p>
                      <p className="mt-0.5 font-semibold text-slate-800">
                        {grpAssignment ? grpAssignment.title : 'Chưa giao nhiệm vụ riêng'}
                      </p>
                      <p className="mt-1 text-slate-500">
                        Trạng thái: {grpAssignment ? grpAssignment.status : 'Chờ phân công'}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-bold text-slate-600">
                        Thành viên ({grp.members.length}):
                      </p>
                      {grp.members.length === 0 ? (
                        <p className="mt-1 text-xs italic text-slate-400">
                          Giáo viên chưa phân học sinh vào nhóm này
                        </p>
                      ) : (
                        <ul className="mt-1.5 space-y-1 text-xs font-semibold text-slate-700">
                          {grp.members.map((m) => (
                            <li key={m.student_id} className="flex justify-between">
                              <span className="truncate">{m.display_name}</span>
                              <span className="font-mono text-slate-500 tabular-nums">{m.total_score}đ</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-extrabold">
                    <span className="text-slate-500">Điểm nhóm</span>
                    <span className="font-mono text-base tabular-nums" style={{ color: st.accent }}>
                      {grp.group_score}đ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
