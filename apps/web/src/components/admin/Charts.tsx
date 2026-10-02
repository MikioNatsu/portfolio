import { useId } from 'react';
import type { AnalyticsBreakdownItem, AnalyticsSeriesPoint } from '@natsu/types';
import { cn } from '@/lib/utils';

/** Dependency-free SVG charts — small, crisp and theme-aware. */

export function AreaChart({
  data,
  height = 200,
  className,
}: {
  data: AnalyticsSeriesPoint[];
  height?: number;
  className?: string;
}) {
  const gradientId = useId().replace(/:/g, '');
  const width = 720;

  if (data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center text-xs text-haze-400', className)}
        style={{ height }}
      >
        No data for this range yet.
      </div>
    );
  }

  const max = Math.max(...data.map((point) => point.views), 1);
  const step = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((point, index) => ({
    x: index * step,
    y: height - (point.views / max) * (height - 24) - 12,
  }));

  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <div className={cn('w-full', className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Views over time"
      >
        <defs>
          <linearGradient id={`area-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`line-${gradientId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="55%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            x2={width}
            y1={height * ratio}
            y2={height * ratio}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        <path d={area} fill={`url(#area-${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={`url(#line-${gradientId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="2.5" fill="#F0ABFC" />
        ))}
      </svg>

      <div className="mt-2 flex justify-between text-2xs text-haze-400">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

export function BarBreakdown({
  items,
  accent = '#A855F7',
  emptyLabel = 'Nothing recorded yet.',
}: {
  items: AnalyticsBreakdownItem[];
  accent?: string;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-haze-400">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-haze-200">{item.label}</span>
            <span className="shrink-0 text-xs tabular-nums text-haze-400">{item.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max((item.value / max) * 100, 2)}%`,
                background: `linear-gradient(90deg, ${accent}, ${accent}66)`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
