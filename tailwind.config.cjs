module.exports = {
  content: ['./index.html', './script.js', './components/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        tech: ['"Orbitron"', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#0a0a0a',
          neon: '#00d2ff',
          gray: '#8a8a8a',
          border: '#2a2a2a',
        },
      },
    },
  },
};
