/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { DEFAULT_VAN_DUNG_QUESTIONS } from './data/lessonData';
import {
  computeBadges,
  computeLessonProgress,
  DEFAULT_CONFIG,
  fetchInitialSharedData,
  getConnectionMode,
  loadLocalAttempts,
  loadLocalStudent,
  registerStudent,
  saveLocalAttempts,
  saveLocalStudent,
  submitAnswer,
  syncExistingStudentProfile,
} from './services/apiService';
import {
  AppConfig,
  AttemptRecord,
  ConnectionMode,
  GradeFeedback,
  StudentProfile,
  VanDungQuestion,
  ZoneId,
} from './types';
import { ConfettiBurst } from './components/ConfettiBurst';
import { HomeScreen } from './components/HomeScreen';
import { LeaderboardZone } from './components/LeaderboardZone';
import { StudentLoginScreen } from './components/StudentLoginScreen';
import { StudentProfileModal } from './components/StudentProfileModal';
import { TeacherModal } from './components/TeacherModal';
import { VanDungZone } from './components/VanDungZone';

export default function App() {
  const [student, setStudent] = useState<StudentProfile | null>(() => loadLocalStudent());
  const [attempts, setAttempts] = useState<AttemptRecord[]>(() => loadLocalAttempts());
  const [activeZone, setActiveZone] = useState<ZoneId>('home');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(() => getConnectionMode());
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [vanDungQuestions, setVanDungQuestions] = useState<VanDungQuestion[]>(DEFAULT_VAN_DUNG_QUESTIONS);

  useEffect(() => {
    fetchInitialSharedData().then((shared) => {
      setAppConfig(shared.config);
      if (shared.vanDungQuestions && shared.vanDungQuestions.length > 0) {
        setVanDungQuestions(shared.vanDungQuestions);
      }
      setConnectionMode(getConnectionMode());
    });
  }, []);

  useEffect(() => {
    if (!student) return;
    syncExistingStudentProfile(student).then((res) => {
      setStudent(res.student);
      setAttempts(res.attempts);
    });
  }, []);

  const handleLogin = async (input: { full_name: string; school: string; class_name: string }) => {
    const res = await registerStudent(input);
    setStudent(res.student);
    setAttempts(res.attempts);
    setConnectionMode(getConnectionMode());
    setActiveZone('home');
    setConfettiTrigger((c) => c + 1);
  };

  const handleSwitchStudent = () => {
    saveLocalStudent(null);
    saveLocalAttempts([]);
    setStudent(null);
    setAttempts([]);
    setActiveZone('home');
    setProfileModalOpen(false);
  };

  const handleSubmitAnswer = async (params: {
    question_id: string;
    question_type: string;
    answer: unknown;
    duration: number;
  }): Promise<GradeFeedback> => {
    if (!student) {
      return {
        ok: false,
        is_correct: false,
        score: 0,
        awarded_delta: 0,
        max_score: 20,
        explanation: 'Chưa đăng nhập học sinh.',
        error: 'Chưa đăng nhập học sinh.',
      };
    }
    const res = await submitAnswer({
      student,
      ...params,
      customQuestions: vanDungQuestions,
    });
    setStudent(res.updatedStudent);
    setAttempts(res.attempts);
    if (res.feedback.is_correct && res.feedback.awarded_delta > 0) {
      setConfettiTrigger((c) => c + 1);
    }
    return res.feedback;
  };

  const badges = computeBadges(student, attempts);
  const progressPercent = computeLessonProgress(attempts);

  return (
    <>
      <ConfettiBurst trigger={confettiTrigger} />

      {!student ? (
        <StudentLoginScreen
          appConfig={appConfig}
          connectionMode={connectionMode}
          onLogin={handleLogin}
          onOpenTeacher={() => setTeacherModalOpen(true)}
        />
      ) : activeZone === 'home' ? (
        <HomeScreen
          student={student}
          attempts={attempts}
          badges={badges}
          progressPercent={progressPercent}
          appConfig={appConfig}
          connectionMode={connectionMode}
          questions={vanDungQuestions}
          onSelectZone={(z) => setActiveZone(z)}
          onOpenTeacher={() => setTeacherModalOpen(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
          onSwitchStudent={handleSwitchStudent}
        />
      ) : activeZone === 'vandung' ? (
        <VanDungZone
          student={student}
          attempts={attempts}
          questions={vanDungQuestions}
          onBack={() => setActiveZone('home')}
          onGoToLeaderboard={() => setActiveZone('leaderboard')}
          onOpenProfile={() => setProfileModalOpen(true)}
          onSubmitAnswer={handleSubmitAnswer}
        />
      ) : (
        <LeaderboardZone
          student={student}
          connectionMode={connectionMode}
          onBack={() => setActiveZone('home')}
        />
      )}

      {student && (
        <StudentProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          student={student}
          attempts={attempts}
          badges={badges}
          questions={vanDungQuestions}
          onSwitchStudent={handleSwitchStudent}
        />
      )}

      <TeacherModal
        isOpen={teacherModalOpen}
        onClose={() => {
          setTeacherModalOpen(false);
          setConnectionMode(getConnectionMode());
        }}
        onSharedDataUpdated={(data) => {
          setAppConfig(data.config);
          setVanDungQuestions(data.vanDungQuestions);
          setConnectionMode(getConnectionMode());
        }}
      />
    </>
  );
}
