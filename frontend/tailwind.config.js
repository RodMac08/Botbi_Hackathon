/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1C6AFA",
        "background-light": "#f6f7f8",
        "background-dark": "#111d21",
        "card-dark": "#1D2022",
        "market-up": "#22c55e",
        "market-down": "#ef4444"
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "body": ["Manrope", "sans-serif"]
      },
    },
  },
  plugins: [],
}