interface BadgeProps {
  label: string;
  color: string;
}

export function StatusBadge({ label, color }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide"
      style={{ color, backgroundColor: `${color}1F` }}
    >
      {label}
    </span>
  );
}
