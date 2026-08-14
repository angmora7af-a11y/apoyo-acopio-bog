import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark:    '#1D4ED8',
          light:   '#EFF6FF',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
