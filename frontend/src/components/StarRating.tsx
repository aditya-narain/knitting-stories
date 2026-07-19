interface Props {
  value: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}

export default function StarRating({ value, count, size = 16, showCount = true }: Props) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1.5" aria-label={`Rated ${value} out of 5`}>
      <div className="flex">
        {stars.map((s) => {
          const fill = Math.max(0, Math.min(1, value - (s - 1)));
          return (
            <span key={s} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="text-cream-200" />
              <span
                className="absolute left-0 top-0 overflow-hidden"
                style={{ width: `${fill * 100}%`, height: size }}
              >
                <Star size={size} className="text-terracotta-400" />
              </span>
            </span>
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs text-ink-700/70">
          {value.toFixed(1)}
          {count !== undefined ? ` (${count})` : ""}
        </span>
      )}
    </div>
  );
}

function Star({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.86-5-4.87 7.1-1.01L12 2z" />
    </svg>
  );
}
