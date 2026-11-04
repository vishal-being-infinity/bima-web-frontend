import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, HelpCircle, Zap, Clock, Radio, BarChart2 } from 'lucide-react';
import { getMyQuizzes, getMyHistory, type MyQuizSummary } from '../api/quiz';
import { useAuth } from '../contexts/AuthContext';
import { useCountdown } from '../hooks/useCountdown';
import { PageSpinner } from '../components/ui/Spinner';

function greet() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: '🌅' };
  if (h < 17) return { text: 'Good Afternoon', icon: '☀️' };
  return { text: 'Good Evening', icon: '🌙' };
}

type CardPhase = 'waiting' | 'lobby' | 'inProgress';

function getPhase(quiz: MyQuizSummary): CardPhase {
  if (!quiz.runtime) return 'waiting';
  const p = quiz.runtime.phase;
  if (p === 'LOBBY') return 'lobby';
  if (p === 'WAITING') return 'waiting';
  return 'inProgress';
}

const PHASE_COLOR: Record<CardPhase, string> = {
  waiting: '#6C8EFF',
  lobby: '#FFB020',
  inProgress: '#FF6B6B',
};

const PHASE_LABEL: Record<CardPhase, string> = {
  waiting: 'SCHEDULED',
  lobby: 'LOBBY OPEN',
  inProgress: 'LIVE NOW',
};

function formatDate(dt: Date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const h = dt.getHours() % 12 || 12;
  const m = String(dt.getMinutes()).padStart(2, '0');
  const ampm = dt.getHours() >= 12 ? 'PM' : 'AM';
  return `${months[dt.getMonth()]} ${dt.getDate()} • ${h}:${m} ${ampm}`;
}

function QuizCard({ quiz }: { quiz: MyQuizSummary }) {
  const navigate = useNavigate();
  const phase = getPhase(quiz);
  const color = PHASE_COLOR[phase];

  const target =
    phase === 'inProgress'
      ? null
      : phase === 'lobby' && quiz.runtime?.phaseEndsAt
      ? new Date(quiz.runtime.phaseEndsAt)
      : new Date(quiz.scheduledStartTime);

  const { formatted, isImminent } = useCountdown(target);
  const urgencyColor = phase !== 'waiting' || isImminent ? '#FF6B6B' : color;

  return (
    <div
      onClick={() => navigate(`/quiz/${quiz.id}/waiting`)}
      className="rounded-[20px] border p-4 cursor-pointer active:scale-[0.99] transition-all"
      style={{
        backgroundColor: `${color}08`,
        borderColor: `${color}20`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        {/* Status pill */}
        <span
          className="text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-full"
          style={{ color, backgroundColor: `${color}1F` }}
        >
          {PHASE_LABEL[phase]}
        </span>

        {/* Countdown chip */}
        <span
          className="flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-full"
          style={{ color: urgencyColor, backgroundColor: `${urgencyColor}18` }}
        >
          {phase === 'inProgress' ? (
            <Radio className="w-3 h-3" />
          ) : isImminent ? (
            <Zap className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {phase === 'inProgress' ? 'Ongoing' : formatted}
        </span>
      </div>

      <p className="text-[17px] font-bold tracking-tight text-[#0C0E14] dark:text-white mb-1">
        {quiz.title}
      </p>
      <p className="text-[13px] text-[#6B7280] dark:text-[#7A8499] mb-3">
        {formatDate(new Date(quiz.scheduledStartTime))}
      </p>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#6B7280] dark:text-[#7A8499]">
          <HelpCircle className="w-3.5 h-3.5" />
          {quiz.questionCount} Questions
        </span>
        <span
          className="text-[12px] font-extrabold text-white px-3.5 py-1.5 rounded-full"
          style={{ backgroundColor: color }}
        >
          {phase === 'inProgress' ? 'Join Now →' : 'Enter Lobby →'}
        </span>
      </div>
    </div>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const greeting = greet();

  const quizzesQ = useQuery({ queryKey: ['my-quizzes'], queryFn: getMyQuizzes, refetchInterval: 10_000 });
  const historyQ = useQuery({ queryKey: ['latest-history'], queryFn: () => getMyHistory(1, 1) });

  const now = new Date();
  const quizzes = (quizzesQ.data ?? []).filter((q) => {
    if (q.status === 'COMPLETED') return false;
    if (q.runtime?.phase === 'COMPLETED' || q.runtime?.phase === 'RESULTS') return false;

    // Future-scheduled quiz — always show
    if (new Date(q.scheduledStartTime) > now) return true;

    // Past-scheduled: show only if phaseEndsAt is still in the future (truly live)
    if (q.runtime?.phaseEndsAt) return new Date(q.runtime.phaseEndsAt) > now;

    // No phaseEndsAt but active runtime — keep within a 3-hour window (avoids stuck quizzes)
    if (q.runtime && q.runtime.phase !== 'WAITING') {
      return now.getTime() - new Date(q.scheduledStartTime).getTime() < 3 * 60 * 60 * 1000;
    }

    return false;
  });
  const lastResult = historyQ.data?.data?.[0] ?? null;

  const initial = user?.fullName?.[0]?.toUpperCase() ?? 'S';

  return (
    <div className="min-h-full bg-gradient-to-br from-[#F8F9FC] to-[#F2F4F9] dark:from-[#0F1117] dark:to-[#161B22]">
      <div className="max-w-2xl mx-auto px-5 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#0C0E14] dark:text-white">
              {greeting.text} <span>{greeting.icon}</span>
            </div>
            <p className="text-[15px] font-medium text-[#6B7280] dark:text-[#7A8499] mt-0.5">
              {user?.fullName ?? 'Student'}
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-lg text-[#0C0E14] shadow-[0_4px_14px_rgba(200,255,87,0.3)]"
            style={{ background: 'linear-gradient(135deg, #C8FF57, #8AE600)' }}
          >
            {initial}
          </button>
        </div>

        {/* Upcoming Quizzes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold tracking-[1.4px] text-[#6B7280] dark:text-[#7A8499] uppercase">
              Upcoming Quizzes
            </span>
            {quizzes.length > 0 && (
              <span className="text-[12px] font-semibold text-[#6B7280] dark:text-[#7A8499]">
                {quizzes.length} upcoming
              </span>
            )}
          </div>

          {quizzesQ.isLoading ? (
            <PageSpinner />
          ) : quizzesQ.isError ? (
            <EmptyCard icon={<Calendar className="w-9 h-9" />} message={"Could not load quizzes.\nPull to refresh."} />
          ) : quizzes.length === 0 ? (
            <EmptyCard icon={<Calendar className="w-9 h-9" />} message={"No quizzes scheduled right now.\nCheck back later!"} />
          ) : (
            <div className="flex flex-col gap-3">
              {quizzes.map((q) => <QuizCard key={q.id} quiz={q} />)}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold tracking-[1.4px] text-[#6B7280] dark:text-[#7A8499] uppercase">
              Recent Activity
            </span>
            <button
              onClick={() => navigate('/history')}
              className="text-[12px] font-bold text-[#4F7A00] dark:text-[#B5E82C]"
            >
              View all
            </button>
          </div>

          {historyQ.isLoading ? (
            <PageSpinner />
          ) : !lastResult ? (
            <EmptyCard icon={<BarChart2 className="w-9 h-9" />} message={"No quiz history yet.\nPlay your first quiz!"} />
          ) : (
            <LastResultCard result={lastResult} onClick={() => navigate('/history')} />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyCard({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="rounded-[20px] border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#1A1D24] p-8 flex flex-col items-center gap-3 text-[#9CA3AF] dark:text-[#4A5568]">
      {icon}
      <p className="text-[14px] leading-relaxed text-center whitespace-pre-line">{message}</p>
    </div>
  );
}

function LastResultCard({ result, onClick }: { result: NonNullable<ReturnType<typeof getMyHistory> extends Promise<infer T> ? T : never>['data'][0]; onClick: () => void }) {
  const rankEmoji = result.rank === 1 ? '🥇' : result.rank === 2 ? '🥈' : result.rank === 3 ? '🥉' : '🏆';

  return (
    <div
      onClick={onClick}
      className="rounded-[20px] border border-[#FFD166]/20 cursor-pointer active:scale-[0.99] transition-all p-5 flex items-center gap-4"
      style={{ background: 'linear-gradient(135deg, #FFF8E7, #FFF0D1)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-[1.4px] text-[#D97706]/85 mb-1 uppercase">Last Quiz Result</p>
        <p className="text-[13px] text-[#6B7280] truncate mb-2">{result.title}</p>
        <p className="text-[32px] font-extrabold tracking-tighter text-[#D97706] leading-none mb-1">
          {result.rank == null ? '—' : `Rank #${result.rank}`}
        </p>
        <p className="text-[12px] text-[#6B7280]">
          out of {result.totalParticipants} participants
        </p>
      </div>
      <div className="w-16 h-16 rounded-full border-[1.5px] border-[#FFD166]/30 bg-[#FFD166]/10 flex items-center justify-center shrink-0">
        <span className="text-3xl">{rankEmoji}</span>
      </div>
    </div>
  );
}
