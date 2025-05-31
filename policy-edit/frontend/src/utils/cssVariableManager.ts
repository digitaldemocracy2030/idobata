import type { CSSColorVariables } from "../types/siteConfig";
import { generateCSSColorVariables } from "./colorUtils";

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
