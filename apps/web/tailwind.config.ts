import type { Config } from 'tailwindcss';

/**
 * Natsu design system.
 * Deep navy → dark purple canvas, neon violet/pink/blue accents, editorial serif
 * display type paired with a clean UI sans and Japanese support.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#04040B',
          900: '#070711',
          850: '#0A0817',
          800: '#0D0B1C',
          700: '#151029',
          600: '#21153B',
          500: '#2E1D52',
          400: '#3D2868',
        },
        accent: {
          purple: '#7C3AED',
          violet: '#A855F7',
          pink: '#EC4899',
          fuchsia: '#F0ABFC',
          blue: '#60A5FA',
          mint: '#5EEAD4',
        },
        haze: {
          100: 'rgba(255,255,255,0.92)',
          200: 'rgba(233,225,255,0.72)',
          300: 'rgba(199,188,231,0.56)',
          400: 'rgba(160,150,196,0.42)',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        jp: ['"Noto Sans JP"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        display: ['clamp(3.25rem, 11vw, 9.5rem)', { lineHeight: '0.88', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(2.5rem, 7vw, 5rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'section-title': ['clamp(1.85rem, 4.2vw, 3.25rem)', { lineHeight: '1.06', letterSpacing: '-0.02em' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      maxWidth: {
        shell: '1360px',
        prose: '68ch',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
        'radial-violet': 'radial-gradient(circle at center, rgba(124,58,237,0.42), transparent 68%)',
        'radial-pink': 'radial-gradient(circle at center, rgba(236,72,153,0.32), transparent 68%)',
        'radial-blue': 'radial-gradient(circle at center, rgba(96,165,250,0.28), transparent 68%)',
        'aurora':
          'linear-gradient(115deg, #7C3AED 0%, #A855F7 24%, #EC4899 52%, #7C3AED 78%, #60A5FA 100%)',
        'text-sheen':
          'linear-gradient(180deg, #FFFFFF 0%, #E9DDFF 42%, #B48CF0 78%, #7C3AED 100%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(168,85,247,0.28), 0 18px 60px -24px rgba(124,58,237,0.65)',
        'glow-sm': '0 0 24px -6px rgba(168,85,247,0.55)',
        'glow-lg': '0 0 90px -20px rgba(168,85,247,0.7)',
        card: '0 24px 70px -32px rgba(0,0,0,0.9)',
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.07)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.22, 1, 0.36, 1)',
        swift: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -14px, 0)' },
        },
        floatSoft: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(0, -9px, 0) rotate(1.2deg)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0, -8%, 0) rotate(0deg)', opacity: '0' },
          '12%': { opacity: '0.85' },
          '85%': { opacity: '0.5' },
          '100%': { transform: 'translate3d(6vw, 108vh, 0) rotate(320deg)', opacity: '0' },
        },
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%', transform: 'scale(1)' },
          '50%': { backgroundPosition: '100% 50%', transform: 'scale(1.08)' },
        },
        sheen: {
          '0%': { backgroundPosition: '-200% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '70%': { transform: 'scale(1.9)', opacity: '0' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { opacity: '0.35' },
          '50%': { opacity: '0.85' },
          '100%': { opacity: '0.35' },
        },
        bar: {
          '0%, 100%': { transform: 'scaleY(0.28)' },
          '50%': { transform: 'scaleY(1)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-120%)' },
          '100%': { transform: 'translateY(320%)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out infinite',
        'float-soft': 'floatSoft 6s ease-in-out infinite',
        drift: 'drift 18s linear infinite',
        aurora: 'aurora 18s ease-in-out infinite',
        sheen: 'sheen 3.2s linear infinite',
        'pulse-ring': 'pulseRing 2.6s cubic-bezier(0.24, 1, 0.32, 1) infinite',
        'spin-slow': 'spinSlow 26s linear infinite',
        'spin-slower': 'spinSlow 54s linear infinite',
        marquee: 'marquee 38s linear infinite',
        shimmer: 'shimmer 3.4s ease-in-out infinite',
        bar: 'bar 1.2s ease-in-out infinite',
        scanline: 'scanline 6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
