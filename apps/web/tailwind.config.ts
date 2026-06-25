import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        fjord: {
          50:  '#eef4fb',
          100: '#d4e5f5',
          200: '#a8caeb',
          300: '#7baedf',
          400: '#5592d4',
          500: '#2e76c8',
          600: '#1d5da0',
          700: '#164b84',
          800: '#0f3868',
          900: '#082349',
          950: '#04122a',
        },
        sun: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        arctic: '#f4f7fb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
