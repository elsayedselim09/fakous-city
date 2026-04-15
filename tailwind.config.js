/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { arabic: ['Cairo', 'sans-serif'] },
      colors: {
        brand: {
          50: '#edfdf6', 100: '#d2f9e8', 200: '#a9f1d2',
          300: '#71e4b5', 400: '#38ce93', 500: '#16b378',
          600: '#0d9262', 700: '#0c7551', 800: '#0d5d41',
          900: '#0c4d37', 950: '#052b1f',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32,0.72,0,1)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
