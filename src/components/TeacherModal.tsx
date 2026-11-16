import React, { useState } from 'react';
import {
  Award,
  BarChart2,
  CheckCircle2,
  ClipboardCopy,
  Cloud,
  Database,
  Download,
  Eye,
  FileText,
  KeyRound,
  Lock,
  RotateCcw,
  Save,
  Search,
  Settings,
  Sparkles,
  Star,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import {
  changeTeacherPasswordRemote,
  fetchTeacherOverview,
  getStoredGasUrl,
  saveTeacherAppConfig,
  saveTeacherVanDungQuestions,
  teacherLoginRemote,
} from '../services/apiService';
import { DEFAULT_VAN_DUNG_QUESTIONS } from '../data/lessonData';
import { AppConfig, StudentProfile, VanDungQuestion } from '../types';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSharedDataUpdated: (data: {
    config: AppConfig;
    vanDungQuestions: VanDungQuestion[];
  }) => void;
}

type TeacherTab = 'questions' | 'students' | 'settings';

export function TeacherModal({ isOpen, onClose, onSharedDataUpdated }: TeacherModalProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [teacherToken, setTeacherToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TeacherTab>('questions');

  // Dashboard states
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [vanDungQuestions, setVanDungQuestions] = useState<VanDungQuestion[]>(DEFAULT_VAN_DUNG_QUESTIONS);
  const [config, setConfig] = useState<AppConfig>({
    grade_level: 'Tin học 7',
    subject_name: 'Tin học',
    lesson_title: 'Bài 13: Biểu diễn dữ liệu',
  });
  const [stats, setStats] = useState({ total_students: 0, completed_students: 0, total_score: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Chọn câu hỏi để chỉnh sửa (0 -> 4)
  const [editingIndex, setEditingIndex] = useState<number>(0);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Form đổi mật khẩu
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  };

  const loadDashboard = async (token: string) => {
    const overview = await fetchTeacherOverview(token);
    setStudents(overview.students);
    setVanDungQuestions(overview.vanDungQuestions);
    setConfig(overview.config);
    setStats(overview.stats);
    onSharedDataUpdated({
      config: overview.config,
      vanDungQuestions: overview.vanDungQuestions,
    });
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await teacherLoginRemote(passwordInput);
      if (!res.ok || !res.token) {
        setLoginError(res.error || 'Mật khẩu không chính xác.');
        return;
      }
      setTeacherToken(res.token);
      setPasswordInput('');
      await loadDashboard(res.token);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleOfflinePreview = async () => {
    setTeacherToken('OFFLINE_PREVIEW');
    await loadDashboard('OFFLINE_PREVIEW');
  };

  // Cập nhật trường dữ liệu của câu hỏi đang sửa
  const handleUpdateCurrentQuestion = (field: keyof VanDungQuestion, value: unknown) => {
    setVanDungQuestions((prev) =>
      prev.map((q, idx) => (idx === editingIndex ? { ...q, [field]: value } : q))
    );
  };

  // Lưu 5 câu hỏi vận dụng
  const handleSaveQuestions = async () => {
    if (!teacherToken) return;
    setSaving(true);
    try {
      const updated = await saveTeacherVanDungQuestions(teacherToken, vanDungQuestions);
      setVanDungQuestions(updated);
      onSharedDataUpdated({ config, vanDungQuestions: updated });
      showToast('Đã lưu thành công 5 câu hỏi Vận dụng lên hệ thống!');
    } finally {
      setSaving(false);
    }
  };

  // Khôi phục nội dung 5 câu hỏi mặc định theo SGK
  const handleResetDefaultQuestions = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục 5 câu hỏi Vận dụng về nội dung mặc định của SGK?')) {
      setVanDungQuestions(DEFAULT_VAN_DUNG_QUESTIONS);
      showToast('Đã khôi phục nội dung 5 câu hỏi mặc định!');
    }
  };

  // Lưu cấu hình tên bài học / khối lớp
  const handleSaveConfig = async () => {
    if (!teacherToken) return;
    setSaving(true);
    try {
      const updated = await saveTeacherAppConfig(teacherToken, config);
      setConfig(updated);
      onSharedDataUpdated({ config: updated, vanDungQuestions });
      showToast('Đã lưu cấu hình bài học thành công!');
    } finally {
      setSaving(false);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async () => {
    if (!teacherToken) return;
    const res = await changeTeacherPasswordRemote(teacherToken, oldPw, newPw);
    if (res.ok && res.teacher_token) {
      setTeacherToken(res.teacher_token);
      setOldPw('');
      setNewPw('');
      showToast('Đã đổi mật khẩu giáo viên trên Apps Script!');
    } else {
      showToast(res.error || 'Không thể đổi mật khẩu.');
    }
  };

  // Sao chép link chia sẻ học sinh
  const handleCopyShareLink = async () => {
    const share = new URL(window.location.href.split('?')[0]);
    await navigator.clipboard.writeText(share.toString());
    showToast('Đã sao chép link lớp học cho học sinh!');
  };

  // Xuất file CSV báo cáo điểm
  const handleExportCsv = () => {
    const header = ['STT', 'Mã HS', 'Họ và tên', 'Trường', 'Lớp', 'Tổng điểm (100)', 'Số câu đúng (5)', 'Lần làm bài', 'Hoạt động cuối'];
    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.student_id}"`,
      `"${s.full_name}"`,
      `"${s.school}"`,
      `"${s.class_name}"`,
      s.total_score,
      s.total_correct,
      s.total_attempts,
      `"${s.last_active}"`,
    ]);
    const csvContent = '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DATA_ADVENTURE_BaoCao_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentEditingQ = vanDungQuestions[editingIndex] || vanDungQuestions[0];
  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.school.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.class_name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-xs">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Khu Vực Giáo Viên · Quản Trị & Cấu Hình Vận Dụng
            </h2>
            <p className="text-xs text-slate-500">
              {getStoredGasUrl()
                ? 'Đã kết nối trực tiếp với Google Sheets từ mã nguồn'
                : 'Chế độ xem trước Offline (Chưa gắn URL trong mã nguồn)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {toast && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[#38C9B1]/15 px-4 py-3 text-sm font-bold text-[#127A69]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {!teacherToken ? (
            /* ==================== MÀN HÌNH ĐĂNG NHẬP GIÁO VIÊN ==================== */
            <div className="mx-auto max-w-md space-y-6 pt-6">
              <form onSubmit={handleTeacherLogin} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <Lock className="h-5 w-5 text-[#FF9850]" />
                  <span>Đăng nhập Quản trị Giáo viên</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Mật khẩu được xác thực trực tiếp và an toàn tại Google Apps Script.
                </p>

                <div className="mt-4">
                  <label htmlFor="teacher-password" className="block text-xs font-bold text-slate-700">
                    Mật khẩu giáo viên (Mặc định: 2026)
                  </label>
                  <input
                    id="teacher-password"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu (mặc định: 2026)..."
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-mono focus:border-[#2389D8] focus:outline-none"
                  />
                </div>

                {loginError && <p className="mt-2 text-xs font-bold text-rose-600">{loginError}</p>}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="submit"
                    disabled={loggingIn}
                    className="btn-3d rounded-xl bg-[#2389D8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1E7BC4] disabled:opacity-60"
                  >
                    {loggingIn ? 'Đang xác thực...' : 'Đăng nhập'}
                  </button>

                  <button
                    type="button"
                    onClick={handleOfflinePreview}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Xem trước Offline
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ==================== TABS QUẢN TRỊ ==================== */
            <div>
              {/* Tabs Bar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'questions' as const, label: '1. Quản lý 5 Câu hỏi Vận dụng', Icon: FileText },
                    { id: 'students' as const, label: '2. Báo cáo & Danh sách Học sinh', Icon: BarChart2 },
                    { id: 'settings' as const, label: '3. Cài đặt lớp & Đổi mật khẩu', Icon: Settings },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                        activeTab === t.id
                          ? 'bg-[#2389D8] text-white shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <t.Icon className="h-4 w-4" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setTeacherToken(null)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Đăng xuất
                </button>
              </div>

              {/* TAB 1: QUẢN LÝ 5 CÂU HỎI VẬN DỤNG */}
              {activeTab === 'questions' && (
                <div className="space-y-6">
                  {/* Top Bar Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-[#F0F8FF] p-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Cấu hình cố định đúng 5 thử thách Vận dụng
                      </h3>
                      <p className="text-xs text-slate-600">
                        Hình thức tương tác được cố định: Câu 1 (Chọn 1), Câu 2 (Chọn nhiều), Câu 3 (Kéo thả), Câu 4 (Điền ô), Câu 5 (Ghép đôi).
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetDefaultQuestions}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Khôi phục mặc định SGK</span>
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleSaveQuestions}
                        className="btn-3d flex items-center gap-1.5 rounded-xl bg-[#2389D8] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1E7BC4]"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{saving ? 'Đang lưu...' : 'Lưu & Cập nhật 5 câu hỏi'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 5 Questions Tabs */}
                  <div className="grid grid-cols-5 gap-2">
                    {vanDungQuestions.map((q, idx) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setEditingIndex(idx)}
                        className={`rounded-xl border p-2.5 text-center transition-all ${
                          editingIndex === idx
                            ? 'border-[#2389D8] bg-[#E8F4FF] shadow-xs ring-2 ring-[#2389D8]/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs font-black text-slate-900">Thử thách {idx + 1}</p>
                        <p className="text-[11px] text-slate-500 truncate">{q.typeLabel}</p>
                      </button>
                    ))}
                  </div>

                  {/* Edit Form for current question */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-black text-blue-800">
                          {currentEditingQ.typeLabel}
                        </span>
                        <h4 className="mt-1 text-base font-extrabold text-slate-900">
                          {currentEditingQ.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Điểm tối đa:</span>
                        <input
                          type="number"
                          value={currentEditingQ.points}
                          onChange={(e) =>
                            handleUpdateCurrentQuestion('points', Number(e.target.value) || 20)
                          }
                          className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center font-bold text-xs"
                        />
                      </div>
                    </div>

                    {/* Tiêu đề & Yêu cầu */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700">Tên thử thách</label>
                        <input
                          type="text"
                          value={currentEditingQ.title}
                          onChange={(e) => handleUpdateCurrentQuestion('title', e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700">Phụ đề mô tả</label>
                        <input
                          type="text"
                          value={currentEditingQ.subtitle}
                          onChange={(e) => handleUpdateCurrentQuestion('subtitle', e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700">Nội dung câu hỏi (Prompt)</label>
                      <textarea
                        rows={2}
                        value={currentEditingQ.prompt}
                        onChange={(e) => handleUpdateCurrentQuestion('prompt', e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    {/* Form chi tiết theo từng loại câu */}
                    {/* CÂU 1: SINGLE CHOICE */}
                    {currentEditingQ.type === 'single_choice' && currentEditingQ.options && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                        <p className="text-xs font-black text-slate-700 uppercase">
                          4 Lựa chọn & Đáp án đúng:
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {currentEditingQ.options.map((opt, optIdx) => (
                            <div key={opt.id} className="flex items-center gap-2 rounded-xl bg-white p-2 border border-slate-200">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold">
                                {opt.id}
                              </span>
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => {
                                  const nextOpts = [...(currentEditingQ.options || [])];
                                  nextOpts[optIdx] = { ...nextOpts[optIdx], label: e.target.value };
                                  handleUpdateCurrentQuestion('options', nextOpts);
                                }}
                                className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
                              />
                              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                                <input
                                  type="radio"
                                  name="single_correct"
                                  checked={currentEditingQ.correctAnswer === opt.id}
                                  onChange={() => handleUpdateCurrentQuestion('correctAnswer', opt.id)}
                                />
                                <span>Đúng</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CÂU 2: MULTI CHOICE */}
                    {currentEditingQ.type === 'multi_choice' && currentEditingQ.options && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                        <p className="text-xs font-black text-slate-700 uppercase">
                          Các lựa chọn & Đánh dấu TẤT CẢ đáp án đúng:
                        </p>
                        <div className="space-y-2">
                          {currentEditingQ.options.map((opt, optIdx) => {
                            const correctArr = Array.isArray(currentEditingQ.correctAnswer)
                              ? (currentEditingQ.correctAnswer as string[])
                              : [];
                            const isChecked = correctArr.includes(opt.id);

                            return (
                              <div key={opt.id} className="flex items-center gap-2 rounded-xl bg-white p-2 border border-slate-200">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold">
                                  {opt.id}
                                </span>
                                <input
                                  type="text"
                                  value={opt.label}
                                  onChange={(e) => {
                                    const nextOpts = [...(currentEditingQ.options || [])];
                                    nextOpts[optIdx] = { ...nextOpts[optIdx], label: e.target.value };
                                    handleUpdateCurrentQuestion('options', nextOpts);
                                  }}
                                  className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
                                />
                                <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const nextArr = e.target.checked
                                        ? [...correctArr, opt.id]
                                        : correctArr.filter((id) => id !== opt.id);
                                      handleUpdateCurrentQuestion('correctAnswer', nextArr);
                                    }}
                                  />
                                  <span>Đúng</span>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CÂU 3: DRAG & DROP */}
                    {currentEditingQ.type === 'drag_drop' && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                        <p className="text-xs font-black text-slate-700 uppercase">
                          Thẻ từ & Đoạn văn kéo thả:
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600">Thẻ 1 (Đáp án Ô 1):</label>
                            <input
                              type="text"
                              value={currentEditingQ.dragItems?.[0] || 'THAY ĐỔI'}
                              onChange={(e) => {
                                const nextItems = [e.target.value, currentEditingQ.dragItems?.[1] || 'KHÔNG ĐỔI'];
                                handleUpdateCurrentQuestion('dragItems', nextItems);
                                handleUpdateCurrentQuestion('correctAnswer', {
                                  blank1: e.target.value,
                                  blank2: currentEditingQ.dragItems?.[1] || 'KHÔNG ĐỔI',
                                });
                              }}
                              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-blue-700"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600">Thẻ 2 (Đáp án Ô 2):</label>
                            <input
                              type="text"
                              value={currentEditingQ.dragItems?.[1] || 'KHÔNG ĐỔI'}
                              onChange={(e) => {
                                const nextItems = [currentEditingQ.dragItems?.[0] || 'THAY ĐỔI', e.target.value];
                                handleUpdateCurrentQuestion('dragItems', nextItems);
                                handleUpdateCurrentQuestion('correctAnswer', {
                                  blank1: currentEditingQ.dragItems?.[0] || 'THAY ĐỔI',
                                  blank2: e.target.value,
                                });
                              }}
                              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-emerald-700"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CÂU 4: FILL BLANK */}
                    {currentEditingQ.type === 'fill_blank' && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                        <p className="text-xs font-black text-slate-700 uppercase">Đáp án biểu thức:</p>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600">
                            Đáp án chính xác (chấp nhận 360/n, 360 / n, 360:n):
                          </label>
                          <input
                            type="text"
                            value={String(currentEditingQ.correctAnswer || '360/n')}
                            onChange={(e) => handleUpdateCurrentQuestion('correctAnswer', e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-sm font-bold text-[#2389D8]"
                          />
                        </div>
                      </div>
                    )}

                    {/* CÂU 5: MATCHING */}
                    {currentEditingQ.type === 'matching' && currentEditingQ.columnA && currentEditingQ.columnB && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                        <p className="text-xs font-black text-slate-700 uppercase">Cặp ghép đôi chính xác:</p>
                        <div className="space-y-2">
                          {currentEditingQ.columnA.map((colA) => {
                            const curMatchObj = (typeof currentEditingQ.correctAnswer === 'object' && currentEditingQ.correctAnswer !== null
                              ? currentEditingQ.correctAnswer
                              : {}) as Record<string, string>;
                            const curSelectedB = curMatchObj[colA.id] || 'C';

                            return (
                              <div key={colA.id} className="flex flex-col sm:flex-row items-center gap-2 rounded-xl bg-white p-2.5 border border-slate-200">
                                <span className="font-mono text-xs font-bold text-blue-700">[{colA.id}] {colA.text}</span>
                                <span className="text-slate-400">➔</span>
                                <select
                                  value={curSelectedB}
                                  onChange={(e) => {
                                    handleUpdateCurrentQuestion('correctAnswer', {
                                      ...curMatchObj,
                                      [colA.id]: e.target.value,
                                    });
                                  }}
                                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-emerald-800"
                                >
                                  {currentEditingQ.columnB?.map((colB) => (
                                    <option key={colB.id} value={colB.id}>
                                      [{colB.id}] {colB.text}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Giải thích đúng & sai */}
                    <div className="grid gap-3 sm:grid-cols-2 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-emerald-700">
                          Lời giải thích khi làm ĐÚNG
                        </label>
                        <textarea
                          rows={2}
                          value={currentEditingQ.explanationCorrect}
                          onChange={(e) => handleUpdateCurrentQuestion('explanationCorrect', e.target.value)}
                          className="mt-1 w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-amber-700">
                          Lời giải thích khi làm CHƯA ĐÚNG
                        </label>
                        <textarea
                          rows={2}
                          value={currentEditingQ.explanationIncorrect}
                          onChange={(e) => handleUpdateCurrentQuestion('explanationIncorrect', e.target.value)}
                          className="mt-1 w-full rounded-xl border border-amber-200 bg-amber-50/30 px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BÁO CÁO & DANH SÁCH HỌC SINH */}
              {activeTab === 'students' && (
                <div className="space-y-4">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-[#F0F8FF] p-4 text-center">
                      <p className="text-xs font-bold text-slate-500">TỔNG HỌC SINH</p>
                      <p className="text-2xl font-black text-[#2389D8] tabular-nums sm:text-3xl">
                        {students.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#F0FDF4] p-4 text-center">
                      <p className="text-xs font-bold text-slate-500">ĐẠT ĐIỂM TỐI ĐA (100)</p>
                      <p className="text-2xl font-black text-emerald-600 tabular-nums sm:text-3xl">
                        {students.filter((s) => s.total_score >= 100).length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#FFFBEB] p-4 text-center">
                      <p className="text-xs font-bold text-slate-500">ĐIỂM TRUNG BÌNH</p>
                      <p className="text-2xl font-black text-amber-800 tabular-nums sm:text-3xl">
                        {students.length > 0
                          ? Math.round(
                              students.reduce((a, s) => a + s.total_score, 0) / students.length
                            )
                          : 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#FAF5FF] p-4 text-center">
                      <p className="text-xs font-bold text-slate-500">LẦN NỘP BÀI</p>
                      <p className="text-2xl font-black text-purple-700 tabular-nums sm:text-3xl">
                        {students.reduce((a, s) => a + s.total_attempts, 0)}
                      </p>
                    </div>
                  </div>

                  {/* Filter and Export */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative min-w-[240px] flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Tìm theo tên học sinh, trường hoặc lớp..."
                        className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" />
                      <span>Xuất file Excel/CSV</span>
                    </button>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                        <tr>
                          <th className="p-3">STT</th>
                          <th className="p-3">Học sinh</th>
                          <th className="p-3">Trường · Lớp</th>
                          <th className="p-3 text-right">Tổng điểm</th>
                          <th className="p-3 text-right">Số câu đúng</th>
                          <th className="p-3 text-right">Lần nộp</th>
                          <th className="p-3 text-right">Hoạt động cuối</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-slate-400">
                              Chưa có dữ liệu học sinh nào.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((s, idx) => (
                            <tr key={s.student_id} className="hover:bg-slate-50/80">
                              <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                              <td className="p-3 font-bold text-slate-900">{s.full_name}</td>
                              <td className="p-3 text-slate-600">
                                {s.school} · Lớp {s.class_name}
                              </td>
                              <td className="p-3 text-right font-mono font-black text-[#2389D8]">
                                {s.total_score}/100
                              </td>
                              <td className="p-3 text-right font-mono text-emerald-700 font-bold">
                                {s.total_correct}/5
                              </td>
                              <td className="p-3 text-right font-mono text-slate-600">
                                {s.total_attempts}
                              </td>
                              <td className="p-3 text-right font-mono text-[11px] text-slate-400">
                                {s.last_active ? s.last_active.slice(0, 16).replace('T', ' ') : '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CÀI ĐẶT LỚP & ĐỔI MẬT KHẨU */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Cấu hình bài học */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900">Thông tin Khối lớp & Bài học</h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700">Khối lớp</label>
                        <input
                          type="text"
                          value={config.grade_level}
                          onChange={(e) => setConfig({ ...config, grade_level: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700">Môn học</label>
                        <input
                          type="text"
                          value={config.subject_name}
                          onChange={(e) => setConfig({ ...config, subject_name: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700">Tên bài học</label>
                        <input
                          type="text"
                          value={config.lesson_title}
                          onChange={(e) => setConfig({ ...config, lesson_title: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveConfig}
                      className="rounded-xl bg-[#2389D8] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E7BC4]"
                    >
                      Lưu thông tin bài học
                    </button>
                  </div>

                  {/* Đổi mật khẩu & Chia sẻ */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Chia sẻ lớp học */}
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-5">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <Cloud className="h-4 w-4 text-[#2389D8]" />
                        <span>Chia sẻ liên kết ứng dụng</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Ứng dụng đã kết nối trực tiếp với Google Sheets. Sao chép link để gửi cho học sinh làm bài:
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="mt-3 flex items-center gap-2 rounded-xl bg-[#2389D8] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1E7BC4]"
                      >
                        <ClipboardCopy className="h-4 w-4" />
                        <span>Sao chép link cho học sinh</span>
                      </button>
                    </div>

                    {/* Đổi mật khẩu giáo viên */}
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <KeyRound className="h-4 w-4 text-[#FF9850]" />
                        <span>Đổi mật khẩu giáo viên (lưu trên Apps Script)</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <input
                          type="password"
                          placeholder="Mật khẩu hiện tại"
                          value={oldPw}
                          onChange={(e) => setOldPw(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        />
                        <input
                          type="password"
                          placeholder="Mật khẩu mới (≥4 ký tự)"
                          value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleChangePassword}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Lưu mật khẩu mới
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
