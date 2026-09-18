/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*/index.html', './script.js'],
  theme: {
    extend: {
      transitionProperty: {
        DEFAULT: 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-text-decoration-color, -webkit-backdrop-filter',
        colors: 'color, background-color, border-color, text-decoration-color, fill, stroke, -webkit-text-decoration-color'
      }
    }
  },
  plugins: []
};
