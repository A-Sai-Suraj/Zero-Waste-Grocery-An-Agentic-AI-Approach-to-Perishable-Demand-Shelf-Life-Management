/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        waste: {
          50: '#ebfff7',
          500: '#19a974',
          700: '#0f7d5a',
        },
      },
    },
  },
  plugins: [],
};
