/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070B14',
          900: '#0B1120',
          850: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        led: {
          cyan: '#00F0FF',
          blue: '#0066FF',
          sky: '#38BDF8',
          glow: 'rgba(0, 240, 255, 0.15)',
        },
        risk: {
          verde: '#10B981',
          amarillo: '#F59E0B',
          naranjo: '#F97316',
          rojo: '#EF4444',
          gris: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'led-glow': '0 0 20px rgba(0, 240, 255, 0.25)',
        'led-glow-lg': '0 0 35px rgba(0, 240, 255, 0.4)',
        'led-blue': '0 0 20px rgba(0, 102, 255, 0.3)',
      }
    },
  },
  plugins: [],
}
