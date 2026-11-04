import { useState, useEffect, useRef } from 'react';
import { type RuntimeState, type QuestionResult } from '../../../hooks/useQuizSocket';
import { BrandLogo } from '../../../components/layout/BrandLogo';
import { CheckCircle2, XCircle } from 'lucide-react';

const ANSWER_COLORS = ['#6C8EFF', '#9B7EDE', '#3FB6E8', '#FFD166', '#FF9F43', '#48CFAD'];
const ANSWER_SHAPES = ['▲', '◆', '●', '■', '★', '♥'];

interface Props {
  runtime: RuntimeState;
  quizId: string;
  questionResult: QuestionResult | null;
  onSubmit: (questionId: string, optionIds: string[]) => void;
}

type TileState = 'idle' | 'selected' | 'unselected' | 'correct' | 'wrong' | 'dimmed';

// ─── Circular countdown ring ───────────────────────────────────────────────

function TimerRing({
  secondsLeft,
  totalSeconds,
  submitted,
}: {
  secondsLeft: number;
  totalSeconds: number;
  submitted: boolean;
}) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fraction = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const offset = circ * (1 - fraction);
  const color = fraction > 0.5 ? '#B5E82C' : fraction > 0.25 ? '#FFB020' : '#FF6B6B';

  if (submitted && secondsLeft > 0) {
    return (
      <div className="flex items-center gap-1.5 h-[54px] px-3.5 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10">
        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
        <span className="text-[12px] font-bold text-[#22C55E]">Submitted</span>
        <span className="text-[12px] font-bold text-[#22C55E]/70">{secondsLeft}s</span>
      </div>
    );
  }

  return (
    <div className="relative w-[54px] h-[54px] flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="54" height="54" viewBox="0 0 54 54">
        <circle cx="27" cy="27" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
        <circle
          cx="27" cy="27" r={r} fill="none" strokeWidth="3.5"
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
        />
      </svg>
      <span
        className="text-[18px] font-black tabular-nums z-10"
        style={{ color }}
      >
        {secondsLeft}
      </span>
    </div>
  );
}

// ─── Individual answer tile ────────────────────────────────────────────────

function AnswerTile({
  shape, color, optionText, optionImage, state, onClick,
}: {
  shape: string;
  color: string;
  optionText: string;
  optionImage: string | null;
  state: TileState;
  onClick: () => void;
}) {
  let bgColor: string;
  let borderColor: string;
  let borderWidth: string;
  let textColor: string;
  let opacity = 1;
  let extraClass = '';
  let shadow = '';
  let trailingIcon: React.ReactNode = null;

  switch (state) {
    case 'correct':
      bgColor = 'rgba(34,197,94,0.18)';
      borderColor = '#22C55E';
      borderWidth = '2px';
      textColor = '#22C55E';
      extraClass = 'animate-reveal-bounce';
      shadow = '0 4px 22px rgba(34,197,94,0.35)';
      trailingIcon = <CheckCircle2 className="w-[18px] h-[18px] text-[#22C55E] shrink-0 mr-2.5" />;
      break;
    case 'wrong':
      bgColor = 'rgba(255,107,107,0.12)';
      borderColor = '#FF6B6B';
      borderWidth = '2px';
      textColor = '#FF6B6B';
      trailingIcon = <XCircle className="w-[18px] h-[18px] text-[#FF6B6B] shrink-0 mr-2.5" />;
      break;
    case 'dimmed':
      bgColor = `${color}09`;
      borderColor = `${color}18`;
      borderWidth = '1px';
      textColor = `${color}60`;
      opacity = 0.65;
      break;
    case 'selected':
      bgColor = `${color}28`;
      borderColor = color;
      borderWidth = '2px';
      textColor = color;
      shadow = `0 4px 12px ${color}35`;
      break;
    case 'unselected':
      bgColor = `${color}0F`;
      borderColor = `${color}22`;
      borderWidth = '1px';
      textColor = `${color}90`;
      opacity = 0.55;
      break;
    default: // idle
      bgColor = `${color}20`;
      borderColor = `${color}40`;
      borderWidth = '1px';
      textColor = color;
  }

  return (
    <button
      onClick={onClick}
      disabled={state === 'correct' || state === 'wrong' || state === 'dimmed'}
      className={`w-full text-left flex items-stretch rounded-[16px] transition-all active:scale-[0.97] ${extraClass}`}
      style={{
        minHeight: '92px',
        backgroundColor: bgColor,
        border: `${borderWidth} solid ${borderColor}`,
        boxShadow: shadow || undefined,
        opacity,
      }}
    >
      {/* Shape icon column */}
      <div className="w-9 flex items-center justify-center shrink-0">
        <span className="text-[16px]" style={{ color: textColor }}>{shape}</span>
      </div>

      {/* Text + optional image */}
      <div className="flex-1 flex flex-col justify-center py-2 pr-1">
        {optionImage && optionImage.length > 0 && (
          <img
            src={optionImage}
            alt=""
            className="w-full rounded-xl mb-2 aspect-video object-cover"
          />
        )}
        <p
          className="text-[13px] font-bold leading-[1.3]"
          style={{ color: state === 'correct' || state === 'wrong' ? textColor : '#FFFFFF' }}
        >
          {optionText}
        </p>
      </div>

      {trailingIcon}
    </button>
  );
}

// ─── Bottom submit bar ─────────────────────────────────────────────────────

function SubmitBar({
  selected, submitted, timerExpired, onSubmit,
}: {
  selected: string | null;
  submitted: boolean;
  timerExpired: boolean;
  onSubmit: () => void;
}) {
  let label: string;
  let bgColor: string;
  let textColor: string;
  let active = false;
  let pulse = false;

  if (timerExpired) {
    label = "Time's up!";
    bgColor = 'rgba(255,255,255,0.05)';
    textColor = '#7A8499';
  } else if (submitted) {
    label = '✓ Answer Submitted — Waiting for timer...';
    bgColor = 'rgba(34,197,94,0.15)';
    textColor = '#22C55E';
  } else if (selected) {
    label = 'Submit Answer';
    bgColor = '#B5E82C';
    textColor = '#0C0E14';
    active = true;
    pulse = true;
  } else {
    label = 'Select an answer first';
    bgColor = 'rgba(255,255,255,0.05)';
    textColor = '#7A8499';
  }

  return (
    <div className="shrink-0 px-4 pt-2 pb-4 border-t border-white/[0.06] bg-[#0F1117]">
      <button
        onClick={active ? onSubmit : undefined}
        disabled={!active}
        className={`w-full h-14 rounded-[18px] font-extrabold text-[15px] transition-all ${pulse ? 'animate-submit-pulse' : ''}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          boxShadow: active ? '0 6px 20px rgba(181,232,44,0.3)' : undefined,
        }}
      >
        {label}
      </button>
    </div>
  );
}

// ─── Main QuestionView ─────────────────────────────────────────────────────

export function QuestionView({ runtime, quizId: _quizId, questionResult, onSubmit }: Props) {
  const q = runtime.question!;
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const selectedRef = useRef<string | null>(null);
  const autoSubmittedRef = useRef(false);

  // Keep ref in sync for use inside intervals
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // Reset state when question changes
  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setLocked(false);
    autoSubmittedRef.current = false;
  }, [q.id]);

  // Local countdown from server's phaseEndsAt
  useEffect(() => {
    if (!runtime.phaseEndsAt) return;
    const end = new Date(runtime.phaseEndsAt).getTime();

    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const secs = Math.round(diff / 1000);
      setTimeLeft(secs);
      if (secs <= 0) {
        clearInterval(id);
        setLocked(true);
        if (!autoSubmittedRef.current && selectedRef.current) {
          autoSubmittedRef.current = true;
          onSubmit(q.id, [selectedRef.current]);
          setSubmitted(true);
        }
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [runtime.phaseEndsAt, q.id]);

  // Reveal on result
  useEffect(() => {
    if (questionResult) setLocked(true);
  }, [questionResult]);

  const totalSeconds = q.durationMs ? Math.round(q.durationMs / 1000) : 20;

  const handleSelect = (optId: string) => {
    if (locked || submitted) return;
    setSelected((s) => (s === optId ? null : optId));
  };

  const handleSubmit = () => {
    if (!selected || locked || submitted) return;
    setSubmitted(true);
    setLocked(true);
    autoSubmittedRef.current = true;
    onSubmit(q.id, [selected]);
  };

  const getTileState = (optId: string): TileState => {
    const isSel = selected === optId;
    const isCorrect = questionResult?.correctOptionIds.includes(optId) ?? false;
    if (questionResult) {
      if (isCorrect) return 'correct';
      if (isSel) return 'wrong';
      return 'dimmed';
    }
    if (isSel) return 'selected';
    if (selected && !isSel) return 'unselected';
    return 'idle';
  };

  const hasImage = !!(q.questionImage && q.questionImage.length > 0);

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col">
      {/* Brand bar - full viewport width */}
      <div className="px-5 pt-4 pb-0 shrink-0">
        <BrandLogo size="sm" noLink />
      </div>
    <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
      {/* Header: progress + timer */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] font-bold tracking-[1.2px] text-[#7A8499] uppercase mb-1.5">
            Question {(runtime.questionIndex ?? 0) + 1} of {runtime.totalQuestions ?? '?'}
          </p>
          <div className="w-36 h-[5px] rounded-full overflow-hidden bg-white/[0.08]">
            <div
              className="h-full bg-[#B5E82C] rounded-full transition-all duration-500"
              style={{
                width: `${runtime.totalQuestions ? (((runtime.questionIndex ?? 0) + 1) / runtime.totalQuestions) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <TimerRing secondsLeft={timeLeft} totalSeconds={totalSeconds} submitted={submitted} />
      </div>

      {/* Scrollable question + options */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {/* Question card */}
        <div
          className="rounded-[24px] border border-white/[0.06] overflow-hidden mb-3"
          style={{
            backgroundColor: '#1A1D24',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          }}
        >
          {hasImage && (
            <div className="aspect-video">
              <img src={q.questionImage!} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className={`px-6 ${hasImage ? 'py-8' : 'py-9'} text-center`}>
            <p
              className="font-bold leading-[1.45] tracking-[-0.3px] text-white"
              style={{ fontSize: hasImage ? '17px' : '20px' }}
            >
              {q.questionText}
            </p>
          </div>
        </div>

        {/* Answer grid: 2 cols for >2 options, 1 col otherwise */}
        <div className={`grid gap-2.5 ${q.options.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {q.options.map((opt, i) => (
            <AnswerTile
              key={opt.id}
              shape={ANSWER_SHAPES[i % ANSWER_SHAPES.length]}
              color={ANSWER_COLORS[i % ANSWER_COLORS.length]}
              optionText={opt.optionText}
              optionImage={opt.optionImage}
              state={getTileState(opt.id)}
              onClick={() => handleSelect(opt.id)}
            />
          ))}
        </div>
      </div>

      {/* Sticky submit bar */}
      <SubmitBar
        selected={selected}
        submitted={submitted}
        timerExpired={locked && !submitted && !questionResult}
        onSubmit={handleSubmit}
      />
    </div>
    </div>
  );
}
