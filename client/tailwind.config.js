/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        'primary': '#E6E6FA',
        'primary-dark': '#D8BFD8',
        'secondary': '#1A1A2E',
      }
    },
  },
}