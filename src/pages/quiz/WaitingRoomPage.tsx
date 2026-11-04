import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyQuizById } from '../../api/quiz';
import { useCountdown } from '../../hooks/useCountdown';
import { BrandLogo } from '../../components/layout/BrandLogo';
import { ChevronLeft, Clock, HelpCircle, DoorOpen, WifiOff } from 'lucide-react';

function formatScheduled(dt: Date) {
  const h = String(dt.getHours()).padStart(2, '0');
  const m = String(dt.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function WaitingRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ['quiz-detail', id],
    queryFn: () => getMyQuizById(id!),
    refetchInterval: 4000,
    enabled: !!id,
  });

  // Auto-navigate once lobby opens
  useEffect(() => {
    if (!quiz?.runtime) return;
    if (quiz.runtime.phase !== 'WAITING') {
      navigate(`/quiz/${id}/live`, { replace: true });
    }
  }, [quiz, id, navigate]);

  const target = quiz ? new Date(quiz.scheduledStartTime) : null;
  const { formatted, remaining } = useCountdown(target);
  const isAnyMoment = remaining === 0;

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0F1117] flex flex-col">
      {/* Brand bar - full viewport width */}
      <div className="px-5 pt-4 pb-0">
        <BrandLogo size="sm" noLink />
      </div>
      {/* Back button */}
      <div className="max-w-2xl mx-auto w-full px-5 pt-3 pb-0">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-[#6B7280] dark:text-[#7A8499]" />
          <span className="text-[13px] font-semibold text-[#6B7280] dark:text-[#7A8499]">Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="max-w-md mx-auto flex flex-col items-center gap-7">
          {isLoading ? (
            <_LoadingHero />
          ) : isError ? (
            <_ErrorHero />
          ) : (
            <>
              {/* Hero */}
              <div className="flex flex-col items-center">
                <_FloatingHero />
                <h2 className="text-[22px] font-extrabold tracking-tight text-[#0C0E14] dark:text-white mt-5 text-center">
                  {quiz?.title ?? 'Quiz'}
                </h2>
                <p className="text-[14px] text-[#6B7280] dark:text-[#7A8499] mt-1 text-center">
                  The lobby hasn't opened yet
                </p>
              </div>

              {/* Countdown card */}
              <div className="w-full bg-white dark:bg-[#1A1D24] rounded-[20px] border border-black/[0.05] dark:border-white/[0.06] px-6 py-5">
                <p className="text-[11px] font-bold tracking-[1.2px] text-[#6B7280] dark:text-[#7A8499] uppercase mb-2">
                  Starts In
                </p>
                <p className="text-[36px] font-black tracking-tight tabular-nums text-[#4F7A00] dark:text-[#B5E82C] leading-none mb-4">
                  {isAnyMoment ? 'Any moment now' : formatted}
                </p>
                <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] mb-4" />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#7A8499]" />
                  <span className="text-[13px] font-semibold text-[#0C0E14] dark:text-white">
                    Scheduled for {target ? formatScheduled(target) : '—'}
                  </span>
                </div>
              </div>

              {/* Info pills */}
              <div className="w-full flex flex-wrap gap-2.5">
                <_InfoPill icon={<HelpCircle className="w-3.5 h-3.5" />} label={`${quiz?.questionCount ?? '…'} questions`} />
                <_InfoPill icon={<DoorOpen className="w-3.5 h-3.5" />} label="Lobby opens 10 min prior" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function _FloatingHero() {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center animate-float">
      {/* Outer glow */}
      <div className="absolute w-32 h-32 rounded-full bg-[#B5E82C]/25 animate-breathe" />
      {/* Inner circle */}
      <div className="relative w-24 h-24 rounded-full bg-white dark:bg-[#1A1D24] border border-[#B5E82C]/30 shadow-[0_0_20px_rgba(181,232,44,0.15)] flex items-center justify-center">
        <span className="text-4xl">⏳</span>
      </div>
      {/* Orbiting dots */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full bg-[#B5E82C]"
          style={{
            opacity: 0.3 + (i * 0.12),
            transform: `rotate(${deg}deg) translateX(68px)`,
          }}
        />
      ))}
    </div>
  );
}

function _LoadingHero() {
  return (
    <div className="flex flex-col items-center gap-5">
      <_FloatingHero />
      <p className="text-[14px] font-semibold text-[#6B7280] dark:text-[#7A8499]">Loading quiz…</p>
    </div>
  );
}

function _ErrorHero() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="w-12 h-12 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center">
        <WifiOff className="w-6 h-6 text-[#FF6B6B]" />
      </div>
      <div className="text-center">
        <p className="font-bold text-[#0C0E14] dark:text-white mb-1">Could not reach server</p>
        <p className="text-sm text-[#6B7280] dark:text-[#7A8499]">Retrying automatically…</p>
      </div>
    </div>
  );
}

function _InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white dark:bg-[#1A1D24] border border-black/[0.06] dark:border-white/[0.06] rounded-full px-3.5 py-2">
      <span className="text-[#4F7A00] dark:text-[#B5E82C]">{icon}</span>
      <span className="text-[12px] font-semibold text-[#0C0E14] dark:text-white">{label}</span>
    </div>
  );
}
