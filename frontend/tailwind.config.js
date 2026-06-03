/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      colors: {
        'pass': '#10b981',
        'fail': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6',
      },
      spacing: {
        'safe': 'max(1rem, env(safe-area-inset-bottom))',
      },
      fontSize: {
        'touch': '1.125rem',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
