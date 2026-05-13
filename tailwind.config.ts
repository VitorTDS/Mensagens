import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        ink: '#17141f',
        cream: '#f8f1eb',
        rose: '#f4d7df',
        blush: '#f29db1',
        plum: '#4e2f4f',
        mist: '#eef1f7',
        sand: '#d8c6c0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
        display: ['"Cormorant Garamond"', 'serif'],
      },
      boxShadow: {
        glow: '0 24px 80px rgba(39, 22, 46, 0.16)',
        soft: '0 16px 40px rgba(18, 10, 20, 0.12)',
      },
      backgroundImage: {
        grain:
          'radial-gradient(circle at top, rgba(255,255,255,0.7), rgba(255,255,255,0)), linear-gradient(120deg, rgba(242,157,177,0.22), rgba(94,65,106,0.18))',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseheart: 'pulseheart 1.3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseheart: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.18)', opacity: '1' },
        },
      },
    },
  },
  plugins: [forms],
} satisfies Config
