import { TechGlyph } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

/**
 * A skill's generated glyph on a dark, app-icon-like tile. Skill colours are
 * picked for the dark public site (some are white), so the tile keeps every
 * glyph legible in the admin's light appearance too.
 */
export function GlyphTile({
  name,
  slug,
  color,
  size = 40,
  className,
}: {
  name: string;
  slug?: string;
  color?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[10px] bg-[#141218] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.08)]',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <TechGlyph name={name} slug={slug} color={color} size={Math.round(size * 0.78)} />
    </span>
  );
}
