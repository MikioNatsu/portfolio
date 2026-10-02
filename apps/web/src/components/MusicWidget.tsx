import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STORAGE_KEYS } from '@/lib/constants';

interface MusicWidgetProps {
  title?: string | null;
  artist?: string | null;
  src?: string | null;
  cover?: string | null;
  className?: string;
}

const BAR_COUNT = 22;

/**
 * Ambient track player.
 *
 * Never autoplays — playback starts only from an explicit click, and when no
 * audio source is configured the widget degrades into a decorative card that
 * still communicates the "current track" idea from the design.
 */
export function MusicWidget({ title, artist, src, cover, className }: MusicWidgetProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEYS.musicMuted) === 'true';
    } catch {
      return false;
    }
  });
  const hasSource = Boolean(src);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    try {
      window.localStorage.setItem(STORAGE_KEYS.musicMuted, String(muted));
    } catch {
      /* ignore */
    }
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <div
      className={cn(
        'glass-strong group w-full max-w-[19rem] rounded-2xl p-3 shadow-[0_24px_60px_-32px_rgba(0,0,0,1)]',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  'linear-gradient(140deg, rgba(124,58,237,0.85), rgba(236,72,153,0.7) 55%, rgba(96,165,250,0.65))',
              }}
              aria-hidden="true"
            />
          )}
          <span
            className={cn(
              'absolute inset-0 rounded-xl border border-accent-fuchsia/30 transition-opacity duration-500',
              playing ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-2xs uppercase tracking-[0.18em] text-haze-400">Now Playing</p>
          <p className="truncate font-display text-sm text-haze-100">{title || '夜のストーリー'}</p>
          <p className="truncate text-2xs text-haze-400">{artist || 'Natsu'}</p>
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={!hasSource}
          aria-label={playing ? 'Pause track' : 'Play track'}
          aria-pressed={playing}
          title={hasSource ? undefined : 'No audio source configured in the admin panel'}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
            hasSource
              ? 'border-accent-violet/45 bg-accent-violet/15 text-white hover:bg-accent-violet/30'
              : 'cursor-not-allowed border-white/10 bg-white/[0.04] text-haze-400',
          )}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="mt-3 flex items-end gap-[3px]" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-6 w-[3px] origin-bottom rounded-full bg-gradient-to-t from-accent-purple/70 to-accent-fuchsia',
              playing && 'animate-bar',
            )}
            style={{
              animationDelay: `${(index % 7) * 0.12}s`,
              height: `${8 + ((index * 7) % 18)}px`,
              opacity: playing ? 1 : 0.35,
            }}
          />
        ))}

        <button
          type="button"
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-haze-400 transition-colors hover:text-white"
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      {hasSource && (
        <audio
          ref={audioRef}
          src={src ?? undefined}
          loop
          preload="none"
          muted={muted}
          onEnded={() => setPlaying(false)}
        />
      )}
    </div>
  );
}
