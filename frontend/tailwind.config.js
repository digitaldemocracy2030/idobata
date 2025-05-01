/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'biz': ['"BIZ UDGothic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
