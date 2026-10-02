import { useId, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import type { AnalyticsBreakdownItem, AnalyticsSeriesPoint } from '@natsu/types';
import { EASE_IOS, SPRING_SOFT } from '@/animations/variants';
import { useElementWidth } from '@/hooks/useMediaQuery';
import { monotonePath, tickIndices } from '@/lib/chart';
import { clamp, cn, formatDay } from '@/lib/utils';
import { TONE_BG, TONE_TEXT, type SysTone } from './tones';

const PAD_TOP = 18;
const PAD_BOTTOM = 6;

/**
 * Smooth area chart of views over time. Dependency-free SVG, measured to its
 * container so strokes stay crisp. Pointer or arrow keys reveal each day.
 */
export function AreaChart({
  data,
  height = 220,
  tone = 'accent',
  className,
}: {
  data: AnalyticsSeriesPoint[];
  height?: number;
  tone?: SysTone;
  className?: string;
}) {
  const gradientId = useId().replace(/:/g, '');
  const { ref, width } = useElementWidth<HTMLDivElement>(720);
  const [active, setActive] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center text-[13px] text-sys-secondary', className)}
        style={{ height }}
      >
        No data for this range yet.
      </div>
    );
  }

  const max = Math.max(...data.map((point) => point.views), 1);
  const total = data.reduce((sum, point) => sum + point.views, 0);
  const peak = data.reduce((best, point) => (point.views > best.views ? point : best), data[0]!);
  const plotHeight = height - PAD_TOP - PAD_BOTTOM;
  const points = data.map((point, index) => ({
    x: data.length > 1 ? (index / (data.length - 1)) * width : width / 2,
    y: PAD_TOP + (1 - point.views / max) * plotHeight,
  }));
  const line = monotonePath(points);
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const area = `${line} L${last.x},${height} L${first.x},${height} Z`;
  // Re-run the draw-in when the dataset (not just the width) changes.
  const dataKey = `${data.length}-${data[0]?.date}-${total}`;

  const activePoint = active !== null ? points[active] : undefined;
  const activeDatum = active !== null ? data[active] : undefined;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    setActive(Math.round(ratio * (data.length - 1)));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    setActive((current) => clamp((current ?? data.length - 1) + step, 0, data.length - 1));
  };

  return (
    <div ref={ref} className={cn('w-full', className)}>
      <div
        role="img"
        tabIndex={0}
        aria-label={`Views over time: ${total} in total, peaking at ${peak.views} on ${formatDay(peak.date)}. Use the arrow keys to inspect each day.`}
        className="relative rounded-lg focus-visible:outline-offset-4"
        style={{ height }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
        onFocus={() => setActive(data.length - 1)}
        onBlur={() => setActive(null)}
        onKeyDown={onKeyDown}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className={cn('block overflow-visible', TONE_TEXT[tone])}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`area-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              x2={width}
              y1={PAD_TOP + plotHeight * ratio}
              y2={PAD_TOP + plotHeight * ratio}
              stroke="var(--sys-separator)"
              strokeWidth="1"
              strokeDasharray={ratio === 1 ? undefined : '2 4'}
            />
          ))}

          <motion.path
            key={`area-${dataKey}`}
            d={area}
            fill={`url(#area-${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
          />
          <motion.path
            key={`line-${dataKey}`}
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: EASE_IOS }}
          />
        </svg>

        {activePoint && activeDatum && (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <span
              className="absolute bottom-0 w-px bg-sys-separator"
              style={{ left: activePoint.x, top: PAD_TOP / 2 }}
            />
            <span
              className={cn(
                'absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-sys-surface',
                TONE_BG[tone],
              )}
              style={{ left: activePoint.x, top: activePoint.y }}
            />
            <span
              className="sys-material absolute -top-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-center shadow-sys-pop"
              style={{
                left: clamp(activePoint.x, 48, Math.max(48, width - 48)),
                transform: 'translate(-50%, -100%)',
              }}
            >
              <span className="block text-[13px] font-semibold tabular-nums text-sys-label">
                {activeDatum.views} {activeDatum.views === 1 ? 'view' : 'views'}
              </span>
              <span className="block text-[11px] text-sys-secondary">
                {formatDay(activeDatum.date)}
              </span>
            </span>
          </div>
        )}
      </div>

      <div
        className="relative mt-2 h-4 text-[11px] tabular-nums text-sys-secondary"
        aria-hidden="true"
      >
        {tickIndices(data.length, width < 420 ? 3 : 5).map((index, position, all) => (
          <span
            key={index}
            className="absolute top-0 whitespace-nowrap"
            style={{
              left: points[index]?.x ?? 0,
              transform:
                position === 0
                  ? undefined
                  : position === all.length - 1
                    ? 'translateX(-100%)'
                    : 'translateX(-50%)',
            }}
          >
            {formatDay(data[index]?.date)}
          </span>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {activeDatum ? `${formatDay(activeDatum.date)}: ${activeDatum.views} views` : ''}
      </p>
    </div>
  );
}

/** Horizontal bars that grow in with a staggered spring. */
export function BarBreakdown({
  items,
  tone = 'accent',
  emptyLabel = 'Nothing recorded yet.',
}: {
  items: AnalyticsBreakdownItem[];
  tone?: SysTone;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="py-2 text-[13px] text-sys-secondary">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="space-y-3.5">
      {items.map((item, index) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-sys-label">{item.label}</span>
            <span className="shrink-0 text-[13px] tabular-nums text-sys-secondary">
              {item.value}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sys-fill-4">
            <motion.div
              className={cn('h-full rounded-full', TONE_BG[tone])}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max((item.value / max) * 100, 3)}%` }}
              transition={{ ...SPRING_SOFT, delay: 0.1 + index * 0.05 }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
