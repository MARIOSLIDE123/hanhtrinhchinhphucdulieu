import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  History,
  Send,
  XCircle,
} from 'lucide-react';
import { CHALLENGE_QUESTIONS } from '../data/lessonData';
import { getShortStudentName } from '../services/apiService';
import { AttemptRecord, ChallengeQuestion, GradeFeedback, StudentProfile } from '../types';
import { DataBotGuide, RobotMood } from './DataBotGuide';

interface ChallengeZoneProps {
  student: StudentProfile;
  attempts: AttemptRecord[];
  onBack: () => void;
  onSubmitChallenge: (params: {
    question_id: string;
    question_type: string;
    answer: unknown;
    duration: number;
  }) => Promise<GradeFeedback>;
}

export function ChallengeZone({
  student,
  attempts,
  onBack,
  onSubmitChallenge,
}: ChallengeZoneProps) {
  const shortName = getShortStudentName(student.full_name);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<GradeFeedback | null>(null);
  const [startTime, setStartTime] = useState(() => Date.now());

  const [botMood, setBotMood] = useState<RobotMood>('happy');
  const [botMessage, setBotMessage] = useState(
    `Hãy hoàn thành các câu hỏi SGK và 5 thử thách mở rộng để tích lũy điểm nhé ${shortName}!`
  );

  // Per-question answer states
  const [singleVal, setSingleVal] = useState<string>('');
  const [multiVal, setMultiVal] = useState<string[]>([]);
  const [mapVal, setMapVal] = useState<Record<string, string>>({});
  const [selectedDragToken, setSelectedDragToken] = useState<string | null>(null);

  // A2 table state
  const [a2State, setA2State] = useState({
    c1: '',
    c2_val: '',
    c2_type: '',
    c3_val: '',
    c3_type: '',
  });

  // C_EXPR table state
  const [cExprState, setCExprState] = useState({
    a_val: '',
    a_type: '',
    b_val: '',
    b_type: '',
    c_val: '',
    c_type: '',
  });

  // C8 Circle practice state
  const [circleR, setCircleR] = useState<string>('5');
  const [circleC, setCircleC] = useState<string>('');
  const [circleS, setCircleS] = useState<string>('');
  const [circleErr, setCircleErr] = useState<string>('');

  // EXT_4 Fill blanks state
  const [blank1, setBlank1] = useState('');
  const [blank2, setBlank2] = useState('');

  const question: ChallengeQuestion = CHALLENGE_QUESTIONS[currentIdx];

  const passedIds = useMemo(
    () => new Set(attempts.filter((a) => a.is_correct).map((a) => a.question_id)),
    [attempts]
  );

  const resetInputs = () => {
    setFeedback(null);
    setSingleVal('');
    setMultiVal([]);
    setMapVal({});
    setSelectedDragToken(null);
    setA2State({ c1: '', c2_val: '', c2_type: '', c3_val: '', c3_type: '' });
    setCExprState({ a_val: '', a_type: '', b_val: '', b_type: '', c_val: '', c_type: '' });
    setCircleR('5');
    setCircleC('');
    setCircleS('');
    setCircleErr('');
    setBlank1('');
    setBlank2('');
    setStartTime(Date.now());
  };

  useEffect(() => {
    resetInputs();
  }, [currentIdx]);

  const buildAnswerPayload = (): { valid: boolean; payload: unknown; validationMsg?: string } => {
    switch (question.type) {
      case 'single_choice':
        if (!singleVal) return { valid: false, payload: null, validationMsg: 'Vui lòng chọn một đáp án.' };
        return { valid: true, payload: singleVal };
      case 'multi_choice':
        if (multiVal.length === 0)
          return { valid: false, payload: null, validationMsg: 'Vui lòng chọn ít nhất một đáp án.' };
        return { valid: true, payload: multiVal };
      case 'matching': {
        const leftItems = question.matchLeft || [];
        if (leftItems.some((item) => !mapVal[item])) {
          return { valid: false, payload: null, validationMsg: 'Vui lòng ghép đủ tất cả các mục.' };
        }
        return { valid: true, payload: mapVal };
      }
      case 'drag_drop': {
        const items = question.dragItems || [];
        if (items.some((item) => !mapVal[item])) {
          return {
            valid: false,
            payload: null,
            validationMsg: 'Vui lòng phân loại đầy đủ tất cả các giá trị vào nhóm.',
          };
        }
        return { valid: true, payload: mapVal };
      }
      case 'expression_table':
        if (question.id === 'SGK_A2') {
          if (!a2State.c1 || !a2State.c2_val || !a2State.c2_type || !a2State.c3_val || !a2State.c3_type) {
            return { valid: false, payload: null, validationMsg: 'Vui lòng điền đủ kết quả và kiểu dữ liệu.' };
          }
          return { valid: true, payload: a2State };
        }
        if (
          !cExprState.a_val ||
          !cExprState.a_type ||
          !cExprState.b_val ||
          !cExprState.b_type ||
          !cExprState.c_val ||
          !cExprState.c_type
        ) {
          return { valid: false, payload: null, validationMsg: 'Vui lòng điền đủ kết quả và kiểu dữ liệu cho a, b, c.' };
        }
        return { valid: true, payload: cExprState };
      case 'circle_practice': {
        const rNum = Number(circleR);
        const cNum = Number(circleC);
        const sNum = Number(circleS);
        if (circleR.trim() === '' || isNaN(rNum) || rNum < 0) {
          return {
            valid: false,
            payload: null,
            validationMsg: 'Bán kính r phải là số hợp lệ và không âm (r ≥ 0).',
          };
        }
        if (circleC.trim() === '' || isNaN(cNum) || circleS.trim() === '' || isNaN(sNum)) {
          return {
            valid: false,
            payload: null,
            validationMsg: 'Vui lòng nhập kết quả Chu vi (C) và Diện tích (S) hợp lệ.',
          };
        }
        return { valid: true, payload: { r: rNum, c: cNum, s: sNum } };
      }
      case 'fill_blank':
        if (!blank1.trim() || !blank2.trim()) {
          return { valid: false, payload: null, validationMsg: 'Vui lòng điền đủ cả 2 chỗ trống.' };
        }
        return { valid: true, payload: { blank1: blank1.trim(), blank2: blank2.trim() } };
    }
  };

  const handleSubmit = async () => {
    const check = buildAnswerPayload();
    if (!check.valid) {
      setCircleErr(check.validationMsg || 'Vui lòng hoàn thành câu trả lời.');
      setBotMood('thinking');
      setBotMessage(check.validationMsg || `Hãy kiểm tra lại câu trả lời nhé ${shortName}!`);
      return;
    }
    setCircleErr('');
    setSubmitting(true);
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    try {
      const res = await onSubmitChallenge({
        question_id: question.id,
        question_type: question.type,
        answer: check.payload,
        duration,
      });
      setFeedback(res);
      if (res.error) {
        setBotMood('encourage');
        setBotMessage(res.error);
      } else if (res.is_correct) {
        setBotMood('cheering');
        setBotMessage(`Tuyệt vời ${shortName}! Bạn đã trả lời chính xác!`);
      } else {
        setBotMood('encourage');
        setBotMessage(`Cố gắng thêm một chút nhé ${shortName}! Xem giải thích bên dưới để hiểu rõ hơn.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMulti = (id: string) => {
    setMultiVal((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAssignDrag = (item: string, zone: string) => {
    setMapVal((prev) => ({ ...prev, [item]: zone }));
    setSelectedDragToken(null);
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
                Khu vực 3 · Thử thách Sách Giáo Khoa
              </h1>
              <p className="text-xs text-slate-500">
                Đã vượt qua {passedIds.size ? CHALLENGE_QUESTIONS.filter((q) => passedIds.has(q.id)).length : 0}/
                {CHALLENGE_QUESTIONS.length} thử thách · Tổng điểm: {student.total_score}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory((h) => !h)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <History className="h-4 w-4 text-[#2389D8]" />
            <span>{showHistory ? 'Quay lại làm bài' : `Lịch sử kết quả (${attempts.length})`}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 pt-6 sm:px-6">
        <DataBotGuide message={botMessage} mood={botMood} compact />

        {showHistory ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 card-3d">
            <h2 className="text-lg font-extrabold text-slate-900">Lịch sử làm bài của {student.full_name}</h2>
            {attempts.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Bạn chưa nộp bài thử thách nào.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-4 font-bold">Mã thử thách</th>
                      <th className="py-2 pr-4 font-bold">Kết quả</th>
                      <th className="py-2 pr-4 font-bold">Điểm</th>
                      <th className="py-2 pr-4 font-bold">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...attempts].reverse().map((att) => (
                      <tr key={att.attempt_id}>
                        <td className="py-2.5 pr-4 font-mono font-bold text-slate-800">{att.question_id}</td>
                        <td className="py-2.5 pr-4">
                          {att.is_correct ? (
                            <span className="font-bold text-[#127A69]">Đúng</span>
                          ) : (
                            <span className="font-bold text-amber-700">Chưa chính xác</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 font-bold text-[#2389D8] tabular-nums">+{att.score}</td>
                        <td className="py-2.5 pr-4 text-slate-500">
                          {new Date(att.submitted_at).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Question Navigator */}
            <aside className="rounded-3xl border border-slate-200 bg-white p-4 card-3d lg:col-span-4">
              <h2 className="text-sm font-extrabold text-slate-900">Danh sách thử thách</h2>
              <p className="mt-0.5 text-xs text-slate-500">Chọn câu hỏi bất kỳ để trả lời</p>
              <div className="mt-3 space-y-1.5">
                {CHALLENGE_QUESTIONS.map((q, idx) => {
                  const isActive = idx === currentIdx;
                  const isDone = passedIds.has(q.id);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`flex w-full items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-[#2389D8] text-white'
                          : isDone
                            ? 'bg-[#38C9B1]/12 text-[#127A69] hover:bg-[#38C9B1]/20'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">
                        {q.numberLabel} · {q.typeLabel}
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {isDone ? '✓ Đạt' : `${q.maxScore}đ`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Right Active Question Card */}
            <section className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 card-3d lg:col-span-8">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="text-xs font-bold text-[#2389D8]">
                    <span>{question.groupLabel}</span>
                    <span className="mx-2 text-slate-300">·</span>
                    <span>{question.numberLabel}</span>
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="text-slate-500">{question.typeLabel}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-extrabold text-amber-700 tabular-nums">
                    <Award className="h-4 w-4 text-[#FFD34F]" />
                    <span>Tối đa {question.maxScore} điểm</span>
                  </div>
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-slate-900">{question.prompt}</h3>

                {/* 1. SINGLE CHOICE */}
                {question.type === 'single_choice' && (
                  <div className="mt-4 space-y-2.5">
                    {(question.options || []).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSingleVal(opt.id)}
                        className={`w-full rounded-2xl border px-4 py-3.5 text-left text-sm font-bold transition-all ${
                          singleVal === opt.id
                            ? 'border-[#2389D8] bg-[#2389D8]/10 text-[#2389D8] ring-2 ring-[#2389D8]/20'
                            : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. MULTI CHOICE */}
                {question.type === 'multi_choice' && (
                  <div className="mt-4 space-y-2.5">
                    <p className="text-xs font-semibold text-slate-500">
                      Có thể chọn nhiều đáp án đúng:
                    </p>
                    {(question.options || []).map((opt) => {
                      const checked = multiVal.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleToggleMulti(opt.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-bold transition-all ${
                            checked
                              ? 'border-[#2389D8] bg-[#2389D8]/10 text-[#2389D8]'
                              : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                              checked
                                ? 'border-[#2389D8] bg-[#2389D8] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {checked ? '✓' : ''}
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. MATCHING */}
                {question.type === 'matching' && (
                  <div className="mt-4 space-y-3">
                    {(question.matchLeft || []).map((leftItem) => (
                      <div
                        key={leftItem}
                        className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4 sm:flex-row sm:items-center"
                      >
                        <span className="font-mono text-sm font-extrabold text-slate-900">{leftItem}</span>
                        <select
                          aria-label={`Chọn ghép cho ${leftItem}`}
                          value={mapVal[leftItem] || ''}
                          onChange={(e) => setMapVal((prev) => ({ ...prev, [leftItem]: e.target.value }))}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 sm:max-w-md"
                        >
                          <option value="">-- Chọn đáp án ghép --</option>
                          {(question.matchRight || []).map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. DRAG & DROP (with tap-to-assign support) */}
                {question.type === 'drag_drop' && (
                  <div className="mt-4 space-y-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Kéo thẻ giá trị vào ô nhóm bên dưới (hoặc chạm vào thẻ rồi chạm vào nhóm):
                    </p>

                    <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-3">
                      {(question.dragItems || []).map((item) => {
                        const assigned = mapVal[item];
                        const active = selectedDragToken === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}
                            onClick={() => setSelectedDragToken(active ? null : item)}
                            className={`rounded-xl border px-3.5 py-2 font-mono text-sm font-bold transition-all ${
                              active
                                ? 'border-[#2389D8] bg-[#2389D8] text-white ring-4 ring-[#2389D8]/20'
                                : assigned
                                  ? 'border-[#38C9B1] bg-[#38C9B1]/15 text-[#127A69]'
                                  : 'border-slate-300 bg-white text-slate-900 hover:border-[#2389D8]'
                            }`}
                          >
                            {item} {assigned ? `→ ${assigned}` : ''}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {(question.dropZones || []).map((zone) => {
                        const itemsInZone = (question.dragItems || []).filter((i) => mapVal[i] === zone);
                        return (
                          <div
                            key={zone}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const item = e.dataTransfer.getData('text/plain');
                              if (item) handleAssignDrag(item, zone);
                            }}
                            onClick={() => {
                              if (selectedDragToken) handleAssignDrag(selectedDragToken, zone);
                            }}
                            className={`min-h-28 cursor-pointer rounded-2xl border-2 border-dashed p-3.5 transition-colors ${
                              selectedDragToken
                                ? 'border-[#2389D8] bg-[#2389D8]/5'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            <p className="text-xs font-extrabold text-[#2389D8]">{zone}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {itemsInZone.map((it) => (
                                <span
                                  key={it}
                                  className="rounded-lg bg-[#2389D8]/10 px-2.5 py-1 font-mono text-xs font-bold text-slate-900"
                                >
                                  {it}
                                </span>
                              ))}
                              {itemsInZone.length === 0 && (
                                <span className="text-xs text-slate-400">Thả hoặc chạm để đặt vào đây</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. FILL BLANK */}
                {question.type === 'fill_blank' && (
                  <div className="mt-4 space-y-4 rounded-2xl bg-[#F8FBFF] p-5">
                    <p className="text-sm font-semibold leading-relaxed text-slate-800">
                      &ldquo;Biến lưu trữ giá trị có thể{' '}
                      <input
                        type="text"
                        value={blank1}
                        onChange={(e) => setBlank1(e.target.value)}
                        placeholder="chỗ trống 1"
                        className="mx-1 inline-block w-36 rounded-xl border border-[#2389D8]/40 bg-white px-3 py-1 text-center font-bold text-[#2389D8]"
                      />{' '}
                      trong quá trình thực hiện chương trình. Hằng là giá trị{' '}
                      <input
                        type="text"
                        value={blank2}
                        onChange={(e) => setBlank2(e.target.value)}
                        placeholder="chỗ trống 2"
                        className="mx-1 inline-block w-36 rounded-xl border border-[#2389D8]/40 bg-white px-3 py-1 text-center font-bold text-[#2389D8]"
                      />{' '}
                      trong quá trình thực hiện chương trình.&rdquo;
                    </p>
                  </div>
                )}

                {/* 6A. EXPRESSION TABLE (A2 & C_EXPR) */}
                {question.type === 'expression_table' && question.id === 'SGK_A2' && (
                  <div className="mt-4 space-y-3">
                    <div className="grid gap-3 rounded-2xl bg-[#F8FBFF] p-4 sm:grid-cols-2">
                      <div className="font-mono text-sm font-bold text-slate-800">C1 = A1 + B1</div>
                      <input
                        type="text"
                        placeholder="Kết quả C1 (ví dụ: 8)"
                        value={a2State.c1}
                        onChange={(e) => setA2State((s) => ({ ...s, c1: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold"
                      />
                    </div>

                    <div className="grid gap-3 rounded-2xl bg-[#F8FBFF] p-4 sm:grid-cols-3">
                      <div className="font-mono text-sm font-bold text-slate-800">C2 = A1 &amp; B1</div>
                      <input
                        type="text"
                        placeholder="Kết quả C2"
                        value={a2State.c2_val}
                        onChange={(e) => setA2State((s) => ({ ...s, c2_val: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold"
                      />
                      <select
                        value={a2State.c2_type}
                        onChange={(e) => setA2State((s) => ({ ...s, c2_type: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                      >
                        <option value="">-- Kiểu dữ liệu --</option>
                        <option value="Số">Số</option>
                        <option value="Xâu kí tự">Xâu kí tự</option>
                        <option value="Logic">Logic</option>
                      </select>
                    </div>

                    <div className="grid gap-3 rounded-2xl bg-[#F8FBFF] p-4 sm:grid-cols-3">
                      <div className="font-mono text-sm font-bold text-slate-800">C3 = A1 &lt; B1</div>
                      <select
                        value={a2State.c3_val}
                        onChange={(e) => setA2State((s) => ({ ...s, c3_val: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold"
                      >
                        <option value="">-- Kết quả --</option>
                        <option value="TRUE">TRUE</option>
                        <option value="FALSE">FALSE</option>
                      </select>
                      <select
                        value={a2State.c3_type}
                        onChange={(e) => setA2State((s) => ({ ...s, c3_type: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                      >
                        <option value="">-- Kiểu dữ liệu --</option>
                        <option value="Số">Số</option>
                        <option value="Xâu kí tự">Xâu kí tự</option>
                        <option value="Logic">Logic</option>
                      </select>
                    </div>
                  </div>
                )}

                {question.type === 'expression_table' && question.id === 'SGK_C_EXPR' && (
                  <div className="mt-4 space-y-3">
                    <div className="grid gap-3 rounded-2xl bg-[#F8FBFF] p-4 sm:grid-cols-3">
                      <div className="font-mono text-sm font-bold text-slate-800">a) r &gt; 0</div>
                      <select
                        value={cExprState.a_val}
                        onChange={(e) => setCExprState((s) => ({ ...s, a_val: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold"
                      >
                        <option value="">-- Kết quả --</option>
                        <option value="TRUE">TRUE</option>
                        <option value="FALSE">FALSE</option>
                      </select>
                      <select
                        value={cExprState.a_type}
                        onChange={(e) => setCExprState((s) => ({ ...s, a_type: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                      >
                        <option value="">-- Kiểu dữ liệu --</option>
                        <option value="Số">Số</option>
                        <option value="Xâu kí tự">Xâu kí tự</option>
                        <option value="Logic">Logic</option>
                      </select>
                    </div>

                    <div className="grid gap-3 rounded-2xl bg-[#F8FBFF] p-4 sm:grid-cols-3">
                      <div className="font-mono text-sm font-bold text-slate-800">b) 2 × 3.14 × r</div>
                      <input
                        type="text"
                        placeholder="Kết quả (số)"
                        value={cExprState.b_val}
                        onChange={(e) => setCExprState((s) => ({ ...s, b_val: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold"
                      />
                      <select
                        value={cExprState.b_type}
                        onChange={(e) => setCExprState((s) => ({ ...s, b_type: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                      >
                        <option value="">-- Kiểu dữ liệu --</option>
                        <option value="Số">Số</option>
                        <option value="Xâu kí tự">Xâu kí tự</option>
                        <option value="Logic">Logic</option>
                      </select>
                    </div>

                    <div className="grid gap-3 rounded-2xl bg-[#F8FBFF] p-4 sm:grid-cols-3">
                      <div className="font-mono text-xs font-bold text-slate-800">
                        c) JOIN &ldquo;Chu vi đường tròn là &rdquo; với 2 × 3.14 × r
                      </div>
                      <input
                        type="text"
                        placeholder='Chu vi đường tròn là ...'
                        value={cExprState.c_val}
                        onChange={(e) => setCExprState((s) => ({ ...s, c_val: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                      />
                      <select
                        value={cExprState.c_type}
                        onChange={(e) => setCExprState((s) => ({ ...s, c_type: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                      >
                        <option value="">-- Kiểu dữ liệu --</option>
                        <option value="Số">Số</option>
                        <option value="Xâu kí tự">Xâu kí tự</option>
                        <option value="Logic">Logic</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 6B. CIRCLE PRACTICE */}
                {question.type === 'circle_practice' && (
                  <div className="mt-4 space-y-4 rounded-2xl bg-[#F8FBFF] p-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <label className="text-xs font-bold text-slate-700">
                        Nhập bán kính r (r ≥ 0)
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={circleR}
                          onChange={(e) => setCircleR(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold"
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-700">
                        Chu vi C = 2 × 3.14 × r
                        <input
                          type="number"
                          step="any"
                          placeholder="Nhập C"
                          value={circleC}
                          onChange={(e) => setCircleC(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold"
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-700">
                        Diện tích S = 3.14 × r × r
                        <input
                          type="number"
                          step="any"
                          placeholder="Nhập S"
                          value={circleS}
                          onChange={(e) => setCircleS(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold"
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 text-xs text-slate-600">
                      <span>
                        Kiểu dữ liệu của kết quả C và S: <strong className="text-[#2389D8]">Kiểu Số</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const rVal = Number(circleR);
                          if (isNaN(rVal) || rVal < 0) {
                            setCircleErr('Bán kính r không hợp lệ (phải là số không âm).');
                            return;
                          }
                          setCircleErr('');
                          setCircleC(String(Number((2 * 3.14 * rVal).toFixed(4))));
                          setCircleS(String(Number((3.14 * rVal * rVal).toFixed(4))));
                        }}
                        className="rounded-lg bg-[#2389D8]/10 px-3 py-1.5 font-bold text-[#2389D8] hover:bg-[#2389D8]/20"
                      >
                        Tính thử nhanh với công thức
                      </button>
                    </div>
                  </div>
                )}

                {circleErr && (
                  <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700">
                    {circleErr}
                  </p>
                )}

                {/* Feedback Banner */}
                {feedback && (
                  <div
                    className={`mt-5 rounded-2xl border p-4 ${
                      feedback.error
                        ? 'border-rose-200 bg-rose-50 text-rose-800'
                        : feedback.is_correct
                          ? 'border-[#38C9B1]/40 bg-[#38C9B1]/12 text-[#127A69]'
                          : 'border-[#FF9850]/40 bg-[#FF9850]/12 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-extrabold">
                        {feedback.is_correct ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                        <span>
                          {feedback.error
                            ? 'Lỗi gửi bài'
                            : feedback.is_correct
                              ? `Chính xác! Đạt ${feedback.score}/${feedback.max_score} điểm`
                              : `Đạt ${feedback.score}/${feedback.max_score} điểm`}
                        </span>
                      </div>
                      {feedback.awarded_delta > 0 && (
                        <span className="font-mono text-xs font-extrabold tabular-nums">
                          +{feedback.awarded_delta} điểm mới
                        </span>
                      )}
                    </div>
                    {feedback.explanation && (
                      <p className="mt-2 text-sm font-medium">{feedback.explanation}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  ← Câu trước
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="btn-3d flex items-center gap-2 rounded-2xl bg-[#2389D8] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_#1765A3] hover:bg-[#1E7BC4] disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? 'Đang chấm điểm...' : 'Kiểm tra & Nộp bài'}</span>
                  </button>

                  {currentIdx < CHALLENGE_QUESTIONS.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentIdx((i) => i + 1)}
                      className="btn-3d flex items-center gap-1.5 rounded-2xl bg-[#38C9B1] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_0_#249683] hover:bg-[#2EB7A0]"
                    >
                      <span>Tiếp tục</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
