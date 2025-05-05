/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

const primaryColors = {
  50: '#e6f0ff',
  100: '#cce0ff',
  200: '#99c2ff',
  300: '#66a3ff',
  400: '#3385ff',
  500: '#0066ff', // DEFAULT
  600: '#0052cc',
  700: '#003d99',
  800: '#002966',
  900: '#001433',
  950: '#000a1a',
  light: 'hsl(var(--primary) / 0.8)',
  dark: 'hsl(var(--primary) / 0.9)',
  weak: 'hsl(var(--primary) / 0.2)',
};

const secondaryColors = {
  50: '#f2f2f2',
  100: '#e6e6e6',
  200: '#cccccc',
  300: '#b3b3b3',
  400: '#999999',
  500: '#808080', // DEFAULT
  600: '#666666',
  700: '#4d4d4d',
  800: '#333333',
  900: '#1a1a1a',
  950: '#0d0d0d',
  light: 'hsl(var(--secondary) / 0.8)',
  dark: 'hsl(var(--secondary) / 0.9)',
  weak: 'hsl(var(--secondary) / 0.2)',
};

const accentColors = {
  50: '#f0f0ff',
  100: '#e0e0ff',
  200: '#c2c2ff',
  300: '#a3a3ff',
  400: '#8585ff',
  500: '#6666ff', // DEFAULT
  600: '#5252cc',
  700: '#3d3d99',
  800: '#292966',
  900: '#141433',
  950: '#0a0a1a',
  light: 'hsl(var(--accent) / 0.8)',
  dark: 'hsl(var(--accent) / 0.9)',
  weak: 'hsl(var(--accent) / 0.2)',
};

primaryColors.DEFAULT = primaryColors[500];
primaryColors.foreground = "#fff";

secondaryColors.DEFAULT = secondaryColors[500];
secondaryColors.foreground = "#fff";

accentColors.DEFAULT = accentColors[500];
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
