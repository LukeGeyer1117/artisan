/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",       // all HTML templates
    "./**/templates/**/*.html",    // in apps if using Django app structure
    "./static/src/**/*.js",        // optional: JS files that might have class names
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),           // add DaisyUI plugin
  ],
  daisyui: {
    themes: ["light", "dark"],    // optional: enable light/dark themes
  },
}
