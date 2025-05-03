/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card-bg)',
        border: 'var(--card-border)',
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        success: 'var(--success)',
      },
    },
  },
  plugins: [],
} 