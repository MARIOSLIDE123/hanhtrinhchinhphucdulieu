/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { CHALLENGE_QUESTIONS, DEFAULT_ASSIGNMENTS, DEFAULT_GROUPS, DEFAULT_TEAM_QUESTIONS } from './data/lessonData';
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
  GroupAssignment,
  StudentProfile,
  TeamGroup,
  TeamQuestion,
  ZoneId,
} from './types';
import { ChallengeZone } from './components/ChallengeZone';
import { ConfettiBurst } from './components/ConfettiBurst';
import { HomeScreen } from './components/HomeScreen';
import { LeaderboardZone } from './components/LeaderboardZone';
import { LearnZone } from './components/LearnZone';
import { ReviewZone } from './components/ReviewZone';
import { StudentLoginScreen } from './components/StudentLoginScreen';
import { TeacherModal } from './components/TeacherModal';
import { TeamZone } from './components/TeamZone';

export default function App() {
  const [student, setStudent] = useState<StudentProfile | null>(() => loadLocalStudent());
  const [attempts, setAttempts] = useState<AttemptRecord[]>(() => loadLocalAttempts());
  const [activeZone, setActiveZone] = useState<ZoneId>('home');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(() => getConnectionMode());
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);

  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [groups, setGroups] = useState<TeamGroup[]>(DEFAULT_GROUPS);
  const [assignments, setAssignments] = useState<GroupAssignment[]>(DEFAULT_ASSIGNMENTS);
  const [teamQuestions, setTeamQuestions] = useState<TeamQuestion[]>(DEFAULT_TEAM_QUESTIONS);

  useEffect(() => {
    fetchInitialSharedData().then((shared) => {
      setAppConfig(shared.config);
      setGroups(shared.groups);
      setAssignments(shared.assignments);
      setTeamQuestions(shared.questionBank);
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
  };

  const checkLessonCompletionBonus = async (
    currentStudent: StudentProfile,
    currentAttempts: AttemptRecord[]
  ) => {
    const passedIds = new Set(currentAttempts.filter((a) => a.is_correct).map((a) => a.question_id));
    if (passedIds.has('LESSON_COMPLETE_BONUS')) return;
    const allStages = ['STAGE_1', 'STAGE_2', 'STAGE_3'].every((id) => passedIds.has(id));
    const allChallenges = CHALLENGE_QUESTIONS.every((q) => passedIds.has(q.id));
    if (allStages && allChallenges) {
      const bonusRes = await submitAnswer({
        student: currentStudent,
        question_id: 'LESSON_COMPLETE_BONUS',
        question_type: 'lesson_bonus',
        answer: 'completed',
        duration: 1,
        teamQuestions,
      });
      setStudent(bonusRes.updatedStudent);
      setAttempts(bonusRes.attempts);
      setConfettiTrigger((c) => c + 1);
    }
  };

  const handleCompleteStage = async (stageId: 'STAGE_1' | 'STAGE_2' | 'STAGE_3') => {
    if (!student) return;
    const res = await submitAnswer({
      student,
      question_id: stageId,
      question_type: 'stage_completion',
      answer: 'completed',
      duration: 1,
      teamQuestions,
    });
    setStudent(res.updatedStudent);
    setAttempts(res.attempts);
    if (res.feedback.awarded_delta > 0) {
      setConfettiTrigger((c) => c + 1);
    }
    await checkLessonCompletionBonus(res.updatedStudent, res.attempts);
  };

  const handleSubmitChallenge = async (params: {
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
        max_score: 0,
        explanation: '',
        error: 'Chưa đăng nhập học sinh.',
      };
    }
    const res = await submitAnswer({
      student,
      ...params,
      teamQuestions,
    });
    setStudent(res.updatedStudent);
    setAttempts(res.attempts);
    if (res.feedback.is_correct && res.feedback.awarded_delta > 0) {
      setConfettiTrigger((c) => c + 1);
    }
    await checkLessonCompletionBonus(res.updatedStudent, res.attempts);
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
          onSelectZone={(z) => setActiveZone(z)}
          onOpenTeacher={() => setTeacherModalOpen(true)}
          onSwitchStudent={handleSwitchStudent}
        />
      ) : activeZone === 'learn' ? (
        <LearnZone
          student={student}
          attempts={attempts}
          onBack={() => setActiveZone('home')}
          onCompleteStage={handleCompleteStage}
        />
      ) : activeZone === 'review' ? (
        <ReviewZone student={student} onBack={() => setActiveZone('home')} />
      ) : activeZone === 'challenge' ? (
        <ChallengeZone
          student={student}
          attempts={attempts}
          onBack={() => setActiveZone('home')}
          onSubmitChallenge={handleSubmitChallenge}
        />
      ) : activeZone === 'leaderboard' ? (
        <LeaderboardZone
          student={student}
          connectionMode={connectionMode}
          onBack={() => setActiveZone('home')}
        />
      ) : (
        <TeamZone
          student={student}
          attempts={attempts}
          groups={groups}
          assignments={assignments}
          teamQuestions={teamQuestions}
          onBack={() => setActiveZone('home')}
          onSubmitTeamAnswer={handleSubmitChallenge}
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
          setGroups(data.groups);
          setAssignments(data.assignments);
          setTeamQuestions(data.questionBank);
          setConnectionMode(getConnectionMode());
        }}
      />
    </>
  );
}
