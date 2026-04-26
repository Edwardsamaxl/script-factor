/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 核心调色板 - Editorial/Cinematic
        ink: {
          50: '#f7f6f3',
          100: '#ebe8e1',
          200: '#d6d1c4',
          300: '#b8b09d',
          400: '#9a8d78',
          500: '#7d7261',
          600: '#635c4d',
          700: '#4d473c',
          800: '#3d382f',
          900: '#2e2b25',
          950: '#1a1816',
        },
        paper: {
          50: '#fdfcfa',
          100: '#f9f7f3',
          200: '#f2efe8',
          300: '#e8e3d9',
          400: '#d4cfc0',
          500: '#bfb9a6',
        },
        accent: {
          DEFAULT: '#c45d3a', // 赤陶色 - 搭映的主色调
          light: '#e07a5f',
          dark: '#a14a2e',
          muted: '#d4a59a',
        },
        slate: {
          850: '#1a1d23', // 深色背景
        }
      },
      fontFamily: {
        // 使用系统字体栈，追求编辑器/出版物感
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Monaco', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.06)',
        'lifted': '0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08)',
        'inner-soft': 'inset 0 1px 2px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
