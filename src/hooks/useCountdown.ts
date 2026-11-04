import { useEffect, useState } from 'react';

export function useCountdown(targetDate: Date | null) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!targetDate) { setRemaining(0); return; }

    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      setRemaining(Math.max(0, diff));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted =
    totalSeconds <= 0
      ? 'Starting...'
      : hours > 0
      ? `${hours}h ${String(minutes).padStart(2, '0')}m`
      : minutes > 0
      ? `${minutes}m ${String(seconds).padStart(2, '0')}s`
      : `${seconds}s`;

  return { remaining, formatted, isImminent: totalSeconds > 0 && totalSeconds < 900 };
}
