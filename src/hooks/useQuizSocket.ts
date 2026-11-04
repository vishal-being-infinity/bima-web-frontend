import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/env';

export type QuizPhase = 'WAITING' | 'LOBBY' | 'QUESTION' | 'LEADERBOARD' | 'RESULTS' | 'COMPLETED';

export interface QuizOption { id: string; optionText: string; optionImage: string | null; }
export interface QuizQuestion { id: string; questionText: string; questionImage: string | null; questionType: string; durationMs: number | null; options: QuizOption[]; }

export interface RuntimeState {
  phase: QuizPhase;
  remainingTime: number | null;
  phaseEndsAt: string | null;
  connectedUsers: number | null;
  questionIndex: number | null;
  totalQuestions: number | null;
  question: QuizQuestion | null;
  serverTime: number | null;
}

export interface LeaderboardEntry { rank: number; userId: string; fullName: string; totalScore: number; }
export interface QuestionResult { correct: boolean; score: number; totalScore: number; rank: number | null; correctOptionIds: string[]; totalParticipants: number; }
export interface FinalResult { rank: number | null; totalScore: number; totalParticipants: number; }

interface UseQuizSocketReturn {
  runtime: RuntimeState | null;
  leaderboard: LeaderboardEntry[];
  questionResult: QuestionResult | null;
  finalResult: FinalResult | null;
  connected: boolean;
  error: string | null;
  submitAnswer: (questionId: string, optionIds: string[]) => void;
}

export function useQuizSocket(quizId: string, token: string | null): UseQuizSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [runtime, setRuntime] = useState<RuntimeState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [questionResult, setQuestionResult] = useState<QuestionResult | null>(null);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
      timeout: 12000,
      autoConnect: false,
    });

    socketRef.current = socket;

    socket.on('connect', () => { setConnected(true); socket.emit('joinQuiz', { quizId }); });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (e) => setError(e.message));

    // All backend socket events are wrapped: { success, data: { ... } }
    socket.on('quizJoined', (data) => {
      if (data?.success === false) { setError(data?.message ?? 'Could not join quiz'); return; }
      if (data?.data) setRuntime(data.data);
    });
    socket.on('joinQuizError', (data) => setError(data?.message ?? 'Failed to join quiz'));
    socket.on('runtimeUpdated', (data) => {
      if (data?.data) { setRuntime(data.data); setQuestionResult(null); }
    });
    socket.on('leaderboardUpdated', (data) => {
      const payload = data?.data;
      setLeaderboard(payload?.leaderboard ?? payload?.entries ?? []);
    });
    socket.on('questionResults', (data) => { if (data?.data) setQuestionResult(data.data); });
    socket.on('finalResults', (data) => { if (data?.data) setFinalResult(data.data); });

    socket.connect();

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [quizId, token]);

  const submitAnswer = (questionId: string, optionIds: string[]) => {
    socketRef.current?.emit('submitAnswer', { quizId, questionId, selectedOptionIds: optionIds });
  };

  return { runtime, leaderboard, questionResult, finalResult, connected, error, submitAnswer };
}
