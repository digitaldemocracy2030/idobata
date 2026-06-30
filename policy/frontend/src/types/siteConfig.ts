export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface CSSColorVariables {
  primary: string;
  bgSub?: string;
  accent?: string;
  accentLight?: string;
  accentSuperLight?: string;
  accentDark?: string;
  secondary?: string;
}

export interface GeneratedColorScheme {
  cssVariables: Record<string, string>;
  tailwindColors: Record<string, string>;
}

// 新規追加: Accentカラー用の4段階パレット
export interface AccentPalette {
  light: string; // accent-light
  default: string; // accent
  superLight: string; // accent-super-light
  dark: string; // accent-dark
}

// CSS変数生成用の新しいインターフェース
export interface ColorSystemConfig {
  primary: string;
  secondary?: string;
  accent?: string;
  accentLight?: string;
  accentSuperLight?: string;
  accentDark?: string;
}

export interface SiteConfig {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    accent: AccentPalette; // 変更: ColorPalette → AccentPalette
  };
}
