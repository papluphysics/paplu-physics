/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'Syne', 'system-ui', 'sans-serif'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#EEF4FF',
          100: '#DDEAFF',
          200: '#B8D1FF',
          300: '#7AABFF',
          400: '#3B82F6',
          500: '#1264F0',
          600: '#0D52CC',
          700: '#0A3FA3',
          800: '#082E7A',
          900: '#051E52',
        },
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
