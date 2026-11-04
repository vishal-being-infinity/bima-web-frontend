export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-block rounded-full border-2 border-[#B5E82C]/30 border-t-[#B5E82C] animate-spin ${className}`}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <Spinner className="w-8 h-8" />
    </div>
  );
}
