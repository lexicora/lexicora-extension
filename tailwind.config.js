/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // sans: ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
        //sans: ["Figtree", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
        sans: ["Wix Madefor Text", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
