/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

/** カスタマイズ部分 ここから */

const primaryColors = {
  50: "var(--color-primary-50)",
  100: "var(--color-primary-100)",
  200: "var(--color-primary-200)",
  300: "var(--color-primary-300)",
  400: "var(--color-primary-400)",
  500: "var(--color-primary-500)",
  600: "var(--color-primary-600)",
  700: "var(--color-primary-700)",
  800: "var(--color-primary-800)",
  900: "var(--color-primary-900)",
  950: "var(--color-primary-950)",
};
primaryColors.DEFAULT = primaryColors[700];
primaryColors.dark = primaryColors[800];
primaryColors.light = primaryColors[300];
primaryColors.weak = primaryColors[50];
primaryColors.foreground = "#fff";

const secondaryColors = {
  50: "var(--color-secondary-50)",
  100: "var(--color-secondary-100)",
  200: "var(--color-secondary-200)",
  300: "var(--color-secondary-300)",
  400: "var(--color-secondary-400)",
  500: "var(--color-secondary-500)",
  600: "var(--color-secondary-600)",
  700: "var(--color-secondary-700)",
  800: "var(--color-secondary-800)",
  900: "var(--color-secondary-900)",
  950: "var(--color-secondary-950)",
};
secondaryColors.DEFAULT = secondaryColors[300];
secondaryColors.dark = secondaryColors[200];
secondaryColors.light = secondaryColors[100];
secondaryColors.weak = secondaryColors[50];
secondaryColors.foreground = "#fff";

const accentColors = {
  50: "var(--color-accent-50)",
  100: "var(--color-accent-100)",
  200: "var(--color-accent-200)",
  300: "var(--color-accent-300)",
  400: "var(--color-accent-400)",
  500: "var(--color-accent-500)",
  600: "var(--color-accent-600)",
  700: "var(--color-accent-700)",
  800: "var(--color-accent-800)",
  900: "var(--color-accent-900)",
  950: "var(--color-accent-950)",
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
      /**
       * ===== カラーシステムの使用ルール =====
       *
       * 1. 基本方針:
       *    - 特定の政党と色が被らないよう、UIとして一般的なブルーをPrimaryカラーとして採用
       *    - カラースケールを活用し、index.cssでの個別定義を避ける
       *    - 直接的なカラーコード（#RRGGBB）の使用は禁止
       *
       * 2. カラースケールの定義:
       *    - このファイル冒頭で primaryColors, secondaryColors, accentColors として定義
       *    - 利用者ごとにカラーを変えたい場合は、これらの定義を変更する
       *    - 各カラーは50〜950までの階調と、light/dark/weakのバリエーションを持つ
       *
       * 3. カラーの使用方法:
       *    - プレフィックス + カラー名 + 階調の形式で使用: bg-primary-500, text-secondary-200 など
       *    - プレフィックスの例: bg-, text-, border-, ring- など
       *    - 階調を省略した場合はDEFAULT値（通常は500）が使用される: bg-primary
       *    - バリエーションは -light, -dark, -weak で指定: bg-primary-light
       *
       * 4. 禁止事項:
       *    - bg-[#cccccc] のような直接カラーコードの指定は禁止
       *    - bg-purple-xxx のような特定色名の使用は禁止
       *    - index.cssでの独自カラークラスの追加は極力避ける
       *
       * 5. 推奨される使用例:
       *    - ボタン（プライマリ）: bg-primary-500 text-white
       *    - ボタン（セカンダリ）: bg-secondary-500 text-white
       *    - 強調表示: bg-accent-500 text-white
       *    - 薄い背景: bg-primary-weak
       *    - ホバー状態: hover:bg-primary-600
       *    - アクティブ状態: active:bg-primary-700
       */
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
