/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1D9E75',
          muted: '#178a66',
        },
        surface: {
          DEFAULT: 'var(--surface-bg)',
          card: 'var(--surface-card)',
          raised: 'var(--surface-raised)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
        },
        fg: {
          DEFAULT: 'var(--text-primary)',
          soft: 'var(--text-soft)',
          muted: 'var(--text-muted)',
          subtle: 'var(--text-subtle)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      maxWidth: {
        card: '28rem',
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
};
