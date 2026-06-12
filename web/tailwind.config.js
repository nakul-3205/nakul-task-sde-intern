/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f6f2ea',
        'paper-2': '#efe8da',
        ink: '#1a1714',
        'ink-muted': '#6b635a',
        line: '#d9d2c4',
        accent: '#c7522a',
        'accent-soft': '#f1d9cf',
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
