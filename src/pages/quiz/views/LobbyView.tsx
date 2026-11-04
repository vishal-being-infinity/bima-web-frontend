import { type RuntimeState } from '../../../hooks/useQuizSocket';
import { useCountdown } from '../../../hooks/useCountdown';
import { BrandLogo } from '../../../components/layout/BrandLogo';
import { ChevronLeft, HelpCircle, Timer, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  runtime: RuntimeState | null;
  connected: boolean;
  quizTitle?: string;
  questionCount?: number;
}

export function LobbyView({ runtime, connected, quizTitle, questionCount }: Props) {
  const navigate = useNavigate();
  const target = runtime?.phaseEndsAt ? new Date(runtime.phaseEndsAt) : null;
  const { formatted, remaining } = useCountdown(target);
  const isImminent = remaining > 0 && remaining < 10_000;
  const ringColor = isImminent ? '#FF6B6B' : '#4F7A00';
  const ringColorDark = isImminent ? '#FF6B6B' : '#B5E82C';

  const connectedUsers = runtime?.connectedUsers ?? 0;

  const statusLabel = !connected ? 'CONNECTING' : runtime?.phase === 'LOBBY' ? 'LOBBY OPEN' : 'CONNECTING';
  const statusColor = !connected ? '#FFB020' : runtime?.phase === 'LOBBY' ? '#FF6B6B' : '#FFB020';

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0F1117] flex flex-col">
      {/* Brand bar - full viewport width */}
      <div className="px-5 pt-4 pb-0">
        <BrandLogo size="sm" noLink />
      </div>
      {/* Back + connection pill */}
      <div className="max-w-2xl mx-auto w-full px-5 pt-3 pb-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#6B7280] dark:text-[#7A8499]" />
            <span className="text-[13px] font-semibold text-[#6B7280] dark:text-[#7A8499]">Back</span>
          </button>

          {/* Connection pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{ backgroundColor: `${statusColor}25`, borderColor: `${statusColor}50` }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
            <span className="text-[11px] font-bold tracking-wide" style={{ color: statusColor }}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-6 py-8 flex flex-col items-center text-center gap-9">

          {/* LIVE QUIZ badge */}
          <div
            className="px-3.5 py-1.5 rounded-full border text-[11px] font-extrabold tracking-[1.2px]"
            style={{ color: ringColor, backgroundColor: `${ringColor}18`, borderColor: `${ringColor}40` }}
          >
            LIVE QUIZ
          </div>

          {/* Quiz title */}
          <div className="-mt-4">
            <h2 className="text-[28px] font-extrabold tracking-tight text-[#0C0E14] dark:text-white leading-tight">
              {quizTitle ?? 'Quiz'}
            </h2>
          </div>

          {/* Countdown circle or spinner */}
          {!connected ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-[#B5E82C]/30 border-t-[#B5E82C] animate-spin" />
              <p className="text-[13px] text-[#6B7280] dark:text-[#7A8499]">Connecting to the quiz…</p>
            </div>
          ) : (
            <_CountdownCircle
              timeString={remaining > 0 ? formatted : 'Starting…'}
              isImminent={isImminent}
              ringColor={ringColor}
              ringColorDark={ringColorDark}
            />
          )}

          {/* Info chips */}
          <div className="flex gap-3 flex-wrap justify-center">
            <_InfoChip
              icon={<HelpCircle className="w-3.5 h-3.5" />}
              label={`${questionCount ?? '…'} Questions`}
              color="#3355D6"
              colorDark="#6C8EFF"
            />
            <_InfoChip
              icon={<Timer className="w-3.5 h-3.5" />}
              label="Speed scoring"
              color="#D97706"
              colorDark="#FFB020"
            />
          </div>

          {/* Participant counter */}
          <div>
            <p className="text-[52px] font-black tracking-tighter text-[#0C0E14] dark:text-white leading-none tabular-nums">
              {connectedUsers}
            </p>
            <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#7A8499] mt-1">
              {connectedUsers === 1 ? 'player in the lobby' : 'players in the lobby'}
            </p>
          </div>

          {/* Tip box */}
          <div className="w-full bg-white dark:bg-[#1A1D24] rounded-[16px] border border-black/[0.05] dark:border-white/[0.06] p-4 flex items-start gap-3 text-left">
            <span className="text-[22px] shrink-0">💡</span>
            <p className="text-[13px] leading-relaxed text-[#6B7280] dark:text-[#7A8499]">
              Answer faster to score more points! The quicker you answer, the higher your score.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

function _CountdownCircle({
  timeString,
  isImminent,
  ringColor,
  ringColorDark,
}: {
  timeString: string;
  isImminent: boolean;
  ringColor: string;
  ringColorDark: string;
}) {
  return (
    <div
      className="w-[200px] h-[200px] rounded-full flex flex-col items-center justify-center border-2 transition-all"
      style={{
        borderColor: `color-mix(in srgb, var(--ring, ${ringColor}) 30%, transparent)`,
        background: `radial-gradient(circle, color-mix(in srgb, ${ringColor} 7%, transparent), transparent)`,
        boxShadow: `0 0 40px color-mix(in srgb, ${ringColor} 15%, transparent)`,
        // apply dark via inline styles won't work directly — use CSS var workaround
      }}
    >
      <style>{`
        @media (prefers-color-scheme: dark) {
          .countdown-ring {
            border-color: ${ringColorDark}50 !important;
            box-shadow: 0 0 40px ${ringColorDark}25 !important;
          }
        }
        html.dark .countdown-ring {
          border-color: ${ringColorDark}50 !important;
          box-shadow: 0 0 40px ${ringColorDark}25 !important;
        }
      `}</style>
      <div
        className="countdown-ring w-[200px] h-[200px] rounded-full flex flex-col items-center justify-center border-2 absolute"
        style={{ borderColor: `${ringColor}50` }}
      />
      <p
        className="text-[11px] font-bold tracking-[1.5px] mb-2"
        style={{ color: `${ringColor}B0` }}
      >
        STARTS IN
      </p>
      <p
        className="text-[40px] font-black tracking-tighter tabular-nums leading-none"
        style={{ color: ringColor }}
      >
        {timeString}
      </p>
      <p className="text-[12px] mt-1" style={{ color: `${ringColor}80` }}>
        {isImminent ? (
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 inline" /> Almost time!</span>
        ) : 'mm:ss'}
      </p>
    </div>
  );
}

function _InfoChip({
  icon, label, color, colorDark,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  colorDark: string;
}) {
  return (
    <>
      <style>{`html.dark .info-chip-${color.replace('#','')} { color: ${colorDark} !important; background: ${colorDark}14 !important; border-color: ${colorDark}33 !important; }`}</style>
      <div
        className={`info-chip-${color.replace('#','')} flex items-center gap-2 px-3.5 py-2.5 rounded-[14px] border`}
        style={{ color, backgroundColor: `${color}14`, borderColor: `${color}30` }}
      >
        {icon}
        <span className="text-[13px] font-semibold">{label}</span>
      </div>
    </>
  );
}
