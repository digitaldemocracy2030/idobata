/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: [
        '"Inter"',
        '"BIZ UDGothic"',
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ],
    },
    extend: {
      fontFamily: {
        biz: ['"BIZ UDGothic"', "sans-serif"],
        inter: ['"Inter"', "sans-serif"],
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        primary: "var(--color-primary)",
        "bg-sub": "var(--color-bg-sub)",
        accent: {
          DEFAULT: "var(--color-accent)",
          light: "var(--color-accent-light)",
          "super-light": "var(--color-accent-super-light)",
          dark: "var(--color-accent-dark)",
        },
        secondary: "var(--color-secondary)",
      },
    },
  },
  plugins: [],
};
