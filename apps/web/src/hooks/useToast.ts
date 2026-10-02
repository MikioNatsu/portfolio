import { createContext, useContext } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismissal. Errors linger a little longer by default. */
  duration?: number;
}

export interface ToastRecord extends Required<Pick<ToastOptions, 'title' | 'tone' | 'duration'>> {
  id: number;
  description?: string;
}

export interface ToastApi {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/** Lightweight notification banners for the admin panel. */
export function useToast(): ToastApi {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside <Toaster>.');
  return value;
}

/** Normalises user options into a full record. */
export function createToastRecord(id: number, options: ToastOptions): ToastRecord {
  const tone = options.tone ?? 'success';
  return {
    id,
    title: options.title,
    description: options.description,
    tone,
    duration: options.duration ?? (tone === 'error' ? 5200 : 3200),
  };
}
