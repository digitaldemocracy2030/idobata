import chroma from "chroma-js";
import type {
  AccentPalette,
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

// secondaryカラーの動的生成（常に自動生成）
export function generateSecondaryPalette(primaryColor: string): ColorPalette {
  // primaryカラーから彩度を下げたニュートラルなセカンダリカラーを生成
  const baseHsl = chroma(primaryColor).hsl();
  const secondaryBase = chroma.hsl(
    baseHsl[0], // 同じ色相を維持
    Math.max(0.05, baseHsl[1] * 0.1), // 彩度を大幅に下げる（最小5%）
    0.5 // 明度は中間値
  );

  return generatePrimaryPalette(secondaryBase.hex());
}

// accentカラーの4段階生成（指定がなければprimaryの明るさ違いを自動生成）
export function generateAccentPalette(
  primaryColor: string,
  accentConfig?: {
    accent?: string;
    accentLight?: string;
    accentSuperLight?: string;
    accentDark?: string;
  }
): AccentPalette {
  // accentが指定されている場合はそれを使用、なければprimaryから自動生成
  const accentBase =
    accentConfig?.accent || generateAccentFromPrimaryBrightness(primaryColor);

  return {
    default: accentBase,
    light: accentConfig?.accentLight || chroma(accentBase).brighten(0.5).hex(),
    superLight:
      accentConfig?.accentSuperLight || chroma(accentBase).brighten(1.2).hex(),
    dark: accentConfig?.accentDark || chroma(accentBase).darken(0.8).hex(),
  };
}

// 印象的なアクセントカラー生成（類似色から選択）
function generateAccentFromPrimaryBrightness(baseColor: string): string {
  // primaryカラーの明るさ違いでアクセントカラーを生成
  const baseChroma = chroma(baseColor);

  // 元の色が暗い場合は明るく、明るい場合は少し暗くして印象的にする
  const hsl = baseChroma.hsl();
  const lightness = hsl[2];

  if (lightness < 0.5) {
    // 暗い色の場合：明るくする
    return baseChroma.brighten(1.0).hex();
  }
  // 明るい色の場合：少し暗くして彩度を上げる
  return baseChroma.darken(0.3).saturate(0.5).hex();
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
