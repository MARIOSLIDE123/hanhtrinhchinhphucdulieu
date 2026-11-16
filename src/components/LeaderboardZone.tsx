import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CloudOff, Crown, Medal, RefreshCw, Trophy } from 'lucide-react';
import { fetchLeaderboard, getShortStudentName } from '../services/apiService';
import { ConnectionMode, LeaderboardEntry, StudentProfile } from '../types';
import { ScratchCatGuide, ScratchCatMood } from './ScratchCatGuide';

interface LeaderboardZoneProps {
  student: StudentProfile;
  connectionMode: ConnectionMode;
  onBack: () => void;
}

export function LeaderboardZone({ student, connectionMode, onBack }: LeaderboardZoneProps) {
  const shortName = getShortStudentName(student.full_name);
  const [tab, setTab] = useState<'top10' | 'top50' | 'mine'>('top10');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(connectionMode === 'connected');
  const [top10, setTop10] = useState<LeaderboardEntry[]>([]);
  const [top50, setTop50] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLeaderboard(student.student_id);
      setConnected(res.synced ?? true);
      setTop10(res.top10 || []);
      setTop50(res.top50 || []);
      setMyRank(res.myRank || null);
      setTotalStudents(res.totalStudents || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải bảng xếp hạng');
    } finally {
      setLoading(false);
    }
  }, [student.student_id]);

  useEffect(() => {
    loadData();
    if (connectionMode !== 'connected') return;
    const timer = window.setInterval(() => {
      loadData();
    }, 20000);
    return () => window.clearInterval(timer);
  }, [loadData, connectionMode]);

  const catMood: ScratchCatMood = myRank ? 'cheering' : 'happy';
  const botMessage = myRank
    ? `Chúc mừng ${shortName}, bạn đã lọt vào bảng xếp hạng với vị trí #${myRank.rank} (${myRank.total_score} điểm)!`
    : connected
      ? `Hãy hoàn thành thêm thử thách để ghi tên mình lên bảng xếp hạng toàn quốc nhé ${shortName}!`
      : `Hiện đang ở chế độ DEMO / OFFLINE. Cần cấu hình URL Google Apps Script trong mã nguồn để bật Bảng xếp hạng trực tuyến cho tất cả các trường!`;

  const visibleRows = tab === 'top10' ? top10 : tab === 'top50' ? top50 : myRank ? [myRank] : [];
  const podiumTop3 = top10.slice(0, 3);

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
                Khu vực 4 · Đấu trường dữ liệu toàn quốc
              </h1>
              <p className="text-xs text-slate-500">
                {connected
                  ? `Tự động cập nhật mỗi 20 giây · ${totalStudents} học sinh tham gia`
                  : 'Chế độ DEMO / OFFLINE'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="btn-3d flex items-center gap-1.5 rounded-xl bg-[#2389D8] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E7BC4] disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        <ScratchCatGuide message={botMessage} mood={catMood} compact />

        {!connected ? (
          <div className="rounded-3xl border border-amber-200 bg-white p-10 text-center card-3d">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFD34F]/25 text-amber-800">
              <CloudOff className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-slate-900">
              Chế độ DEMO / OFFLINE – Chưa kết nối Google Sheets
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
              Bảng xếp hạng toàn quốc chỉ hiển thị dữ liệu thực tế từ Google Sheets dùng chung giữa các trường.
              Giáo viên vui lòng nhấn biểu tượng bánh răng cài đặt để dán URL Google Apps Script Web App.
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-800">
            Lỗi tải bảng xếp hạng: {error}
          </div>
        ) : totalStudents === 0 && !loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center card-3d">
            <Trophy className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-3 text-lg font-extrabold text-slate-900">Chưa có học sinh tham gia</h2>
            <p className="mt-1 text-sm text-slate-500">
              Hãy là người đầu tiên chinh phục các thử thách để xuất hiện trên bục vinh danh 3D!
            </p>
          </div>
        ) : (
          <>
            {/* 3D Podium Top 3 */}
            {podiumTop3.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-[#EAF4FF] p-6 card-3d">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-slate-900">Bục vinh danh 3D · Top 3 xuất sắc nhất</h2>
                  {lastUpdated && (
                    <span className="text-xs text-slate-500">
                      Cập nhật: {new Date(lastUpdated).toLocaleTimeString('vi-VN')}
                    </span>
                  )}
                </div>

                <div className="mt-8 flex flex-col items-end justify-center gap-4 sm:flex-row sm:gap-6">
                  {/* Rank 2 - Left */}
                  {podiumTop3[1] && (
                    <div className="order-2 flex w-full flex-col items-center sm:order-1 sm:w-56">
                      <div className="mb-3 text-center">
                        <Medal className="mx-auto h-7 w-7 text-slate-400" />
                        <p className="mt-1 font-extrabold text-slate-900">{podiumTop3[1].display_name}</p>
                        <p className="text-xs text-slate-500">
                          {podiumTop3[1].school} · {podiumTop3[1].class_name}
                        </p>
                      </div>
                      <div className="flex h-28 w-full flex-col items-center justify-center rounded-t-3xl bg-gradient-to-b from-slate-200 to-slate-300 text-slate-800 shadow-inner">
                        <span className="text-2xl font-extrabold">#2</span>
                        <span className="font-mono text-sm font-bold tabular-nums">
                          {podiumTop3[1].total_score} điểm
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Rank 1 - Center Tall */}
                  {podiumTop3[0] && (
                    <div className="order-1 flex w-full flex-col items-center sm:order-2 sm:w-64">
                      <div className="mb-3 text-center">
                        <Crown className="mx-auto h-9 w-9 text-[#F59E0B]" />
                        <p className="mt-1 text-lg font-extrabold text-slate-900">{podiumTop3[0].display_name}</p>
                        <p className="text-xs text-slate-500">
                          {podiumTop3[0].school} · {podiumTop3[0].class_name}
                        </p>
                      </div>
                      <div className="flex h-36 w-full flex-col items-center justify-center rounded-t-3xl bg-gradient-to-b from-[#FFD34F] to-[#F59E0B] text-amber-950 shadow-md">
                        <span className="text-3xl font-extrabold">#1</span>
                        <span className="font-mono text-base font-extrabold tabular-nums">
                          {podiumTop3[0].total_score} điểm
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 - Right */}
                  {podiumTop3[2] && (
                    <div className="order-3 flex w-full flex-col items-center sm:w-56">
                      <div className="mb-3 text-center">
                        <Medal className="mx-auto h-7 w-7 text-[#D97706]" />
                        <p className="mt-1 font-extrabold text-slate-900">{podiumTop3[2].display_name}</p>
                        <p className="text-xs text-slate-500">
                          {podiumTop3[2].school} · {podiumTop3[2].class_name}
                        </p>
                      </div>
                      <div className="flex h-24 w-full flex-col items-center justify-center rounded-t-3xl bg-gradient-to-b from-[#FF9850] to-[#EA782E] text-white shadow-inner">
                        <span className="text-2xl font-extrabold">#3</span>
                        <span className="font-mono text-sm font-bold tabular-nums">
                          {podiumTop3[2].total_score} điểm
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Tabs + Table */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 card-3d">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
                  {[
                    { id: 'top10' as const, label: 'TOP 10' },
                    { id: 'top50' as const, label: 'TOP 50' },
                    { id: 'mine' as const, label: 'Vị trí của tôi' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                        tab === item.id
                          ? 'bg-white text-[#2389D8] shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Tên hiển thị rút gọn nhằm bảo vệ quyền riêng tư học sinh
                </span>
              </div>

              {visibleRows.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  {tab === 'mine'
                    ? 'Hồ sơ của bạn chưa xuất hiện trên bảng xếp hạng máy chủ.'
                    : 'Chưa có dữ liệu.'}
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 pr-4 font-bold">Thứ hạng</th>
                        <th className="py-3 pr-4 font-bold">Tên hiển thị</th>
                        <th className="py-3 pr-4 font-bold">Trường</th>
                        <th className="py-3 pr-4 font-bold">Lớp</th>
                        <th className="py-3 pr-4 font-bold">Tổng điểm</th>
                        <th className="py-3 font-bold">Số thử thách đã hoàn thành</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleRows.map((entry) => {
                        const isMe = entry.student_id === student.student_id;
                        return (
                          <tr key={entry.student_id} className={isMe ? 'bg-[#2389D8]/8 font-bold' : ''}>
                            <td className="py-3 pr-4 font-mono font-extrabold text-[#2389D8] tabular-nums">
                              #{entry.rank}
                            </td>
                            <td className="py-3 pr-4 font-bold text-slate-900">
                              {entry.display_name} {isMe ? '(Bạn)' : ''}
                            </td>
                            <td className="py-3 pr-4 text-slate-600">{entry.school}</td>
                            <td className="py-3 pr-4 text-slate-600">{entry.class_name}</td>
                            <td className="py-3 pr-4 font-mono font-extrabold text-amber-700 tabular-nums">
                              {entry.total_score}
                            </td>
                            <td className="py-3 font-mono text-slate-700 tabular-nums">
                              {entry.total_correct}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
