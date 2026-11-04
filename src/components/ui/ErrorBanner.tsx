import { AlertCircle, WifiOff } from 'lucide-react';

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[14px] px-4 py-3 bg-[#FFF4F4] dark:bg-[#FF6B6B]/10 border border-[#DC2626]/12 dark:border-[#FF6B6B]/20">
      <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0 text-[#DC2626]" />
      <p className="text-[13px] leading-[1.4] font-medium text-[#DC2626] dark:text-[#FF9999]">
        {message}
      </p>
    </div>
  );
}

export function OfflineBanner() {
  return (
    <div className="flex items-center gap-2.5 rounded-[14px] px-4 py-3 bg-[#FFFBEB] dark:bg-[#FFD166]/10 border border-[#FFD166]/18 dark:border-[#FFD166]/20">
      <WifiOff className="w-4.5 h-4.5 shrink-0 text-[#D97706]" />
      <p className="text-[13px] leading-[1.4] font-medium text-[#D97706]">
        No internet connection. Please check your network and try again.
      </p>
    </div>
  );
}
