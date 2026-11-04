import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function Input({ label, error, prefix, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-[#6B7280] dark:text-[#7A8499]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-[#6B7280] dark:text-[#7A8499]">{prefix}</span>
        )}
        <input
          className={`
            w-full rounded-[18px] px-5 py-[17px] text-sm font-medium outline-none
            bg-white dark:bg-[#232733]
            text-[#0C0E14] dark:text-white
            placeholder:text-[#9CA3AF] dark:placeholder:text-[#4A5568]
            border border-transparent
            focus:border-[#B5E82C]
            transition-colors
            ${prefix ? 'pl-11' : ''}
            ${suffix ? 'pr-11' : ''}
            ${error ? 'border-[#DC2626]!' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 text-[#6B7280] dark:text-[#7A8499]">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-[#DC2626] font-medium px-1">{error}</p>}
    </div>
  );
}
