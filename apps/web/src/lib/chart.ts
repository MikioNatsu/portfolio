export interface ChartPoint {
  x: number;
  y: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Smooth SVG path through `points` using monotone cubic interpolation
 * (Fritsch–Carlson). Unlike Catmull-Rom it never overshoots, so a curve of
 * counts can't dip below zero or bulge past a peak between samples.
 * Points must be sorted by `x`.
 */
export function monotonePath(points: ChartPoint[]): string {
  const count = points.length;
  const first = points[0];
  if (!first) return '';
  if (count === 1) return `M${round(first.x)},${round(first.y)}`;

  const dx: number[] = [];
  const slopes: number[] = [];
  for (let index = 0; index < count - 1; index += 1) {
    const current = points[index]!;
    const next = points[index + 1]!;
    dx.push(next.x - current.x);
    slopes.push(dx[index]! === 0 ? 0 : (next.y - current.y) / dx[index]!);
  }

  // Initial tangents: average of neighbouring slopes, flat at local extrema.
  const tangents: number[] = new Array(count).fill(0);
  tangents[0] = slopes[0]!;
  tangents[count - 1] = slopes[count - 2]!;
  for (let index = 1; index < count - 1; index += 1) {
    const before = slopes[index - 1]!;
    const after = slopes[index]!;
    tangents[index] = before * after <= 0 ? 0 : (before + after) / 2;
  }

  // Constrain tangents so each segment stays monotone.
  for (let index = 0; index < count - 1; index += 1) {
    const slope = slopes[index]!;
    if (slope === 0) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      continue;
    }
    const a = tangents[index]! / slope;
    const b = tangents[index + 1]! / slope;
    const magnitude = a * a + b * b;
    if (magnitude > 9) {
      const tau = 3 / Math.sqrt(magnitude);
      tangents[index] = tau * a * slope;
      tangents[index + 1] = tau * b * slope;
    }
  }

  let path = `M${round(first.x)},${round(first.y)}`;
  for (let index = 0; index < count - 1; index += 1) {
    const current = points[index]!;
    const next = points[index + 1]!;
    const third = dx[index]! / 3;
    path +=
      ` C${round(current.x + third)},${round(current.y + tangents[index]! * third)}` +
      ` ${round(next.x - third)},${round(next.y - tangents[index + 1]! * third)}` +
      ` ${round(next.x)},${round(next.y)}`;
  }
  return path;
}

/** Evenly spaced indices for axis labels, always including first and last. */
export function tickIndices(length: number, maxTicks = 5): number[] {
  if (length <= 0) return [];
  if (length <= maxTicks) return Array.from({ length }, (_, index) => index);
  const step = (length - 1) / (maxTicks - 1);
  return Array.from({ length: maxTicks }, (_, index) => Math.round(index * step));
}
