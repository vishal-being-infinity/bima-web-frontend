import { type LeaderboardEntry, type RuntimeState, type QuestionResult } from '../../../hooks/useQuizSocket';
import { BrandLogo } from '../../../components/layout/BrandLogo';
import { Trophy, Timer } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface Props {
  entries: LeaderboardEntry[];
  runtime: RuntimeState | null;
  questionResult: QuestionResult | null;
  totalParticipants?: number;
}

// ─── Circular countdown ring ───────────────────────────────────────────────

function CountdownRing({ secondsLeft, totalSeconds }: { secondsLeft: number; totalSeconds: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fraction = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const offset = circ * (1 - fraction);

  return (
    <div className="relative w-[52px] h-[52px] flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
        <circle
          cx="26" cy="26" r={r} fill="none" strokeWidth="3.5"
          stroke="#B5E82C"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
        />
      </svg>
      <span className="text-[16px] font-black tabular-nums text-[#B5E82C] z-10">{secondsLeft}</span>
    </div>
  );
}

// ─── Answer result banner ──────────────────────────────────────────────────

function AnswerResultBanner({ result }: { result: QuestionResult | null }) {
  if (!result) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-[16px] border"
        style={{ backgroundColor: 'rgba(122,132,153,0.09)', borderColor: 'rgba(122,132,153,0.22)' }}
      >
        <Timer className="w-[22px] h-[22px] text-[#7A8499] shrink-0" />
        <div>
          <p className="text-[14px] font-bold text-[#7A8499]">No answer — time ran out</p>
          <p className="text-[12px] text-[#7A8499]/70 mt-0.5">Submit before the timer ends next time</p>
        </div>
      </div>
    );
  }

  if (result.correct) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-[16px] border"
        style={{ backgroundColor: 'rgba(34,197,94,0.09)', borderColor: 'rgba(34,197,94,0.22)' }}
      >
        <span className="text-[22px]">✅</span>
        <div>
          <p className="text-[14px] font-bold text-[#22C55E]">Correct! +{result.score} pts</p>
          <p className="text-[12px] text-[#22C55E]/70 mt-0.5">Speed bonus applied — great timing!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-[16px] border"
      style={{ backgroundColor: 'rgba(255,107,107,0.09)', borderColor: 'rgba(255,107,107,0.22)' }}
    >
      <span className="text-[22px]">❌</span>
      <div>
        <p className="text-[14px] font-bold text-[#FF6B6B]">Wrong answer</p>
        <p className="text-[12px] text-[#FF6B6B]/70 mt-0.5">You selected the wrong option, 0 points awarded</p>
      </div>
    </div>
  );
}

// ─── Rank callout ──────────────────────────────────────────────────────────

function YourRankCallout({ rank, total }: { rank: number | null | undefined; total: number }) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] border border-[#FFD166]/30"
      style={{ background: 'linear-gradient(90deg, #1C2440, #141A30)' }}
    >
      <Trophy className="w-5 h-5 text-[#FFD166] shrink-0" />
      <p className="text-[13px] text-[#7A8499]">Your current rank</p>
      <div className="ml-auto flex items-baseline gap-1.5">
        <span className="text-[22px] font-black text-[#FFD166]">
          {rank != null ? `#${rank}` : '—'}
        </span>
        <span className="text-[13px] text-[#7A8499]">of {total}</span>
      </div>
    </div>
  );
}

// ─── Single leaderboard row ────────────────────────────────────────────────

function LeaderboardRow({
  entry, isYou, animIndex,
}: {
  entry: LeaderboardEntry;
  isYou: boolean;
  animIndex: number;
}) {
  const gold = '#FFD166', silver = '#BDBDBD', bronze = '#CD7F32';
  const rankColor = entry.rank === 1 ? gold : entry.rank === 2 ? silver : entry.rank === 3 ? bronze : '#7A8499';
  const rankLabel = entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : String(entry.rank);
  const initial = entry.fullName?.[0]?.toUpperCase() ?? '?';

  return (
    <div
      className="flex items-center gap-2.5 px-3.5 py-[11px] rounded-[14px] border"
      style={{
        backgroundColor: isYou ? 'rgba(255,209,102,0.08)' : '#1A1D24',
        borderColor: isYou ? 'rgba(255,209,102,0.3)' : 'rgba(255,255,255,0.06)',
        borderWidth: isYou ? '1.5px' : '1px',
        animation: `slideInRow 300ms ease-out ${animIndex * 55}ms both`,
      }}
    >
      {/* Rank */}
      <div className="w-[34px] text-center shrink-0">
        <span
          className="font-extrabold tabular-nums"
          style={{
            fontSize: entry.rank <= 3 ? '18px' : '13px',
            color: rankColor,
          }}
        >
          {rankLabel}
        </span>
      </div>

      {/* Avatar */}
      <div
        className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
        style={{
          backgroundColor: isYou ? 'rgba(255,209,102,0.18)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${isYou ? 'rgba(255,209,102,0.35)' : 'rgba(255,255,255,0.12)'}`,
          color: isYou ? gold : '#D1D5DB',
        }}
      >
        {initial}
      </div>

      {/* Name */}
      <p
        className="flex-1 min-w-0 truncate"
        style={{
          fontSize: '14px',
          fontWeight: isYou ? 800 : 600,
          color: isYou ? gold : '#FFFFFF',
        }}
      >
        {isYou ? `${entry.fullName} (You)` : entry.fullName}
      </p>

      {/* Score */}
      <div className="text-right shrink-0">
        <p
          className="text-[15px] font-extrabold tabular-nums"
          style={{ color: isYou ? gold : '#FFFFFF' }}
        >
          {entry.totalScore}
        </p>
        <p className="text-[10px] text-[#7A8499]">pts</p>
      </div>
    </div>
  );
}

// ─── Main LeaderboardView ──────────────────────────────────────────────────

export function LeaderboardView({ entries, runtime, questionResult, totalParticipants }: Props) {
  const { user } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  // Countdown synced to server's phaseEndsAt
  useEffect(() => {
    const phaseEndsAt = runtime?.phaseEndsAt;
    if (!phaseEndsAt) return;

    const end = new Date(phaseEndsAt).getTime();
    const totalMs = Math.max(0, end - Date.now());
    const total = Math.ceil(totalMs / 1000);
    setTotalSeconds(total > 0 ? total : 1);
    setSecondsLeft(total > 0 ? total : 0);

    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [runtime?.phaseEndsAt]);

  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  const myId = user?.id;
  const myEntry = sorted.find((e) => e.userId === myId);
  const total = totalParticipants ?? entries.length;

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col">
      {/* Brand bar - full viewport width */}
      <div className="px-5 pt-4 pb-0 shrink-0">
        <BrandLogo size="sm" noLink />
      </div>
    <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
      {/* Top bar: title + countdown ring */}
      <div className="px-5 pt-5 pb-0 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[10px] font-bold tracking-[1.5px] text-[#7A8499] uppercase mb-1">Leaderboard</p>
          <p className="text-[20px] font-extrabold tracking-tight text-white">Live standings</p>
        </div>
        <CountdownRing secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3.5">
        {/* Answer result banner */}
        <AnswerResultBanner result={questionResult} />

        {/* Your rank */}
        <YourRankCallout rank={myEntry?.rank ?? questionResult?.rank} total={total} />

        {/* Live standings */}
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7A8499] uppercase">Live Standings</p>

        {sorted.length === 0 ? (
          <p className="text-center text-[#7A8499] text-sm py-10">Waiting for scores…</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((entry, i) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                isYou={entry.userId === myId}
                animIndex={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="shrink-0 px-5 py-4 flex items-center justify-center gap-1.5">
        <Timer className="w-3.5 h-3.5 text-[#7A8499]" />
        <p className="text-[13px] font-semibold text-[#7A8499]">
          Next question in {secondsLeft}s...
        </p>
      </div>
    </div>
    </div>
  );
}
