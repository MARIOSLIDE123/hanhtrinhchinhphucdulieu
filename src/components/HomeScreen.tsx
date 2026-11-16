import {
  Award,
  BookOpen,
  Compass,
  LogOut,
  Map as MapIcon,
  Settings,
  Star,
  Trophy,
  Users,
  Cloud,
  CloudOff,
} from 'lucide-react';
import { ASSET_PATHS, CHALLENGE_QUESTIONS } from '../data/lessonData';
import { getShortStudentName } from '../services/apiService';
import { AppConfig, AttemptRecord, BadgeInfo, ConnectionMode, StudentProfile, ZoneId } from '../types';
import { DataBotGuide } from './DataBotGuide';

interface HomeScreenProps {
  student: StudentProfile;
  attempts: AttemptRecord[];
  badges: BadgeInfo[];
  progressPercent: number;
  appConfig: AppConfig;
  connectionMode: ConnectionMode;
  onSelectZone: (zone: ZoneId) => void;
  onOpenTeacher: () => void;
  onSwitchStudent: () => void;
}

export function HomeScreen({
  student,
  attempts,
  badges,
  progressPercent,
  appConfig,
  connectionMode,
  onSelectZone,
  onOpenTeacher,
  onSwitchStudent,
}: HomeScreenProps) {
  const shortName = getShortStudentName(student.full_name);
  const unlockedBadges = badges.filter((b) => b.unlocked);
  const currentBadge = unlockedBadges[unlockedBadges.length - 1] || badges[0];

  const passedIds = new Set(attempts.filter((a) => a.is_correct).map((a) => a.question_id));
  const stagesDone = ['STAGE_1', 'STAGE_2', 'STAGE_3'].filter((id) => passedIds.has(id)).length;
  const challengesDone = CHALLENGE_QUESTIONS.filter((q) => passedIds.has(q.id)).length;

  const zones: {
    id: ZoneId;
    title: string;
    subtitle: string;
    stat: string;
    image: string;
    accent: string;
    bgAccent: string;
  }[] = [
    {
      id: 'learn',
      title: '1. KHÁM PHÁ KIẾN THỨC',
      subtitle: '3 chặng học tập & Phòng thí nghiệm Scratch',
      stat: `${stagesDone}/3 chặng hoàn thành`,
      image: ASSET_PATHS.mapLearn,
      accent: '#2389D8',
      bgAccent: 'from-[#2389D8]/12 to-[#38C9B1]/12',
    },
    {
      id: 'review',
      title: '2. ÔN TẬP',
      subtitle: 'Bản đồ tư duy, thẻ ghi nhớ & ôn tập nhanh',
      stat: '7 thẻ ghi nhớ · 6 nhánh tư duy',
      image: ASSET_PATHS.mapReview,
      accent: '#38C9B1',
      bgAccent: 'from-[#38C9B1]/12 to-[#FFD34F]/15',
    },
    {
      id: 'challenge',
      title: '3. THỬ THÁCH SGK',
      subtitle: 'Nhóm A, B, C, Thực hành & 5 câu mở rộng',
      stat: `${challengesDone}/${CHALLENGE_QUESTIONS.length} thử thách đã vượt qua`,
      image: ASSET_PATHS.mapChallenge,
      accent: '#FF9850',
      bgAccent: 'from-[#FF9850]/12 to-[#FFD34F]/15',
    },
    {
      id: 'leaderboard',
      title: '4. ĐẤU TRƯỜNG DỮ LIỆU',
      subtitle: 'Bảng xếp hạng toàn quốc & bục vinh danh 3D',
      stat: connectionMode === 'connected' ? 'Đồng bộ trực tuyến' : 'Chế độ DEMO / OFFLINE',
      image: ASSET_PATHS.mapLeaderboard,
      accent: '#A88BFA',
      bgAccent: 'from-[#A88BFA]/15 to-[#2389D8]/10',
    },
    {
      id: 'team',
      title: '5. NHIỆM VỤ ĐỒNG ĐỘI',
      subtitle: 'Đấu trường 4 nhóm cùng chinh phục dữ liệu',
      stat: '4 đội thám hiểm · Nhiệm vụ nhóm',
      image: ASSET_PATHS.mapTeam,
      accent: '#FF8EAA',
      bgAccent: 'from-[#FF8EAA]/15 to-[#A88BFA]/12',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F9FF] pb-8">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
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
            <div className="hidden items-center gap-4 text-sm md:flex">
              <div className="text-right">
                <p className="font-bold text-slate-900">{student.full_name}</p>
                <p className="text-xs text-slate-500">
                  {student.school} · Lớp {student.class_name}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5 rounded-xl bg-[#FFD34F]/25 px-3 py-1.5 font-bold text-amber-900 tabular-nums">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{student.total_score} điểm</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-[#A88BFA]/15 px-3 py-1.5 text-xs font-bold text-purple-900">
                <Award className="h-4 w-4 text-[#A88BFA]" />
                <span>{currentBadge.title}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectZone('leaderboard')}
              className="btn-3d flex items-center gap-1.5 rounded-xl bg-[#2389D8] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1D78BF] whitespace-nowrap"
            >
              <Trophy className="h-4 w-4" />
              <span>Bảng xếp hạng</span>
            </button>

            <button
              type="button"
              onClick={onSwitchStudent}
              title="Đổi học sinh"
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Đổi tài khoản</span>
            </button>

            <button
              type="button"
              onClick={onOpenTeacher}
              aria-label="Cài đặt Giáo viên"
              title="Cài đặt Giáo viên"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-[#2389D8] hover:text-[#2389D8]"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Mobile Student Info Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 md:hidden">
          <div>
            <p className="text-sm font-bold text-slate-900">{student.full_name}</p>
            <p className="text-xs text-slate-500">
              {student.school} · Lớp {student.class_name}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="rounded-lg bg-[#FFD34F]/30 px-2.5 py-1 text-amber-900 tabular-nums">
              {student.total_score} điểm
            </span>
            <span className="rounded-lg bg-[#A88BFA]/15 px-2.5 py-1 text-purple-900">{currentBadge.title}</span>
          </div>
        </div>

        {/* Greeting + Progress Row */}
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <DataBotGuide
              mood="happy"
              message={`Xin chào ${shortName}! Chào mừng bạn đến với DATA ADVENTURE! Hãy chọn một khu vực trên bản đồ bên dưới để chinh phục Bài 13 nhé.`}
            />
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 card-3d lg:col-span-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Tiến trình hoàn thành bài học</h2>
                <p className="text-xs text-slate-500">
                  {stagesDone}/3 chặng học · {challengesDone}/{CHALLENGE_QUESTIONS.length} thử thách SGK
                </p>
              </div>
              <span className="text-2xl font-extrabold text-[#2389D8] tabular-nums">{progressPercent}%</span>
            </div>

            <div className="mt-3 h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2389D8] via-[#38C9B1] to-[#FFD34F] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                <Award className="h-4 w-4 text-[#FF9850]" />
                <span>
                  Huy hiệu: {unlockedBadges.length}/{badges.length} đã mở khóa
                </span>
              </div>
              <div
                className={`flex items-center gap-1 font-semibold ${
                  connectionMode === 'connected' ? 'text-[#127A69]' : 'text-amber-700'
                }`}
              >
                {connectionMode === 'connected' ? (
                  <>
                    <Cloud className="h-3.5 w-3.5" />
                    <span>Google Sheets</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-3.5 w-3.5" />
                    <span>DEMO / OFFLINE</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Adventure Map 5 Zones */}
        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-[#2389D8]" />
              <h2 className="text-xl font-extrabold text-slate-900">Bản đồ hành trình DATA ADVENTURE</h2>
            </div>
            <span className="hidden text-xs font-medium text-slate-500 sm:inline">
              Chọn một khu vực để bắt đầu
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => onSelectZone(zone.id)}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-left card-3d transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[#2389D8]"
              >
                <div className={`relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br ${zone.bgAccent}`}>
                  <img
                    src={zone.image}
                    alt={zone.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 -z-10 flex items-center justify-center text-slate-400">
                    {zone.id === 'learn' && <BookOpen className="h-12 w-12" />}
                    {zone.id === 'review' && <Compass className="h-12 w-12" />}
                    {zone.id === 'challenge' && <Star className="h-12 w-12" />}
                    {zone.id === 'leaderboard' && <Trophy className="h-12 w-12" />}
                    {zone.id === 'team' && <Users className="h-12 w-12" />}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#2389D8]">
                      {zone.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{zone.subtitle}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold">
                    <span className="text-slate-500">{zone.stat}</span>
                    <span style={{ color: zone.accent }}>Khám phá →</span>
                  </div>
                </div>
              </button>
            ))}

            {/* Badges Summary Card as 6th balanced grid slot */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 card-3d">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-slate-900">Bộ sưu tập huy hiệu</h3>
                  <span className="text-xs font-bold text-[#2389D8] tabular-nums">
                    {unlockedBadges.length}/{badges.length}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Hoàn thành các chặng và thử thách để mở khóa toàn bộ.</p>

                <ul className="mt-4 space-y-2">
                  {badges.map((b) => (
                    <li
                      key={b.id}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold ${
                        b.unlocked ? 'bg-slate-50 text-slate-900' : 'bg-slate-50/50 text-slate-400'
                      }`}
                    >
                      <Award
                        className="h-4 w-4 shrink-0"
                        style={{ color: b.unlocked ? b.color : '#CBD5E1' }}
                      />
                      <span className="truncate">{b.title}</span>
                      <span className="ml-auto text-[11px]">{b.unlocked ? 'Đã đạt' : 'Chưa mở'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
