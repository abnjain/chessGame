// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs", // Path to your EJS files
    "./public/**/*.js", // Path to your JavaScript files
    "./public/**/*.css", // Path to your CSS files
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

