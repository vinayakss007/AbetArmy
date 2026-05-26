import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c4ff',
          300: '#a0a0ff',
          400: '#7c6bff',
          500: '#6c47ff',
          600: '#5b2ef5',
          700: '#4d22d9',
          800: '#3f1cb0',
          900: '#351a8f',
          950: '#1f0d61',
        },
        accent: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#bcdfff',
          300: '#8eccff',
          400: '#59b0ff',
          500: '#338eff',
          600: '#1c6ef5',
          700: '#1458e1',
          800: '#1747b6',
          900: '#193f8f',
          950: '#142857',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
