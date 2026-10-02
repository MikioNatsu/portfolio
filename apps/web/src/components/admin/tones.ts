/** Apple system colours available to admin components. */
export type SysTone =
  | 'accent'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'gray';

/* Static class maps so Tailwind can see every class at build time. */

export const TONE_BG: Record<SysTone, string> = {
  accent: 'bg-sys-accent-fill',
  blue: 'bg-sys-blue',
  indigo: 'bg-sys-indigo',
  purple: 'bg-sys-purple',
  pink: 'bg-sys-pink',
  red: 'bg-sys-red',
  orange: 'bg-sys-orange',
  yellow: 'bg-sys-yellow',
  green: 'bg-sys-green',
  teal: 'bg-sys-teal',
  gray: 'bg-sys-gray',
};

export const TONE_TEXT: Record<SysTone, string> = {
  accent: 'text-sys-accent',
  blue: 'text-sys-blue',
  indigo: 'text-sys-indigo',
  purple: 'text-sys-purple',
  pink: 'text-sys-pink',
  red: 'text-sys-red',
  orange: 'text-sys-orange',
  yellow: 'text-sys-yellow',
  green: 'text-sys-green',
  teal: 'text-sys-teal',
  gray: 'text-sys-gray',
};
