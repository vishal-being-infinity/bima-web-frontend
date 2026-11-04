import { useEffect, useRef } from 'react';
import { type FinalResult, type LeaderboardEntry } from '../../../hooks/useQuizSocket';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';

interface Props {
  finalResult: FinalResult | null;
  leaderboard: LeaderboardEntry[];
  quizTitle?: string;
  onHome: () => void;
}

// ─── Confetti canvas ───────────────────────────────────────────────────────

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#FFD166', '#B5E82C', '#6C8EFF', '#FF6B6B', '#48CFAD', '#9B7EDE', '#FF9F43', '#3FB6E8'];
    const SHAPES = ['rect', 'circle', 'ribbon'] as const;

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      rot: number; rotV: number;
      w: number; h: number;
      color: string;
      shape: typeof SHAPES[number];
      alpha: number;
    }

    const count = 160;
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 2.5,
      vy: 2 + Math.random() * 3.5,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.18,
      w: 7 + Math.random() * 7,
      h: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      alpha: 0.85 + Math.random() * 0.15,
    }));

    let raf: number;
    let startTime: number | null = null;
    const duration = 5000;

    const draw = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const fadeStart = duration * 0.65;
      const globalAlpha = elapsed > fadeStart
        ? 1 - (elapsed - fadeStart) / (duration - fadeStart)
        : 1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.07; // gravity
        p.rot += p.rotV;

        if (p.y > canvas.height + 30) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.vy = 2 + Math.random() * 3.5;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * globalAlpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'ribbon') {
          ctx.beginPath();
          ctx.moveTo(-p.w / 2, 0);
          ctx.quadraticCurveTo(0, -p.h, p.w / 2, 0);
          ctx.quadraticCurveTo(0, p.h, -p.w / 2, 0);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }

      if (elapsed < duration) {
        raf = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}

// ─── Podium ────────────────────────────────────────────────────────────────

function PodiumSlot({
  entry,
  place,
  isYou,
  animDelay,
}: {
  entry: LeaderboardEntry | undefined;
  place: 1 | 2 | 3;
  isYou: boolean;
  animDelay: number;
}) {
  const configs = {
    1: { height: 110, color: '#FFD166', emoji: '🥇' },
    2: { height: 80,  color: '#BDBDBD', emoji: '🥈' },
    3: { height: 60,  color: '#CD7F32', emoji: '🥉' },
  };
  const cfg = configs[place];
  const initial = entry?.fullName?.[0]?.toUpperCase() ?? '?';

  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{ animation: `slideInRow 400ms ease-out ${animDelay}ms both` }}
    >
      <div className="flex flex-col items-center gap-1 mb-1">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-[17px] font-black border-2"
          style={{
            backgroundColor: `${cfg.color}22`,
            borderColor: isYou ? cfg.color : `${cfg.color}60`,
            color: cfg.color,
            boxShadow: isYou ? `0 0 14px ${cfg.color}55` : undefined,
          }}
        >
          {entry ? initial : '?'}
        </div>
        <p
          className="text-[11px] font-bold text-center max-w-[72px] truncate"
          style={{ color: isYou ? cfg.color : '#D1D5DB' }}
        >
          {entry ? (isYou ? 'You' : entry.fullName.split(' ')[0]) : '—'}
        </p>
        <p className="text-[10px] text-[#7A8499] tabular-nums">{entry?.totalScore ?? 0} pts</p>
      </div>

      <div
        className="w-20 rounded-t-[10px] flex items-end justify-center pb-2"
        style={{
          height: cfg.height,
          backgroundColor: `${cfg.color}18`,
          border: `1.5px solid ${cfg.color}35`,
          borderBottom: 'none',
          animation: `podiumRise 600ms cubic-bezier(0.34,1.56,0.64,1) ${animDelay + 100}ms both`,
        }}
      >
        <span className="text-[22px]">{cfg.emoji}</span>
      </div>
    </div>
  );
}

// ─── Final leaderboard row ─────────────────────────────────────────────────

function FinalRow({
  entry,
  isYou,
  animIndex,
}: {
  entry: LeaderboardEntry;
  isYou: boolean;
  animIndex: number;
}) {
  const gold = '#FFD166', silver = '#BDBDBD', bronze = '#CD7F32';
  const rankColor = entry.rank === 1 ? gold : entry.rank === 2 ? silver : entry.rank === 3 ? bronze : '#7A8499';
  const rankLabel = entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`;
  const initial = entry.fullName?.[0]?.toUpperCase() ?? '?';

  return (
    <div
      className="flex items-center gap-3 px-3.5 py-[11px] rounded-[14px] border"
      style={{
        backgroundColor: isYou ? 'rgba(255,209,102,0.08)' : 'rgba(255,255,255,0.03)',
        borderColor: isYou ? 'rgba(255,209,102,0.3)' : 'rgba(255,255,255,0.06)',
        animation: `slideInRow 300ms ease-out ${animIndex * 45}ms both`,
      }}
    >
      <div className="w-8 text-center shrink-0">
        <span
          className="font-extrabold tabular-nums"
          style={{ fontSize: entry.rank <= 3 ? '18px' : '13px', color: rankColor }}
        >
          {rankLabel}
        </span>
      </div>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
        style={{
          backgroundColor: isYou ? 'rgba(255,209,102,0.18)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${isYou ? 'rgba(255,209,102,0.35)' : 'rgba(255,255,255,0.1)'}`,
          color: isYou ? gold : '#D1D5DB',
        }}
      >
        {initial}
      </div>
      <p
        className="flex-1 min-w-0 truncate"
        style={{ fontSize: '14px', fontWeight: isYou ? 800 : 600, color: isYou ? gold : '#FFFFFF' }}
      >
        {isYou ? `${entry.fullName} (You)` : entry.fullName}
      </p>
      <div className="text-right shrink-0">
        <p className="text-[15px] font-extrabold tabular-nums" style={{ color: isYou ? gold : '#FFFFFF' }}>
          {entry.totalScore}
        </p>
        <p className="text-[10px] text-[#7A8499]">pts</p>
      </div>
    </div>
  );
}

// ─── Main ResultsView ──────────────────────────────────────────────────────

export function ResultsView({ finalResult, leaderboard, quizTitle, onHome }: Props) {
  const { user } = useAuth();
  const myId = user?.id;

  const sorted = [...leaderboard].sort((a, b) => a.rank - b.rank);
  const first  = sorted.find((e) => e.rank === 1);
  const second = sorted.find((e) => e.rank === 2);
  const third  = sorted.find((e) => e.rank === 3);

  const myEntry = sorted.find((e) => e.userId === myId);
  const myRank  = myEntry?.rank ?? finalResult?.rank ?? null;
  const myScore = myEntry?.totalScore ?? finalResult?.totalScore ?? 0;
  const total   = finalResult?.totalParticipants ?? sorted.length;

  const rankColor = myRank === 1 ? '#FFD166' : myRank === 2 ? '#BDBDBD' : myRank === 3 ? '#CD7F32' : '#B5E82C';

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col">
      <style>{`
        @keyframes podiumRise {
          from { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
          to   { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Confetti />

      {/* Header */}
      <div
        className="shrink-0 px-5 pt-10 pb-2 text-center"
        style={{ animation: 'fadeSlideDown 500ms ease-out both' }}
      >
        <p className="text-[11px] font-bold tracking-[1.5px] text-[#7A8499] uppercase mb-1">Quiz Completed</p>
        {quizTitle && (
          <p className="text-[15px] font-semibold text-[#B5E82C] mb-2 truncate px-4">{quizTitle}</p>
        )}
        <h1 className="text-[26px] font-black text-white tracking-tight">Final Standings 🏆</h1>
      </div>

      {/* Podium */}
      {sorted.length > 0 && (
        <div className="shrink-0 flex items-end justify-center gap-3 px-6 pb-2 pt-4">
          <PodiumSlot entry={second} place={2} isYou={second?.userId === myId} animDelay={150} />
          <PodiumSlot entry={first}  place={1} isYou={first?.userId === myId}  animDelay={0}   />
          <PodiumSlot entry={third}  place={3} isYou={third?.userId === myId}  animDelay={300} />
        </div>
      )}

      {/* Your rank callout */}
      <div
        className="mx-5 mt-4 mb-3 px-4 py-3 rounded-[16px] border flex items-center gap-3"
        style={{
          backgroundColor: `${rankColor}10`,
          borderColor: `${rankColor}30`,
          animation: 'slideInRow 400ms ease-out 400ms both',
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[16px] shrink-0"
          style={{ backgroundColor: `${rankColor}20`, color: rankColor }}
        >
          {myRank == null ? '—' : myRank <= 3 ? ['🥇','🥈','🥉'][myRank - 1] : `#${myRank}`}
        </div>
        <div className="flex-1">
          <p className="text-[12px] text-[#7A8499]">Your final rank</p>
          <p className="text-[16px] font-extrabold" style={{ color: rankColor }}>
            {myRank == null ? '—' : `#${myRank}`} of {total}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-[#7A8499]">Score</p>
          <p className="text-[20px] font-black text-[#B5E82C] tabular-nums">{myScore}</p>
        </div>
      </div>

      {/* Full leaderboard */}
      <div className="flex-1 overflow-y-auto px-5 pb-2">
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7A8499] uppercase mb-2">All Participants</p>
        {sorted.length === 0 ? (
          <p className="text-center text-[#7A8499] text-sm py-8">Loading final scores…</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((entry, i) => (
              <FinalRow
                key={entry.userId}
                entry={entry}
                isYou={entry.userId === myId}
                animIndex={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-5 py-5">
        <Button fullWidth onClick={onHome}>Back to Home</Button>
      </div>
    </div>
  );
}
