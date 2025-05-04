/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

/** カスタマイズ部分 ここから */

const primaryColors = {
  50: "hsl(212 100.0% 91.2%)",
  100: "hsl(214 100.0% 86.5%)",
  200: "hsl(215 100.0% 81.8%)",
  300: "hsl(215 100.0% 77.1%)",
  400: "hsl(216 100.0% 72.4%)",
  500: "hsl(216 100.0% 67.6%)",
  600: "hsl(216 100.0% 62.9%)",
  700: "hsl(216 100.0% 58.4%)",
  800: "hsl(216 73.1% 46.7%)",
  900: "hsl(216 76.5% 35.1%)",
  950: "hsl(216 83.2% 23.3%)",
};
primaryColors.DEFAULT = primaryColors[700];
primaryColors.dark = primaryColors[800];
primaryColors.light = primaryColors[300];
primaryColors.weak = primaryColors[50];
primaryColors.foreground = "#fff";

const secondaryColors = {
  50: colors.gray[50],
  100: colors.gray[100],
  200: colors.gray[200],
  300: colors.gray[300],
  400: colors.gray[400],
  500: colors.gray[500],
  600: colors.gray[600],
  700: colors.gray[700],
  800: colors.gray[800],
  900: colors.gray[900],
  950: colors.gray[950],
};
secondaryColors.DEFAULT = secondaryColors[300];
secondaryColors.dark = secondaryColors[200];
secondaryColors.light = secondaryColors[100];
secondaryColors.weak = secondaryColors[50];
secondaryColors.foreground = "#fff";

const accentColors = {
  50: "hsl(170 64.3% 83.5%)",
  100: "hsl(170 64.1% 77.1%)",
  200: "hsl(170 62.7% 70.6%)",
  300: "hsl(170 62.8% 64.1%)",
  400: "hsl(170 62.2% 57.5%)",
  500: "hsl(170 62.2% 51.2%)",
  600: "hsl(170 77.1% 44.5%)",
  700: "hsl(170 100.0% 38.2%)",
  800: "hsl(170 100.0% 31.8%)",
  900: "hsl(170 100.0% 25.5%)",
  950: "hsl(170 100.0% 19.2%)",
};

accentColors.DEFAULT = accentColors[700];
accentColors.dark = accentColors[800];
accentColors.light = accentColors[100];
accentColors.weak = accentColors[50];
accentColors.foreground = "#000";

/** カスタマイズ部分 ここまで */

module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: primaryColors,
        secondary: secondaryColors,
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: accentColors,
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        accentGradient: `linear-gradient(to right, ${primaryColors.light}, ${accentColors.light})`,
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
