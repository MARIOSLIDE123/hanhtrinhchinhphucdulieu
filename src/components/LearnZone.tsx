import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  StepForward,
  Variable,
} from 'lucide-react';
import { DATA_TYPES_CONTENT, QUICK_IDENTIFY_ITEMS } from '../data/lessonData';
import { getShortStudentName } from '../services/apiService';
import { AttemptRecord, StudentProfile } from '../types';
import { DataBotGuide, RobotMood } from './DataBotGuide';

interface LearnZoneProps {
  student: StudentProfile;
  attempts: AttemptRecord[];
  onBack: () => void;
  onCompleteStage: (stageId: 'STAGE_1' | 'STAGE_2' | 'STAGE_3') => Promise<void>;
}

export function LearnZone({ student, attempts, onBack, onCompleteStage }: LearnZoneProps) {
  const shortName = getShortStudentName(student.full_name);
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);
  const [selectedDataType, setSelectedDataType] = useState<'number' | 'string' | 'boolean'>('number');
  const [botMessage, setBotMessage] = useState(
    `Chạm vào từng kiểu dữ liệu bên dưới để mình giải thích và xem ví dụ minh họa nhé ${shortName}!`
  );
  const [botMood, setBotMood] = useState<RobotMood>('happy');

  // Stage 1 interactive sandboxes
  const [numA, setNumA] = useState(15);
  const [numB, setNumB] = useState(4);
  const [joinLeft, setJoinLeft] = useState('Xin chào ');
  const [joinRight, setJoinRight] = useState('Tin học!');
  const [logicA, setLogicA] = useState(true);
  const [logicB, setLogicB] = useState(false);

  // Stage 2 Quick Identify mini-game
  const [qiIndex, setQiIndex] = useState(0);
  const [qiFeedback, setQiFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  // Stage 3 Scratch Polygon Simulator
  const [polySides, setPolySides] = useState(6);
  const [drawnSteps, setDrawnSteps] = useState(6);
  const [isAnimating, setIsAnimating] = useState(false);
  const animTimerRef = useRef<number | null>(null);

  const [submittingStage, setSubmittingStage] = useState(false);

  const passedIds = useMemo(
    () => new Set(attempts.filter((a) => a.is_correct).map((a) => a.question_id)),
    [attempts]
  );

  const stepLength = Math.round((900 / polySides) * 10) / 10;
  const turnAngle = Math.round((360 / polySides) * 10) / 10;

  // Compute SVG polygon vertices centered inside 320x260 canvas
  const polygonPoints = useMemo(() => {
    const cx = 160;
    const cy = 135;
    const radius = 86;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= polySides; i++) {
      const angle = ((i * 360) / polySides - 90) * (Math.PI / 180);
      pts.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }
    return pts;
  }, [polySides]);

  useEffect(() => {
    return () => {
      if (animTimerRef.current) window.clearInterval(animTimerRef.current);
    };
  }, []);

  const stopAnimation = () => {
    if (animTimerRef.current) {
      window.clearInterval(animTimerRef.current);
      animTimerRef.current = null;
    }
    setIsAnimating(false);
  };

  const handlePlayPolygon = () => {
    stopAnimation();
    setDrawnSteps(0);
    setIsAnimating(true);
    let step = 0;
    animTimerRef.current = window.setInterval(() => {
      step += 1;
      setDrawnSteps(step);
      if (step >= polySides) {
        stopAnimation();
      }
    }, 380);
  };

  const handleChangeSides = (n: number) => {
    stopAnimation();
    const clamped = Math.max(3, Math.min(12, n));
    setPolySides(clamped);
    setDrawnSteps(clamped);
    setBotMood('happy');
    setBotMessage(
      `Khi n = ${clamped}, độ bước = 900 / ${clamped} = ${(900 / clamped).toFixed(1)} và góc quay = 360 / ${clamped} = ${(360 / clamped).toFixed(1)} độ!`
    );
  };

  const handleSelectDataType = (id: 'number' | 'string' | 'boolean') => {
    setSelectedDataType(id);
    const info = DATA_TYPES_CONTENT.find((item) => item.id === id);
    if (info) {
      setBotMood('thinking');
      setBotMessage(info.robotExplanation);
    }
  };

  const handleQuickIdentify = (choice: 'Biến' | 'Hằng' | 'Biểu thức') => {
    const item = QUICK_IDENTIFY_ITEMS[qiIndex];
    const ok = choice === item.answer;
    if (ok) {
      setBotMood('cheering');
      setBotMessage(`Tuyệt vời ${shortName}! Bạn đã trả lời chính xác! ${item.detail}`);
      setQiFeedback({ ok: true, text: `Chính xác! ${item.detail}` });
    } else {
      setBotMood('encourage');
      setBotMessage(`Cố gắng thêm một chút nhé ${shortName}! Gợi ý: ${item.detail}`);
      setQiFeedback({ ok: false, text: `Chưa đúng rồi. Đáp án đúng là ${item.answer}: ${item.detail}` });
    }
  };

  const handleStageComplete = async (stageId: 'STAGE_1' | 'STAGE_2' | 'STAGE_3') => {
    setSubmittingStage(true);
    try {
      await onCompleteStage(stageId);
      setBotMood('cheering');
      setBotMessage(`${shortName} đã hoàn thành thử thách chặng học này (+20 điểm)!`);
    } finally {
      setSubmittingStage(false);
    }
  };

  const currentTypeInfo = DATA_TYPES_CONTENT.find((d) => d.id === selectedDataType)!;

  return (
    <div className="min-h-screen bg-[#F4F9FF] pb-10">
      {/* Top Bar */}
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
                Khu vực 1 · Khám phá kiến thức
              </h1>
              <p className="text-xs text-slate-500">3 chặng học tập tương tác Bài 13</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1">
            {[
              { id: 1 as const, label: 'Chặng 1: Kiểu dữ liệu', done: passedIds.has('STAGE_1') },
              { id: 2 as const, label: 'Chặng 2: Hằng, Biến, Biểu thức', done: passedIds.has('STAGE_2') },
              { id: 3 as const, label: 'Chặng 3: Scratch Lab', done: passedIds.has('STAGE_3') },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStage(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                  activeStage === tab.id
                    ? 'bg-[#2389D8] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.done && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        <DataBotGuide message={botMessage} mood={botMood} compact />

        {/* CHẶNG 1 */}
        {activeStage === 1 && (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
              {DATA_TYPES_CONTENT.map((dt) => {
                const isSelected = selectedDataType === dt.id;
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => handleSelectDataType(dt.id)}
                    className={`flex flex-col rounded-3xl border p-6 text-left transition-all card-3d ${
                      isSelected
                        ? 'border-[#2389D8] bg-white ring-4 ring-[#2389D8]/15'
                        : 'border-slate-200 bg-white hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-extrabold" style={{ color: dt.color }}>
                        {dt.title}
                      </h2>
                      <span className="text-xs font-bold text-slate-400">
                        {isSelected ? 'Đang xem' : 'Chạm để xem'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-700">{dt.summary}</p>

                    <div className={`mt-4 rounded-2xl p-3 ${dt.bgTint}`}>
                      <p className="text-xs font-bold text-slate-600">Ví dụ minh họa:</p>
                      <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                        {dt.examples.join(' · ')}
                      </p>
                    </div>

                    <ul className="mt-4 space-y-1.5 text-xs font-medium text-slate-600">
                      {dt.operations.map((op) => (
                        <li key={op} className="flex items-start gap-2">
                          <span style={{ color: dt.color }}>•</span>
                          <span>{op}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* Interactive Sandbox for the selected Data Type + Table */}
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d lg:col-span-6">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <Sparkles className="h-4 w-4 text-[#2389D8]" />
                  <span>Thử nghiệm trực tiếp: {currentTypeInfo.title}</span>
                </div>

                {selectedDataType === 'number' && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs font-bold text-slate-600">
                        Số thứ nhất
                        <input
                          type="number"
                          value={numA}
                          onChange={(e) => setNumA(Number(e.target.value) || 0)}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm font-bold"
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-600">
                        Số thứ hai
                        <input
                          type="number"
                          value={numB}
                          onChange={(e) => setNumB(Number(e.target.value) || 1)}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm font-bold"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 font-mono text-xs sm:grid-cols-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-slate-500">Cộng (+):</span>
                        <p className="mt-1 text-base font-bold text-[#2389D8] tabular-nums">{numA + numB}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-slate-500">Trừ (-):</span>
                        <p className="mt-1 text-base font-bold text-[#2389D8] tabular-nums">{numA - numB}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-slate-500">Nhân (×):</span>
                        <p className="mt-1 text-base font-bold text-[#2389D8] tabular-nums">{numA * numB}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-slate-500">Chia (/):</span>
                        <p className="mt-1 text-base font-bold text-[#2389D8] tabular-nums">
                          {numB !== 0 ? (numA / numB).toFixed(2) : 'Lỗi chia 0'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-slate-500">Chia lấy dư (mod):</span>
                        <p className="mt-1 text-base font-bold text-[#38C9B1] tabular-nums">
                          {numB !== 0 ? numA % numB : '-'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-slate-500">Làm tròn (3.141592):</span>
                        <p className="mt-1 text-base font-bold text-[#38C9B1] tabular-nums">
                          {Math.round(3.141592)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDataType === 'string' && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs font-bold text-slate-600">
                        Xâu thứ nhất
                        <input
                          type="text"
                          value={joinLeft}
                          onChange={(e) => setJoinLeft(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-600">
                        Xâu thứ hai
                        <input
                          type="text"
                          value={joinRight}
                          onChange={(e) => setJoinRight(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                        />
                      </label>
                    </div>
                    <div className="rounded-2xl bg-[#FF9850]/10 p-4">
                      <p className="text-xs font-bold text-amber-900">Kết quả phép toán JOIN:</p>
                      <p className="mt-1 font-mono text-base font-bold text-slate-900">
                        &ldquo;{joinLeft + joinRight}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {selectedDataType === 'boolean' && (
                  <div className="mt-4 space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setLogicA((v) => !v)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold ${
                          logicA ? 'bg-[#38C9B1] text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Biểu thức A: {logicA ? 'true (Đúng)' : 'false (Sai)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogicB((v) => !v)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold ${
                          logicB ? 'bg-[#38C9B1] text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Biểu thức B: {logicB ? 'true (Đúng)' : 'false (Sai)'}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-slate-500">A AND B</span>
                        <p className="mt-1 text-sm font-bold text-[#2389D8]">
                          {String(logicA && logicB).toUpperCase()}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-slate-500">A OR B</span>
                        <p className="mt-1 text-sm font-bold text-[#38C9B1]">
                          {String(logicA || logicB).toUpperCase()}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-slate-500">NOT A</span>
                        <p className="mt-1 text-sm font-bold text-[#FF9850]">
                          {String(!logicA).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bảng phân loại 3 kiểu dữ liệu */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d lg:col-span-6">
                <h3 className="text-sm font-extrabold text-slate-900">Bảng phân loại 3 kiểu dữ liệu (SGK)</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-3 font-bold">Kiểu dữ liệu</th>
                        <th className="py-2 pr-3 font-bold">Ví dụ</th>
                        <th className="py-2 font-bold">Phép toán chính</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 pr-3 font-bold text-[#2389D8]">Số</td>
                        <td className="py-2.5 pr-3 font-mono">15; 3.141592</td>
                        <td className="py-2.5">+, -, ×, /, chia lấy dư, làm tròn</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-3 font-bold text-[#FF9850]">Xâu kí tự</td>
                        <td className="py-2.5 pr-3 font-mono">@; Computer; Tin học</td>
                        <td className="py-2.5">JOIN (nối xâu kí tự)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-3 font-bold text-[#38C9B1]">Logic</td>
                        <td className="py-2.5 pr-3 font-mono">true; false</td>
                        <td className="py-2.5">=, &lt;, &gt;, AND, OR, NOT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    disabled={submittingStage}
                    onClick={() => handleStageComplete('STAGE_1')}
                    className="btn-3d flex items-center gap-2 rounded-2xl bg-[#38C9B1] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_#249683] hover:bg-[#2EB7A0] disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{passedIds.has('STAGE_1') ? 'Đã hoàn thành Chặng 1 (+20đ)' : 'Hoàn thành Chặng 1 (+20 điểm)'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHẶNG 2 */}
        {activeStage === 2 && (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl border border-[#2389D8]/25 bg-white p-6 card-3d">
                <h2 className="text-lg font-extrabold text-[#2389D8]">A. Biến (Variable)</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>• Dùng để lưu trữ giá trị có thể thay đổi trong quá trình thực hiện chương trình.</li>
                  <li>• Được nhận biết bằng tên.</li>
                  <li>• Mỗi biến thuộc một kiểu dữ liệu nhất định.</li>
                </ul>
                <div className="mt-4 rounded-2xl bg-[#2389D8]/10 p-3 font-mono text-xs font-bold text-slate-900">
                  Ví dụ: biến n lưu số cạnh của hình (có thể gán n = 6).
                </div>
              </div>

              <div className="rounded-3xl border border-[#FF9850]/30 bg-white p-6 card-3d">
                <h2 className="text-lg font-extrabold text-[#FF9850]">B. Hằng (Constant)</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>• Là giá trị không đổi trong quá trình thực hiện chương trình.</li>
                  <li>• Có thể là hằng số, hằng xâu kí tự hoặc hằng logic.</li>
                </ul>
                <div className="mt-4 rounded-2xl bg-[#FF9850]/10 p-3 font-mono text-xs font-bold text-slate-900">
                  Ví dụ: 3.14 (hằng số); &ldquo;Xin chào!&rdquo; (hằng xâu); true (hằng logic).
                </div>
              </div>

              <div className="rounded-3xl border border-[#A88BFA]/30 bg-white p-6 card-3d">
                <h2 className="text-lg font-extrabold text-[#7C5CE6]">C. Biểu thức (Expression)</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>• Là sự kết hợp của biến, hằng, dấu ngoặc, phép toán và các hàm.</li>
                  <li>• Trả về một giá trị thuộc một kiểu dữ liệu nhất định.</li>
                </ul>
                <div className="mt-4 rounded-2xl bg-[#A88BFA]/10 p-3 font-mono text-xs font-bold text-slate-900">
                  Ví dụ: 2 × 3.14 × r hoặc 360 / n
                </div>
              </div>
            </div>

            {/* Sơ đồ quan hệ trực quan */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d">
              <h3 className="text-sm font-extrabold text-slate-900">
                Mối quan hệ giữa Hằng, Biến và Biểu thức
              </h3>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-center">
                <div className="rounded-2xl border border-[#FF9850]/40 bg-[#FF9850]/10 px-4 py-3">
                  <p className="text-xs font-bold text-[#C75B12]">HẰNG (Không đổi)</p>
                  <p className="font-mono text-sm font-extrabold">2, 3.14</p>
                </div>
                <span className="text-xl font-extrabold text-slate-400">+</span>
                <div className="rounded-2xl border border-[#2389D8]/40 bg-[#2389D8]/10 px-4 py-3">
                  <p className="text-xs font-bold text-[#2389D8]">BIẾN (Thay đổi)</p>
                  <p className="font-mono text-sm font-extrabold">r = 5</p>
                </div>
                <span className="text-xl font-extrabold text-slate-400">+</span>
                <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
                  <p className="text-xs font-bold text-slate-600">PHÉP TOÁN / NGOẶC / HÀM</p>
                  <p className="font-mono text-sm font-extrabold">×, /, ( )</p>
                </div>
                <span className="text-xl font-extrabold text-[#7C5CE6]">➔</span>
                <div className="rounded-2xl border border-[#A88BFA]/50 bg-[#A88BFA]/15 px-5 py-3">
                  <p className="text-xs font-bold text-[#623CE0]">BIỂU THỨC</p>
                  <p className="font-mono text-sm font-extrabold">2 × 3.14 × r ➔ 31.4 (Số)</p>
                </div>
              </div>
            </div>

            {/* Tương tác NHẬN DIỆN NHANH */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">NHẬN DIỆN NHANH</h3>
                  <p className="text-xs text-slate-500">
                    Thử phân biệt ví dụ bên dưới là Biến, Hằng hay Biểu thức ({qiIndex + 1}/{QUICK_IDENTIFY_ITEMS.length})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQiIndex((prev) => (prev + 1) % QUICK_IDENTIFY_ITEMS.length);
                    setQiFeedback(null);
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Ví dụ tiếp theo →
                </button>
              </div>

              <div className="mt-4 flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#F4F9FF] p-5 sm:flex-row">
                <div className="font-mono text-lg font-extrabold text-slate-900">
                  {QUICK_IDENTIFY_ITEMS[qiIndex].label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['Biến', 'Hằng', 'Biểu thức'] as const).map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => handleQuickIdentify(choice)}
                      className="btn-3d rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-[#2389D8] hover:text-white"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {qiFeedback && (
                <div
                  className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    qiFeedback.ok ? 'bg-[#38C9B1]/15 text-[#127A69]' : 'bg-[#FF9850]/15 text-amber-900'
                  }`}
                >
                  {qiFeedback.text}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  disabled={submittingStage}
                  onClick={() => handleStageComplete('STAGE_2')}
                  className="btn-3d flex items-center gap-2 rounded-2xl bg-[#38C9B1] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_#249683] hover:bg-[#2EB7A0] disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{passedIds.has('STAGE_2') ? 'Đã hoàn thành Chặng 2 (+20đ)' : 'Hoàn thành Chặng 2 (+20 điểm)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CHẶNG 3: PHÒNG THÍ NGHIỆM SCRATCH */}
        {activeStage === 3 && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Scratch Polygon Canvas */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 card-3d lg:col-span-7">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Phòng thí nghiệm Scratch · Vẽ đa giác đều
                    </h2>
                    <p className="text-xs text-slate-500">
                      Thay đổi biến n để quan sát sự thay đổi của biểu thức 900/n, 360/n và hình vẽ.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePlayPolygon}
                      className="btn-3d flex items-center gap-1.5 rounded-xl bg-[#2389D8] px-3.5 py-2 text-xs font-bold text-white"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Chạy mô phỏng</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopAnimation();
                        setDrawnSteps((s) => (s >= polySides ? 1 : s + 1));
                      }}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <StepForward className="h-3.5 w-3.5" />
                      <span>Từng bước</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopAnimation();
                        setDrawnSteps(polySides);
                      }}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      title="Hiện toàn bộ"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* SVG Stage */}
                <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4">
                  <svg viewBox="0 0 320 270" className="h-64 w-full max-w-md">
                    {/* Subtle coordinate grid */}
                    <defs>
                      <pattern id="scratch-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.7" />
                      </pattern>
                    </defs>
                    <rect width="320" height="270" fill="url(#scratch-grid)" rx="12" />

                    {/* Ghost full shape */}
                    <polyline
                      fill="none"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      points={polygonPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                    />

                    {/* Drawn active edges */}
                    {drawnSteps > 0 && (
                      <polyline
                        fill="rgba(35, 137, 216, 0.08)"
                        stroke="#2389D8"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polygonPoints
                          .slice(0, Math.min(drawnSteps + 1, polygonPoints.length))
                          .map((p) => `${p.x},${p.y}`)
                          .join(' ')}
                      />
                    )}

                    {/* Sprite position marker */}
                    {(() => {
                      const activePt = polygonPoints[Math.min(drawnSteps, polygonPoints.length - 1)];
                      return (
                        <g transform={`translate(${activePt.x}, ${activePt.y})`}>
                          <circle r="11" fill="#FF9850" stroke="#FFFFFF" strokeWidth="2.5" />
                          <circle r="4" fill="#FFFFFF" />
                        </g>
                      );
                    })()}
                  </svg>

                  <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600 tabular-nums">
                    <span>Số cạnh n = {polySides}</span>
                    <span>·</span>
                    <span>Độ bước = 900 / {polySides} = {stepLength}</span>
                    <span>·</span>
                    <span>Góc quay = 360 / {polySides} = {turnAngle}°</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Controls + Scratch Code Blocks */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 card-3d lg:col-span-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <Variable className="h-4 w-4 text-[#FF9850]" />
                  <span>Bảng điều khiển biến & khối lệnh Scratch</span>
                </div>

                <div className="rounded-2xl bg-[#F4F9FF] p-4">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                    <label htmlFor="poly-sides-range">Nhập số cạnh n:</label>
                    <span className="font-mono text-lg text-[#2389D8] tabular-nums">{polySides} cạnh</span>
                  </div>
                  <input
                    id="poly-sides-range"
                    type="range"
                    min={3}
                    max={12}
                    value={polySides}
                    onChange={(e) => handleChangeSides(Number(e.target.value))}
                    className="mt-2 w-full accent-[#2389D8]"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[3, 4, 5, 6, 8, 10, 12].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleChangeSides(n)}
                        className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${
                          polySides === n
                            ? 'bg-[#2389D8] text-white'
                            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        n={n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scratch Blocks */}
                <div className="space-y-2 text-xs font-bold text-white">
                  <div className="rounded-xl bg-[#38C9B1] px-3.5 py-2.5 shadow-sm">
                    hỏi [Nhập số cạnh n của hình:] và đợi → trả lời = {polySides}
                  </div>
                  <div className="rounded-xl bg-[#FF9850] px-3.5 py-2.5 shadow-sm">
                    đặt [n] thành ({polySides})
                  </div>
                  <div className="rounded-xl bg-[#FF9850] px-3.5 py-2.5 shadow-sm">
                    đặt [độ bước] thành (900 / n) → {stepLength}
                  </div>
                  <div className="rounded-xl bg-[#FF9850] px-3.5 py-2.5 shadow-sm">
                    đặt [góc quay] thành (360 / n) → {turnAngle}°
                  </div>
                  <div className="rounded-xl bg-[#FFD34F] px-3.5 py-2.5 text-amber-950 shadow-sm">
                    lặp lại ({polySides}) lần:
                    <div className="mt-1.5 space-y-1 pl-3 text-white">
                      <div className="rounded-lg bg-[#2389D8] px-3 py-1.5">
                        di chuyển ({stepLength}) bước
                      </div>
                      <div className="rounded-lg bg-[#2389D8] px-3 py-1.5">
                        xoay phải ({turnAngle}) độ
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  disabled={submittingStage}
                  onClick={() => handleStageComplete('STAGE_3')}
                  className="btn-3d flex w-full items-center justify-center gap-2 rounded-2xl bg-[#38C9B1] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_#249683] hover:bg-[#2EB7A0] disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{passedIds.has('STAGE_3') ? 'Đã hoàn thành Chặng 3 (+20đ)' : 'Hoàn thành Chặng 3 (+20 điểm)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
