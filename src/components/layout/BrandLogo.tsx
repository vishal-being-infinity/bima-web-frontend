import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'lg';
  showTagline?: boolean;
  noLink?: boolean;
}

export function BrandLogo({ size = 'sm', showTagline = false, noLink = false }: BrandLogoProps) {
  if (size === 'lg') {
    const inner = (
      <div className="flex flex-col items-start gap-3">
        <img
          src="/app-icon.png"
          alt="Being Infinity"
          className="w-16 h-16 object-contain drop-shadow-[0_8px_32px_rgba(200,255,87,0.2)]"
        />
        <div>
          <p className="text-xl font-extrabold text-[#0C0E14] dark:text-white tracking-tight">
            Being Infinity
          </p>
          {showTagline && (
            <p className="text-sm font-medium text-[#6B7280] dark:text-[#7A8499] mt-1">
              Learn. Compete. Grow.
            </p>
          )}
        </div>
      </div>
    );
    return noLink ? inner : <Link to="/home" className="inline-block">{inner}</Link>;
  }

  const inner = (
    <div className="flex items-center gap-2">
      <img
        src="/app-icon.png"
        alt="Being Infinity"
        className="w-7 h-7 object-contain"
      />
      <span className="text-sm font-bold text-[#6B7280] dark:text-[#7A8499] tracking-tight">
        Being Infinity
      </span>
    </div>
  );
  return noLink ? inner : <Link to="/home" className="inline-flex items-center">{inner}</Link>;
}
