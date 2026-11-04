import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auth } from '../../config/firebase';
import { getMyQuizById } from '../../api/quiz';
import { useQuizSocket, type QuizPhase } from '../../hooks/useQuizSocket';
import { PageSpinner } from '../../components/ui/Spinner';
import { LobbyView } from './views/LobbyView';
import { QuestionView } from './views/QuestionView';
import { LeaderboardView } from './views/LeaderboardView';
import { ResultsView } from './views/ResultsView';

export function QuizLivePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    auth.currentUser?.getIdToken().then(setToken);
  }, []);

  const { runtime, leaderboard, questionResult, finalResult, connected, error, submitAnswer } =
    useQuizSocket(id ?? '', token);

  const { data: quizDetail } = useQuery({
    queryKey: ['quiz-detail', id],
    queryFn: () => getMyQuizById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });

  if (!token || (!connected && !error)) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="text-center">
          <PageSpinner />
          <p className="text-[#7A8499] text-sm mt-4">Connecting to quiz…</p>
        </div>
      </div>
    );
  }

  if (error && !runtime) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <p className="text-2xl mb-3">⚠️</p>
          <p className="text-white font-bold text-lg mb-2">Connection error</p>
          <p className="text-[#7A8499] text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="text-[#B5E82C] font-bold text-sm"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  const phase: QuizPhase = runtime?.phase ?? 'WAITING';

  if (phase === 'WAITING' || phase === 'LOBBY') {
    return (
      <LobbyView
        runtime={runtime}
        connected={connected}
        quizTitle={quizDetail?.title}
        questionCount={quizDetail?.questionCount}
      />
    );
  }

  if (phase === 'QUESTION') {
    return (
      <QuestionView
        runtime={runtime!}
        quizId={id!}
        questionResult={questionResult}
        onSubmit={submitAnswer}
      />
    );
  }

  if (phase === 'LEADERBOARD') {
    return (
      <LeaderboardView
        entries={leaderboard}
        runtime={runtime}
        questionResult={questionResult}
        totalParticipants={questionResult?.totalParticipants}
      />
    );
  }

  if (phase === 'RESULTS' || phase === 'COMPLETED') {
    return (
      <ResultsView
        finalResult={finalResult}
        leaderboard={leaderboard}
        quizTitle={quizDetail?.title}
        onHome={() => navigate('/home')}
      />
    );
  }

  return <PageSpinner />;
}
