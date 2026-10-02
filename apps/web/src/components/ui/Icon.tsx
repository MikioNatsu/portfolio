import type { SVGProps } from 'react';
import {
  Activity,
  AudioLines,
  Boxes,
  Brain,
  Briefcase,
  CodeXml,
  Cpu,
  Database,
  ExternalLink,
  Figma,
  Github,
  Globe,
  Heart,
  Instagram,
  Layers,
  Linkedin,
  Mail,
  MessageCircle,
  MessagesSquare,
  Palette,
  Rocket,
  Send,
  Sparkles,
  Star,
  Terminal,
  Twitter,
  Users,
  WandSparkles,
  Youtube,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Single source of truth for iconography.
 *
 * Content fields (`Skill.icon`, `SocialLink.icon`, `Technology.icon`) store a
 * plain string, so every lookup goes through this registry with a sane
 * fallback — a missing icon name can never break a card.
 */
const REGISTRY: Record<string, LucideIcon> = {
  // Social
  github: Github,
  telegram: Send,
  instagram: Instagram,
  twitter: Twitter,
  discord: MessagesSquare,
  youtube: Youtube,
  linkedin: Linkedin,
  mail: Mail,
  globe: Globe,
  chat: MessageCircle,

  // Technologies
  react: Cpu,
  typescript: CodeXml,
  javascript: CodeXml,
  tailwind: Palette,
  nextjs: Rocket,
  nodejs: Terminal,
  python: Terminal,
  nestjs: Boxes,
  postgresql: Database,
  prisma: Layers,
  redis: Layers,
  git: Boxes,
  figma: Figma,
  framer: WandSparkles,
  brain: Brain,
  audio: AudioLines,

  // Profile stats & UI
  sparkles: Sparkles,
  layers: Layers,
  heart: Heart,
  users: Users,
  zap: Zap,
  star: Star,
  briefcase: Briefcase,
  activity: Activity,
  external: ExternalLink,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: string;
  size?: number;
  strokeWidth?: number;
}

/** Renders a lucide icon by registry name, falling back to a neutral glyph. */
export function Icon({ name, size = 20, strokeWidth = 1.6, className, ...rest }: IconProps) {
  const Component = REGISTRY[name?.toLowerCase()] ?? Sparkles;
  return (
    <Component
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={cn('shrink-0', className)}
      aria-hidden="true"
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Technology glyphs                                                           */
/* -------------------------------------------------------------------------- */

type GlyphShape = 'circle' | 'hexagon' | 'diamond' | 'triangle' | 'square' | 'rings';

const GLYPH_SHAPES: Record<string, GlyphShape> = {
  react: 'rings',
  typescript: 'square',
  javascript: 'square',
  tailwind: 'rings',
  nextjs: 'circle',
  nodejs: 'hexagon',
  python: 'rings',
  nestjs: 'hexagon',
  postgresql: 'circle',
  prisma: 'triangle',
  redis: 'rings',
  git: 'diamond',
  figma: 'circle',
  framer: 'diamond',
  brain: 'circle',
  audio: 'rings',
};

function shapePath(shape: GlyphShape): string {
  switch (shape) {
    case 'hexagon':
      return 'M32 6 L55 19 L55 45 L32 58 L9 45 L9 19 Z';
    case 'diamond':
      return 'M32 5 L59 32 L32 59 L5 32 Z';
    case 'triangle':
      return 'M32 6 L58 55 L6 55 Z';
    case 'square':
      return 'M11 11 H53 V53 H11 Z';
    case 'circle':
    case 'rings':
    default:
      return 'M32 6 A26 26 0 1 1 31.9 6 Z';
  }
}

export interface TechGlyphProps {
  name: string;
  slug?: string;
  color?: string | null;
  size?: number;
  className?: string;
}

/**
 * Original, generated brand mark: a geometric frame in the technology's accent
 * colour plus its monogram. Deliberately not a copy of third-party logo art.
 */
export function TechGlyph({ name, slug, color, size = 44, className }: TechGlyphProps) {
  const key = (slug ?? name ?? '').toLowerCase();
  const shape = GLYPH_SHAPES[key] ?? 'hexagon';
  const accent = color ?? '#A855F7';
  const monogram = (name ?? '?')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 2)
    .toUpperCase();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn('shrink-0', className)}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id={`tg-${key}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id={`tg-${key}-stroke`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {shape === 'rings' ? (
        <>
          <circle cx="32" cy="32" r="9" fill={accent} fillOpacity="0.9" />
          <ellipse
            cx="32"
            cy="32"
            rx="25"
            ry="10"
            fill="none"
            stroke={`url(#tg-${key}-stroke)`}
            strokeWidth="1.6"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="25"
            ry="10"
            fill="none"
            stroke={`url(#tg-${key}-stroke)`}
            strokeWidth="1.6"
            transform="rotate(60 32 32)"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="25"
            ry="10"
            fill="none"
            stroke={`url(#tg-${key}-stroke)`}
            strokeWidth="1.6"
            transform="rotate(120 32 32)"
          />
        </>
      ) : (
        <>
          <path d={shapePath(shape)} fill={`url(#tg-${key}-fill)`} />
          <path
            d={shapePath(shape)}
            fill="none"
            stroke={`url(#tg-${key}-stroke)`}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <text
            x="32"
            y="33"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="18"
            fontWeight="700"
            fill={accent}
            fillOpacity="0.95"
          >
            {monogram}
          </text>
        </>
      )}
    </svg>
  );
}
