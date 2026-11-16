import { useState, type FormEvent } from 'react';
import { ArrowRight, Bot, Cloud, CloudOff, Settings, Sparkles } from 'lucide-react';
import { ASSET_PATHS } from '../data/lessonData';
import { AppConfig, ConnectionMode } from '../types';

interface StudentLoginScreenProps {
  appConfig: AppConfig;
  connectionMode: ConnectionMode;
  onLogin: (data: { full_name: string; school: string; class_name: string }) => Promise<void>;
  onOpenTeacher: () => void;
}

export function StudentLoginScreen({
  appConfig,
  connectionMode,
  onLogin,
  onOpenTeacher,
}: StudentLoginScreenProps) {
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [className, setClassName] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; school?: string; className?: string; submit?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};

    const cleanName = fullName.trim();
    const cleanSchool = school.trim();
    const cleanClass = className.trim();

    if (cleanName.length < 2) {
      nextErrors.fullName = 'Vui lòng nhập họ và tên đầy đủ (tối thiểu 2 kí tự).';
    }
    if (cleanSchool.length < 2) {
      nextErrors.school = 'Vui lòng nhập tên trường của bạn.';
    }
    if (cleanClass.length < 1) {
      nextErrors.className = 'Vui lòng nhập tên lớp (ví dụ: 7A1).';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onLogin({
        full_name: cleanName,
        school: cleanSchool,
        class_name: cleanClass,
      });
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Không thể đăng nhập. Vui lòng thử lại.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#F4F9FF] px-4 py-6 sm:px-8">
      {/* Top utility bar */}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-tight text-[#2389D8]">DATA ADVENTURE</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="hidden text-sm font-medium text-slate-600 sm:inline">
            {appConfig.grade_level} · {appConfig.lesson_title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
              connectionMode === 'connected'
                ? 'bg-[#38C9B1]/15 text-[#127A69]'
                : 'bg-[#FFD34F]/30 text-amber-900'
            }`}
          >
            {connectionMode === 'connected' ? (
              <>
                <Cloud className="h-3.5 w-3.5 shrink-0" />
                <span>Đã kết nối Google Sheets</span>
              </>
            ) : (
              <>
                <CloudOff className="h-3.5 w-3.5 shrink-0" />
                <span>Chế độ DEMO / OFFLINE</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenTeacher}
            aria-label="Cài đặt dành cho giáo viên"
            title="Cài đặt dành cho giáo viên"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#2389D8] hover:text-[#2389D8] focus-visible:outline-2 focus-visible:outline-[#2389D8]"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Centered Login Card */}
      <main className="mx-auto my-6 w-full max-w-5xl">
        <div className="mb-6 text-center">
          <p className="text-sm font-bold tracking-wide text-[#2389D8]">
            {appConfig.subject_name} · {appConfig.lesson_title}
          </p>
          <h1 className="mt-1 text-balance text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            CHÀO MỪNG NHÀ THÁM HIỂM DỮ LIỆU!
          </h1>
        </div>

        <div className="grid items-stretch overflow-hidden rounded-[2rem] border border-[#2389D8]/15 bg-white card-3d md:grid-cols-12">
          {/* Left: 3D Robot Character Showcase */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#EAF4FF] via-[#F4F9FF] to-[#E6FAF6] p-8 md:col-span-5">
            <div className="relative h-52 w-52 overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-lg sm:h-60 sm:w-60">
              <img
                src={ASSET_PATHS.robot}
                alt="Robot DataBot chào mừng học sinh"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 -z-10 flex items-center justify-center bg-[#2389D8]/10 text-[#2389D8]">
                <Bot className="h-20 w-20" />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#2389D8]/20 bg-white/90 px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#2389D8]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Trợ lý DataBot</span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Nhập thông tin của bạn để mở khóa bản đồ kiến thức, phòng thí nghiệm Scratch và bảng xếp hạng toàn quốc!
              </p>
            </div>
          </div>

          {/* Right: 3 Required Fields Form */}
          <div className="flex flex-col justify-center p-6 sm:p-10 md:col-span-7">
            <h2 className="text-xl font-bold text-slate-900">Thông tin nhà thám hiểm</h2>
            <p className="mt-1 text-sm text-slate-500">
              Vui lòng điền đầy đủ cả 3 thông tin bắt buộc để lưu hồ sơ và điểm số.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="student-fullname" className="block text-sm font-semibold text-slate-700">
                  1. Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  required
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#2389D8] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2389D8]/15"
                />
                {errors.fullName && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="student-school" className="block text-sm font-semibold text-slate-700">
                  2. Trường <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-school"
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Ví dụ: THCS Chu Văn An"
                  required
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#2389D8] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2389D8]/15"
                />
                {errors.school && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.school}</p>}
              </div>

              <div>
                <label htmlFor="student-class" className="block text-sm font-semibold text-slate-700">
                  3. Lớp <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-class"
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Ví dụ: 7A1"
                  required
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#2389D8] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2389D8]/15"
                />
                {errors.className && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.className}</p>}
              </div>

              {errors.submit && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-3d mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2389D8] px-6 py-4 text-base font-bold text-white shadow-[0_6px_0_#1765A3] hover:bg-[#1E7BC4] disabled:opacity-60"
              >
                <span>{submitting ? 'Đang khởi tạo hồ sơ...' : 'BẮT ĐẦU HÀNH TRÌNH'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl text-center text-xs text-slate-500">
        DATA ADVENTURE · Ứng dụng học tập tương tác {appConfig.grade_level}
      </footer>
    </div>
  );
}
