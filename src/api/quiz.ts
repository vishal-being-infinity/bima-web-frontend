import { apiClient } from './client';

export interface QuizRuntimeSnapshot {
  phase: string;
  remainingTime: number | null;
  phaseStartedAt: string | null;
  phaseEndsAt: string | null;
}

export interface MyQuizSummary {
  id: string;
  title: string;
  coverImageUrl: string | null;
  scheduledStartTime: string;
  status: string;
  visibility: string;
  questionCount: number;
  runtime: QuizRuntimeSnapshot | null;
}

export interface HistoryResult {
  quizId: string;
  title: string;
  completedAt: string;
  rank: number | null;
  totalParticipants: number;
  score: number;
  totalQuestions: number;
}

export interface HistoryPage {
  data: HistoryResult[];
  pagination: { page: number; limit: number; total: number; hasMore: boolean };
}

function normalizeQuiz(q: any): MyQuizSummary {
  return { ...q, questionCount: q.questionCount ?? q._count?.quizQuestions ?? 0 };
}

export const getMyQuizzes = async (): Promise<MyQuizSummary[]> => {
  const res = await apiClient.get('/quiz/my');
  return (res.data.data ?? []).map(normalizeQuiz);
};

export const getMyQuizById = async (id: string): Promise<MyQuizSummary> => {
  const res = await apiClient.get(`/quiz/my/${id}`);
  return normalizeQuiz(res.data.data);
};

export const getMyHistory = async (page = 1, limit = 10): Promise<HistoryPage> => {
  const res = await apiClient.get('/quiz/my/history', { params: { page, limit } });
  return res.data;
};

export const submitAnswer = async (quizId: string, questionId: string, optionIds: string[]): Promise<void> => {
  await apiClient.post(`/runtime/${quizId}/submit`, { questionId, optionIds });
};
