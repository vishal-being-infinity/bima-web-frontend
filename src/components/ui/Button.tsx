import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  loading = false,
  variant = 'primary',
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-bold text-sm rounded-[18px] px-5 py-[15px] transition-all active:scale-[0.98] select-none cursor-pointer disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#B5E82C] text-[#0C0E14] shadow-[0_4px_20px_rgba(181,232,44,0.3)] hover:bg-[#C8F53A] hover:shadow-[0_6px_24px_rgba(181,232,44,0.5)] disabled:opacity-60',
    ghost:
      'bg-black/5 dark:bg-white/5 text-[#6B7280] dark:text-[#7A8499] hover:bg-black/10 dark:hover:bg-white/10',
    danger:
      'bg-[#FF6B6B] text-white shadow-[0_4px_12px_rgba(255,107,107,0.3)] hover:bg-[#FF5252] hover:shadow-[0_6px_18px_rgba(255,107,107,0.4)] disabled:opacity-60',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
}
