import chroma from "chroma-js";
import type {
  CSSColorVariables,
  ColorPalette,
  GeneratedColorScheme,
} from "../types/siteConfig";

/**
 * 与えられたベースカラーから、Tailwind風のカラーパレット（50〜950）を生成する関数
 * 明るい色から暗い色までをスムーズなグラデーションで出力
 *
 * @param baseColor - メインカラー（例: "#3b82f6"）
 * @returns カラーパレットオブジェクト
 */
export function generatePrimaryPalette(baseColor: string): ColorPalette {
  // 明るい側から暗い側までの3点で色のスケールを定義
  // chroma.scale() は 0〜1 の間で補間された色を返す
  const scale = chroma
    .scale([
      chroma(baseColor).brighten(2.5), // 明るくした色（L側）
      baseColor, // 基準色（中央）
      chroma(baseColor).darken(2.5), // 暗くした色（D側）
    ])
    .mode("lab"); // LAB色空間で補間（視覚的に自然なグラデーションになる）

  // それぞれの段階で 0.0〜1.0 の位置から色を取得
  return {
    50: scale(0.0).hex(), // 最も明るい色
    100: scale(0.1).hex(),
    200: scale(0.2).hex(),
    300: scale(0.3).hex(),
    400: scale(0.4).hex(),
    500: scale(0.5).hex(), // ベースカラーに近い色
    600: scale(0.6).hex(),
    700: scale(0.7).hex(),
    800: scale(0.8).hex(),
    900: scale(0.9).hex(),
    950: scale(1.0).hex(), // 最も暗い色
  };
}

export function getFixedSecondaryPalette(): ColorPalette {
  return {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  };
}

export function getFixedAccentPalette(): ColorPalette {
  return {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
    950: "#022c22",
  };
}

/**
 * primaryカラーからCSS変数用のカラーセットを生成
 * @param primaryColor - ベースとなるprimaryカラー（例: "#089781"）
 * @param optionalColors - オプショナルで指定するカラー
 * @returns CSS変数とTailwindカラーのセット
 */
export function generateCSSColorVariables(
  primaryColor: string,
  optionalColors?: Partial<CSSColorVariables>
): GeneratedColorScheme {
  const baseColor = chroma(primaryColor);

  const colors = {
    primary: primaryColor,
    bgSub: optionalColors?.bgSub || generateBgSubColor(baseColor),
    accent: optionalColors?.accent || generateAccentColor(baseColor),
    accentLight:
      optionalColors?.accentLight || generateAccentLightColor(baseColor),
    accentSuperLight:
      optionalColors?.accentSuperLight ||
      generateAccentSuperLightColor(baseColor),
    accentDark:
      optionalColors?.accentDark || generateAccentDarkColor(baseColor),
    secondary: optionalColors?.secondary || generateSecondaryColor(baseColor),
  };

  return {
    cssVariables: {
      "--color-primary": colors.primary,
      "--color-bg-sub": colors.bgSub,
      "--color-accent": colors.accent,
      "--color-accent-light": colors.accentLight,
      "--color-accent-super-light": colors.accentSuperLight,
      "--color-accent-dark": colors.accentDark,
      "--color-secondary": colors.secondary,
    },
    tailwindColors: {
      primary: "var(--color-primary)",
      "bg-sub": "var(--color-bg-sub)",
      accent: "var(--color-accent)",
      "accent-light": "var(--color-accent-light)",
      "accent-super-light": "var(--color-accent-super-light)",
      "accent-dark": "var(--color-accent-dark)",
      secondary: "var(--color-secondary)",
    },
  };
}

/**
 * モノクロマティック配色でaccentカラーを生成
 */
export function generateAccentColors(primaryColor: string): {
  accent: string;
  accentLight: string;
  accentSuperLight: string;
  accentDark: string;
} {
  const baseColor = chroma(primaryColor);

  return {
    accent: baseColor.brighten(0.3).hex(),
    accentLight: baseColor.brighten(0.8).hex(),
    accentSuperLight: baseColor.brighten(1.5).alpha(0.3).css(),
    accentDark: baseColor.darken(0.5).hex(),
  };
}

/**
 * 背景色を生成
 */
export function generateBackgroundColors(primaryColor: string): {
  bgSub: string;
  secondary: string;
} {
  const baseColor = chroma(primaryColor);

  return {
    bgSub: "#f8f8f8", // 固定の明るいグレー
    secondary: baseColor.brighten(2.5).alpha(0.1).css(), // primaryの非常に薄い版
  };
}

function generateBgSubColor(_baseColor: chroma.Color): string {
  return "#f8f8f8"; // 固定の明るいグレー
}

function generateAccentColor(baseColor: chroma.Color): string {
  return baseColor.brighten(0.3).hex();
}

function generateAccentLightColor(baseColor: chroma.Color): string {
  return baseColor.brighten(0.8).hex();
}

function generateAccentSuperLightColor(baseColor: chroma.Color): string {
  return baseColor.brighten(1.5).alpha(0.3).css();
}

function generateAccentDarkColor(baseColor: chroma.Color): string {
  return baseColor.darken(0.5).hex();
}

function generateSecondaryColor(baseColor: chroma.Color): string {
  return baseColor.brighten(2.5).alpha(0.1).css();
}
