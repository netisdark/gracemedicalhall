/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0EA5E9',
          dark: '#0284C7',
          light: '#7DD3FC',
        },
        brandBg: '#F0F9FF',
        surface: '#FFFFFF',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
        },
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        border: '#E2E8F0'
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(14, 165, 233, 0.06), 0 2px 6px -1px rgba(14, 165, 233, 0.03)',
        glass: '0 8px 32px 0 rgba(14, 165, 233, 0.08)',
      }
    },
  },
  plugins: [],
}
