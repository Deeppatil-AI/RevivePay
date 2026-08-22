/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        razor: {
          dark: '#050a18',
          navy: '#0b192e',
          card: '#0f223d',
          surface: '#14294a',
          border: '#1e3a5f',
          blue: '#3395ff',
          blueHover: '#1d82f5',
          blueGlow: 'rgba(51, 149, 255, 0.25)',
          accent: '#00d2ff',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          textMuted: '#8ba3c7',
          textPrimary: '#ffffff',
          textSecondary: '#c5d8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'razor-glow': '0 0 25px rgba(51, 149, 255, 0.2)',
        'razor-card': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        'success-glow': '0 0 20px rgba(16, 185, 129, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
