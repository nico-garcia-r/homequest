import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F2E0B6',
          dark: '#DFC99A',
          light: '#FAF3E0',
        },
        ink: {
          DEFAULT: '#2C1A0E',
          muted: '#6B4C2A',
          light: '#9B7B5A',
        },
        crimson: {
          DEFAULT: '#7A1E1E',
          dark: '#5C1616',
          light: '#9B2C2C',
        },
        gold: {
          DEFAULT: '#B8860B',
          light: '#E8C84A',
          dark: '#8B6508',
        },
        wood: {
          dark: '#3D2B1F',
          medium: '#6B3F2A',
          light: '#8B5A3C',
        },
        forest: {
          DEFAULT: '#2D5A27',
          light: '#3D7A35',
        },
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'Georgia', 'serif'],
        'cinzel-decorative': ['var(--font-cinzel-decorative)', 'Georgia', 'serif'],
        lora: ['var(--font-lora)', 'Georgia', 'serif'],
        sans: ['var(--font-lora)', 'Georgia', 'serif'],
        mono: ['"Courier New"', 'monospace'],
      },
      boxShadow: {
        medieval: '3px 4px 0 #6B3F2A, 0 2px 12px rgba(44,26,14,0.20)',
        'medieval-sm': '2px 2px 0 #6B3F2A, 0 1px 6px rgba(44,26,14,0.12)',
        'medieval-inset': 'inset 0 2px 6px rgba(44,26,14,0.18)',
        'medieval-gold': '3px 4px 0 #8B6508, 0 2px 12px rgba(184,134,11,0.25)',
      },
      borderRadius: {
        medieval: '3px',
      },
      backgroundImage: {
        'parchment-vignette':
          'radial-gradient(ellipse at 20% 80%, rgba(107,63,42,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(44,26,14,0.07) 0%, transparent 55%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
