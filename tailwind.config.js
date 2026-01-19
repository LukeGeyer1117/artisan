/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",       // main Django templates
    "./**/templates/**/*.html",    // templates in apps like core, theme
    "./static/src/**/*.js",        // JS files with Tailwind class names
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
  },
};
