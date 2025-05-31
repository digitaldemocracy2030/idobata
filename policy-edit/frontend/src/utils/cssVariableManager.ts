import type { CSSColorVariables, ColorSystemConfig, SiteConfig } from "../types/siteConfig";
import { generateAccentPalette, generateCSSColorVariables, generatePrimaryPalette, generateSecondaryPalette } from "./colorUtils";

/**
 * CSS変数をDOMに適用
 * @param variables - CSS変数のオブジェクト
 */
export function applyCSSVariables(variables: Record<string, string>): void {
  const root = document.documentElement;

  for (const [property, value] of Object.entries(variables)) {
    root.style.setProperty(property, value);
  }
}

/**
 * CSS変数からTailwindカスタムカラーを生成
 * @param variables - CSS変数のオブジェクト
 * @returns Tailwindで使用可能なカラー設定
 */
export function generateTailwindCustomColors(
  variables: Record<string, string>
): Record<string, string> {
  const tailwindColors: Record<string, string> = {};

  for (const [property] of Object.entries(variables)) {
    const colorName = property.replace("--color-", "").replace(/-/g, "-");
    tailwindColors[colorName] = `var(${property})`;
  }

  return tailwindColors;
}

/**
 * 現在のCSS変数値を取得
 * @param variableName - CSS変数名（例: '--color-primary'）
 * @returns CSS変数の現在値
 */
export function getCSSVariableValue(variableName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
}

/**
 * カラーパレット全体を初期化
 * @param primaryColor - ベースとなるprimaryカラー
 * @param optionalColors - オプショナルカラー
 */
export function initializeColorPalette(
  primaryColor: string,
  optionalColors?: Partial<CSSColorVariables>
): void {
  const colorScheme = generateCSSColorVariables(primaryColor, optionalColors);
  applyCSSVariables(colorScheme.cssVariables);
}

// 新規追加: siteConfigからCSS変数を自動生成
export function generateCSSVariablesFromSiteConfig(colors: SiteConfig['colors']): Record<string, string> {
  const variables: Record<string, string> = {};

  // Primary (11段階)
  for (const [key, value] of Object.entries(colors.primary)) {
    variables[`--color-primary-${key}`] = value;
  }

  // Secondary (11段階)
  for (const [key, value] of Object.entries(colors.secondary)) {
    variables[`--color-secondary-${key}`] = value;
  }

  // Accent (4段階)
  variables['--color-accent'] = colors.accent.default;
  variables['--color-accent-light'] = colors.accent.light;
  variables['--color-accent-super-light'] = colors.accent.superLight;
  variables['--color-accent-dark'] = colors.accent.dark;

  return variables;
}

// 新規追加: siteConfigベースの初期化
export function initializeColorSystem(config: ColorSystemConfig): SiteConfig['colors'] {
  console.log(config);
  const colors = {
    primary: generatePrimaryPalette(config.primary),
    secondary: generateSecondaryPalette(config.primary), // primaryColorから自動生成
    accent: generateAccentPalette(config.primary, {
      accent: config.accent,
      accentLight: config.accentLight,
      accentSuperLight: config.accentSuperLight,
      accentDark: config.accentDark,
    }), // 指定があれば使用、なければprimaryから自動生成
  };

  // CSS変数を自動適用
  const cssVariables = generateCSSVariablesFromSiteConfig(colors);
  applyCSSVariables(cssVariables);

  return colors;
}
