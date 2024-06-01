// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/index.ejs", // Path to your EJS files
    "./public/scripts/game.js", // Path to your JavaScript files
    "./public/styles/game.css", // Path to your CSS files
    "./src/**/*.{html,js,jsx}"
  ],
  purge: [],
  darkMode: true, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

