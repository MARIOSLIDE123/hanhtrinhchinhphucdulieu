import { useState } from 'react';
import {
  CheckCircle2,
  ClipboardCopy,
  Cloud,
  Database,
  Download,
  FileSpreadsheet,
  KeyRound,
  Lock,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  changeTeacherPasswordRemote,
  fetchTeacherOverview,
  getStoredGasUrl,
  saveTeacherAppConfig,
  saveTeacherAssignment,
  saveTeacherGroups,
  saveTeacherQuestionBank,
} from '../services/apiService';
import {
  AppConfig,
  GroupAssignment,
  StudentProfile,
  TeamGroup,
  TeamQuestion,
} from '../types';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSharedDataUpdated: (data: {
    config: AppConfig;
    groups: TeamGroup[];
    assignments: GroupAssignment[];
    questionBank: TeamQuestion[];
  }) => void;
}

type TeacherTab = 'groups' | 'assignments' | 'questions' | 'data';

export function TeacherModal({ isOpen, onClose, onSharedDataUpdated }: TeacherModalProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [teacherToken, setTeacherToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TeacherTab>('groups');

  // Dashboard states
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [assignments, setAssignments] = useState<GroupAssignment[]>([]);
  const [questionBank, setQuestionBank] = useState<TeamQuestion[]>([]);
  const [config, setConfig] = useState<AppConfig>({
    grade_level: 'Tin học 7',
    subject_name: 'Tin học',
    lesson_title: 'Bài 13: Biểu diễn dữ liệu',
  });
  const [stats, setStats] = useState({ total_students: 0, completed_students: 0, total_score: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Forms inside tabs
  const [newGroupName, setNewGroupName] = useState('');
  const [editingAsm, setEditingAsm] = useState<GroupAssignment | null>(null);
  const [editingQ, setEditingQ] = useState<TeamQuestion | null>(null);

  // Change password form
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
    setGroups(overview.groups);
    setAssignments(overview.assignments);
    setQuestionBank(overview.questionBank);
    setConfig(overview.config);
    setStats(overview.stats);
    onSharedDataUpdated({
      config: overview.config,
      groups: overview.groups,
      assignments: overview.assignments,
      questionBank: overview.questionBank,
    });
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const currentUrl = getStoredGasUrl();
    if (!currentUrl) {
      setLoginError(
        'Chưa cấu hình URL Google Apps Script trong mã nguồn (HARDCODED_GAS_URL trong file src/services/apiService.ts). Bạn có thể chọn "Xem trước & cấu hình Offline" bên dưới.'
      );
      return;
    }
    setLoggingIn(true);
    try {
      const { teacherLoginRemote } = await import('../services/apiService');
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

  /* -------------------- TAB 1: GROUP MANAGEMENT -------------------- */
  const handleAddGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    const next = [
      ...groups,
      {
        group_id: `G${groups.length + 1}_${Date.now().toString(36).toUpperCase()}`,
        group_name: name,
        members: [],
        group_score: 0,
      },
    ];
    setGroups(next);
    setNewGroupName('');
  };

  const handleRenameGroup = (groupId: string, name: string) => {
    setGroups((prev) => prev.map((g) => (g.group_id === groupId ? { ...g, group_name: name } : g)));
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.group_id !== groupId));
  };

  const handleMoveStudentToGroup = (studentObj: StudentProfile, targetGroupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        const filtered = g.members.filter((m) => m.student_id !== studentObj.student_id);
        if (g.group_id === targetGroupId) {
          const nextMembers = [
            ...filtered,
            {
              student_id: studentObj.student_id,
              display_name: studentObj.display_name,
              school: studentObj.school,
              class_name: studentObj.class_name,
              total_score: studentObj.total_score,
            },
          ];
          return {
            ...g,
            members: nextMembers,
            group_score: nextMembers.reduce((sum, m) => sum + m.total_score, 0),
          };
        }
        return {
          ...g,
          members: filtered,
          group_score: filtered.reduce((sum, m) => sum + m.total_score, 0),
        };
      })
    );
  };

  const handleSaveGroups = async () => {
    if (!teacherToken) return;
    setSaving(true);
    try {
      const saved = await saveTeacherGroups(teacherToken, groups);
      setGroups(saved);
      onSharedDataUpdated({ config, groups: saved, assignments, questionBank });
      showToast('Đã lưu cấu hình nhóm thành công!');
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- TAB 2: ASSIGNMENT MANAGEMENT -------------------- */
  const handleSaveAssignment = async () => {
    if (!teacherToken || !editingAsm) return;
    setSaving(true);
    try {
      const saved = await saveTeacherAssignment(teacherToken, editingAsm);
      setAssignments(saved);
      setEditingAsm(null);
      onSharedDataUpdated({ config, groups, assignments: saved, questionBank });
      showToast('Đã lưu nhiệm vụ nhóm!');
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- TAB 3: QUESTION BANK MANAGEMENT -------------------- */
  const handleSaveQuestionItem = async () => {
    if (!teacherToken || !editingQ) return;
    setSaving(true);
    try {
      const exists = questionBank.some((q) => q.question_id === editingQ.question_id);
      const next = exists
        ? questionBank.map((q) => (q.question_id === editingQ.question_id ? editingQ : q))
        : [...questionBank, editingQ];
      const saved = await saveTeacherQuestionBank(teacherToken, next);
      setQuestionBank(saved);
      setEditingQ(null);
      onSharedDataUpdated({ config, groups, assignments, questionBank: saved });
      showToast('Đã cập nhật ngân hàng câu hỏi nhiệm vụ!');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!teacherToken) return;
    setSaving(true);
    try {
      const next = questionBank.filter((q) => q.question_id !== qId);
      const saved = await saveTeacherQuestionBank(teacherToken, next);
      setQuestionBank(saved);
      onSharedDataUpdated({ config, groups, assignments, questionBank: saved });
      showToast('Đã xóa câu hỏi.');
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- TAB 4: DATA, CONFIG, CSV & PASSWORD -------------------- */
  const handleSaveConfig = async () => {
    if (!teacherToken) return;
    setSaving(true);
    try {
      const saved = await saveTeacherAppConfig(teacherToken, config);
      setConfig(saved);
      onSharedDataUpdated({ config: saved, groups, assignments, questionBank });
      showToast('Đã lưu cấu hình môn học / khối lớp!');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    const header = ['Student ID', 'Họ và tên', 'Tên hiển thị', 'Trường', 'Lớp', 'Tổng điểm', 'Số câu đúng', 'Số lượt nộp'];
    const rows = students.map((s) => [
      s.student_id,
      `"${s.full_name.replace(/"/g, '""')}"`,
      `"${s.display_name.replace(/"/g, '""')}"`,
      `"${s.school.replace(/"/g, '""')}"`,
      `"${s.class_name.replace(/"/g, '""')}"`,
      s.total_score,
      s.total_correct,
      s.total_attempts,
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

  const handleCopyShareLink = async () => {
    const share = new URL(window.location.href.split('?')[0]);
    await navigator.clipboard.writeText(share.toString());
    showToast('Đã sao chép link lớp học cho học sinh!');
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-xs sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Khu vực Giáo viên · Quản trị & Kết nối Google Sheets
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
            aria-label="Đóng cửa sổ giáo viên"
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
            <div className="mx-auto max-w-xl space-y-6">
              {/* Teacher Login Form (Verified Server-Side at Apps Script!) */}
              <form onSubmit={handleTeacherLogin} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <Lock className="h-5 w-5 text-[#FF9850]" />
                  <span>Đăng nhập Quản trị Giáo viên</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Mật khẩu được xác thực trực tiếp và an toàn tại Google Apps Script (PropertiesService).
                </p>

                {getStoredGasUrl() ? (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Hệ thống đã kết nối trực tiếp với Google Sheets</span>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <Cloud className="h-4 w-4 shrink-0 text-amber-600" />
                      <span>Chưa gắn URL Web App vào mã nguồn</span>
                    </div>
                    <p className="mt-1 text-slate-600">
                      Dán link Web App vào hằng số <code className="font-mono font-bold text-slate-800">HARDCODED_GAS_URL</code> trong file <code className="font-mono font-bold text-slate-800">src/services/apiService.ts</code>.
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <label htmlFor="teacher-password" className="block text-xs font-bold text-slate-700">
                    Mật khẩu giáo viên (Mặc định: 2026)
                  </label>
                  <input
                    id="teacher-password"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu giáo viên (mặc định: 2026)..."
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                  />
                </div>

                {loginError && <p className="mt-2 text-xs font-bold text-rose-600">{loginError}</p>}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="submit"
                    disabled={loggingIn}
                    className="btn-3d rounded-xl bg-[#2389D8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1E7BC4] disabled:opacity-60"
                  >
                    {loggingIn ? 'Đang xác thực...' : 'Đăng nhập quản trị'}
                  </button>

                  <button
                    type="button"
                    onClick={handleOfflinePreview}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Xem trước & cấu hình Offline
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {/* Admin Tabs */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'groups' as const, label: '1. Quản lý Nhóm', Icon: Users },
                    { id: 'assignments' as const, label: '2. Quản lý Nhiệm vụ', Icon: FileSpreadsheet },
                    { id: 'questions' as const, label: '3. Câu hỏi Nhiệm vụ nhóm', Icon: Plus },
                    { id: 'data' as const, label: '4. Dữ liệu & Cài đặt', Icon: Database },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                        activeTab === t.id
                          ? 'bg-[#2389D8] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <t.Icon className="h-3.5 w-3.5" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => loadDashboard(teacherToken)}
                  className="text-xs font-bold text-[#2389D8] hover:underline"
                >
                  Tải lại dữ liệu từ máy chủ
                </button>
              </div>

              {/* TAB 1: GROUPS */}
              {activeTab === 'groups' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Tên nhóm mới (ví dụ: NHÓM 5 – SIÊU NHÂN DỮ LIỆU)"
                        className="w-full max-w-md rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddGroup}
                        className="flex items-center gap-1 rounded-xl bg-[#38C9B1] px-4 py-2 text-xs font-bold text-white"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Thêm nhóm</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveGroups}
                      className="flex items-center gap-1.5 rounded-xl bg-[#2389D8] px-4 py-2 text-xs font-bold text-white"
                    >
                      <Save className="h-4 w-4" />
                      <span>Lưu danh sách nhóm</span>
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {groups.map((grp) => (
                      <div key={grp.group_id} className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={grp.group_name}
                            onChange={(e) => handleRenameGroup(grp.group_id, e.target.value)}
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(grp.group_id)}
                            className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                            title="Xóa nhóm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="mt-2 text-xs font-bold text-slate-500">
                          Thành viên ({grp.members.length}):
                        </p>
                        <ul className="mt-1.5 space-y-1 text-xs">
                          {grp.members.map((m) => (
                            <li key={m.student_id} className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5">
                              <span>
                                {m.display_name} ({m.class_name})
                              </span>
                              <span className="font-mono font-bold text-[#2389D8]">{m.total_score}đ</span>
                            </li>
                          ))}
                          {grp.members.length === 0 && (
                            <li className="text-slate-400">Chưa có thành viên.</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Full Student List + Assign to Group */}
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Toàn bộ học sinh đã đăng nhập ({students.length}) · Phân nhóm nhanh
                    </h3>
                    {students.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-500">Chưa có học sinh nào đăng nhập.</p>
                    ) : (
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="py-2 pr-3">Họ và tên đầy đủ</th>
                              <th className="py-2 pr-3">Trường</th>
                              <th className="py-2 pr-3">Lớp</th>
                              <th className="py-2 pr-3">Điểm</th>
                              <th className="py-2">Chuyển vào nhóm</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {students.map((st) => {
                              const currentGrp = groups.find((g) =>
                                g.members.some((m) => m.student_id === st.student_id)
                              );
                              return (
                                <tr key={st.student_id}>
                                  <td className="py-2 pr-3 font-bold text-slate-900">{st.full_name}</td>
                                  <td className="py-2 pr-3 text-slate-600">{st.school}</td>
                                  <td className="py-2 pr-3 text-slate-600">{st.class_name}</td>
                                  <td className="py-2 pr-3 font-mono font-bold text-[#2389D8]">
                                    {st.total_score}
                                  </td>
                                  <td className="py-2">
                                    <select
                                      value={currentGrp?.group_id || ''}
                                      onChange={(e) => handleMoveStudentToGroup(st, e.target.value)}
                                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold"
                                    >
                                      <option value="">-- Chưa phân nhóm --</option>
                                      {groups.map((g) => (
                                        <option key={g.group_id} value={g.group_id}>
                                          {g.group_name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ASSIGNMENTS */}
              {activeTab === 'assignments' && (
                <div className="space-y-5">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900">Danh sách nhiệm vụ đồng đội</h3>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingAsm({
                          assignment_id: `ASM_${Date.now().toString(36).toUpperCase()}`,
                          group_id: groups[0]?.group_id || 'G1',
                          title: 'NHIỆM VỤ MỚI',
                          description: '',
                          questions: ['Yêu cầu 1'],
                          max_score: 30,
                          status: 'Đang mở',
                        })
                      }
                      className="flex items-center gap-1 rounded-xl bg-[#38C9B1] px-4 py-2 text-xs font-bold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tạo nhiệm vụ mới</span>
                    </button>
                  </div>

                  {editingAsm && (
                    <div className="space-y-3 rounded-2xl border border-[#2389D8]/30 bg-[#F8FBFF] p-5">
                      <h4 className="text-sm font-extrabold text-[#2389D8]">
                        Chỉnh sửa nhiệm vụ ({editingAsm.assignment_id})
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-bold text-slate-700">
                          Tiêu đề nhiệm vụ
                          <input
                            type="text"
                            value={editingAsm.title}
                            onChange={(e) => setEditingAsm({ ...editingAsm, title: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-700">
                          Nhóm được giao
                          <select
                            value={editingAsm.group_id}
                            onChange={(e) => setEditingAsm({ ...editingAsm, group_id: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            {groups.map((g) => (
                              <option key={g.group_id} value={g.group_id}>
                                {g.group_name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label className="block text-xs font-bold text-slate-700">
                        Nội dung mô tả nhiệm vụ
                        <textarea
                          rows={3}
                          value={editingAsm.description}
                          onChange={(e) => setEditingAsm({ ...editingAsm, description: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>

                      <label className="block text-xs font-bold text-slate-700">
                        Các yêu cầu thực hiện (mỗi dòng một yêu cầu)
                        <textarea
                          rows={3}
                          value={editingAsm.questions.join('\n')}
                          onChange={(e) =>
                            setEditingAsm({
                              ...editingAsm,
                              questions: e.target.value.split('\n').filter(Boolean),
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-bold text-slate-700">
                          Điểm tối đa
                          <input
                            type="number"
                            value={editingAsm.max_score}
                            onChange={(e) =>
                              setEditingAsm({ ...editingAsm, max_score: Number(e.target.value) || 10 })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-700">
                          Trạng thái
                          <select
                            value={editingAsm.status}
                            onChange={(e) => setEditingAsm({ ...editingAsm, status: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="Đang mở">Đang mở</option>
                            <option value="Đã hoàn thành">Đã hoàn thành</option>
                          </select>
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={handleSaveAssignment}
                          className="rounded-xl bg-[#2389D8] px-4 py-2 text-xs font-bold text-white"
                        >
                          Lưu lên hệ thống
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAsm(null)}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    {assignments.map((asm) => (
                      <div key={asm.assignment_id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between text-xs font-bold text-[#2389D8]">
                          <span>
                            {asm.assignment_id} · Giao cho {asm.group_id}
                          </span>
                          <span>{asm.max_score}đ</span>
                        </div>
                        <h4 className="mt-1 text-base font-extrabold text-slate-900">{asm.title}</h4>
                        <p className="mt-1 text-xs text-slate-600">{asm.description}</p>
                        <button
                          type="button"
                          onClick={() => setEditingAsm(asm)}
                          className="mt-3 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                        >
                          Chỉnh sửa nhiệm vụ
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: QUESTION BANK */}
              {activeTab === 'questions' && (
                <div className="space-y-5">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Câu hỏi nhiệm vụ nhóm ({questionBank.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingQ({
                          question_id: `TQ_${Date.now().toString(36).toUpperCase()}`,
                          assignment_id: assignments[0]?.assignment_id || 'ASM_1',
                          question_text: '',
                          question_type: 'single_choice',
                          options: ['Đáp án A', 'Đáp án B', 'Đáp án C'],
                          correct_answer: 'Đáp án A',
                          points: 15,
                          explanation: '',
                        })
                      }
                      className="flex items-center gap-1 rounded-xl bg-[#38C9B1] px-4 py-2 text-xs font-bold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Thêm câu hỏi mới</span>
                    </button>
                  </div>

                  {editingQ && (
                    <div className="space-y-3 rounded-2xl border border-[#2389D8]/30 bg-[#F8FBFF] p-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-bold text-slate-700">
                          Thuộc nhiệm vụ
                          <select
                            value={editingQ.assignment_id}
                            onChange={(e) => setEditingQ({ ...editingQ, assignment_id: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            {assignments.map((a) => (
                              <option key={a.assignment_id} value={a.assignment_id}>
                                {a.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs font-bold text-slate-700">
                          Điểm câu hỏi
                          <input
                            type="number"
                            value={editingQ.points}
                            onChange={(e) => setEditingQ({ ...editingQ, points: Number(e.target.value) || 10 })}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </label>
                      </div>

                      <label className="block text-xs font-bold text-slate-700">
                        Nội dung câu hỏi
                        <input
                          type="text"
                          value={editingQ.question_text}
                          onChange={(e) => setEditingQ({ ...editingQ, question_text: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>

                      <label className="block text-xs font-bold text-slate-700">
                        Các lựa chọn (ngăn cách bởi dấu phẩy)
                        <input
                          type="text"
                          value={editingQ.options.join(', ')}
                          onChange={(e) =>
                            setEditingQ({
                              ...editingQ,
                              options: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-bold text-slate-700">
                          Đáp án đúng (khớp chính xác lựa chọn)
                          <input
                            type="text"
                            value={editingQ.correct_answer}
                            onChange={(e) => setEditingQ({ ...editingQ, correct_answer: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-700">
                          Giải thích đáp án
                          <input
                            type="text"
                            value={editingQ.explanation}
                            onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={handleSaveQuestionItem}
                          className="rounded-xl bg-[#2389D8] px-4 py-2 text-xs font-bold text-white"
                        >
                          Lưu câu hỏi
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingQ(null)}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {questionBank.map((q) => (
                      <div key={q.question_id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#2389D8]">
                            {q.assignment_id} · {q.points} điểm
                          </p>
                          <p className="mt-0.5 text-sm font-bold text-slate-900">{q.question_text}</p>
                          <p className="mt-0.5 text-xs text-slate-500">Đáp án đúng: {q.correct_answer}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingQ(q)}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.question_id)}
                            className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: DATA, CONFIG, EXPORT & PASSWORD */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  {/* KPI Strip */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4">
                      <p className="text-xs font-bold text-slate-500">Tổng số học sinh tham gia</p>
                      <p className="mt-1 text-2xl font-extrabold text-[#2389D8] tabular-nums">
                        {stats.total_students}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4">
                      <p className="text-xs font-bold text-slate-500">Số học sinh hoàn thành (≥10 câu)</p>
                      <p className="mt-1 text-2xl font-extrabold text-[#38C9B1] tabular-nums">
                        {stats.completed_students}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4">
                      <p className="text-xs font-bold text-slate-500">Tổng điểm toàn hệ thống</p>
                      <p className="mt-1 text-2xl font-extrabold text-[#FF9850] tabular-nums">
                        {stats.total_score}
                      </p>
                    </div>
                  </div>

                  {/* Editable Grade / Subject / Lesson */}
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Cấu hình Khối lớp & Môn học (hiển thị toàn ứng dụng)
                    </h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <label className="text-xs font-bold text-slate-700">
                        Khối lớp
                        <input
                          type="text"
                          value={config.grade_level}
                          onChange={(e) => setConfig({ ...config, grade_level: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-700">
                        Môn học
                        <input
                          type="text"
                          value={config.subject_name}
                          onChange={(e) => setConfig({ ...config, subject_name: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-700">
                        Bài học
                        <input
                          type="text"
                          value={config.lesson_title}
                          onChange={(e) => setConfig({ ...config, lesson_title: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveConfig}
                      className="mt-3 rounded-xl bg-[#2389D8] px-4 py-2 text-xs font-bold text-white"
                    >
                      Lưu cấu hình lớp học
                    </button>
                  </div>

                  {/* Google Sheets Status & Share Link + Password */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-5">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <Cloud className="h-4 w-4 text-[#2389D8]" />
                        <span>Cơ sở dữ liệu Google Sheets & Chia sẻ</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        Mã Google Sheets đã được tích hợp trực tiếp vào mã nguồn hệ thống. Dữ liệu học sinh, điểm số, danh sách đội và câu hỏi nhiệm vụ được lưu tự động trên cùng trang tính.
                      </p>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={handleCopyShareLink}
                          className="flex items-center gap-1.5 rounded-xl bg-[#2389D8] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1E7BC4]"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          <span>Sao chép link chia sẻ cho học sinh</span>
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <KeyRound className="h-4 w-4 text-[#FF9850]" />
                        <span>Đổi mật khẩu giáo viên (lưu trên Apps Script)</span>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <input
                          type="password"
                          placeholder="Mật khẩu hiện tại"
                          value={oldPw}
                          onChange={(e) => setOldPw(e.target.value)}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        />
                        <input
                          type="password"
                          placeholder="Mật khẩu mới (≥4 kí tự)"
                          value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        className="mt-3 rounded-xl bg-[#FF9850] px-4 py-2 text-xs font-bold text-white"
                      >
                        Cập nhật mật khẩu
                      </button>
                    </div>
                  </div>

                  {/* Export CSV */}
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Bảng điểm toàn hệ thống</h3>
                      <p className="text-xs text-slate-500">Xuất danh sách học sinh, trường, lớp và điểm số ra CSV.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="flex items-center gap-1.5 rounded-xl bg-[#38C9B1] px-4 py-2 text-xs font-bold text-white"
                    >
                      <Download className="h-4 w-4" />
                      <span>Xuất dữ liệu CSV</span>
                    </button>
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
