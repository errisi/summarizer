/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        "h-medium": { raw: "(min-height: 740px)" },
      },
    },
  },
  plugins: [],
}
