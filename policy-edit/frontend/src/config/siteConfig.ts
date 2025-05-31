import type { SiteConfig } from "../types/siteConfig";
import { initializeColorSystem } from "../utils/cssVariableManager";

const DEFAULT_SITE_NAME = "いどばた政策";
const DEFAULT_LOGO_URL = "";
const DEFAULT_PRIMARY_COLOR = "#1c74c8";

console.log(import.meta.env.VITE_COLOR_PRIMARY);
const colorConfig = {
  primary: import.meta.env.VITE_COLOR_PRIMARY || DEFAULT_PRIMARY_COLOR,
  secondary: import.meta.env.VITE_COLOR_SECONDARY, // オプショナル
  accent: import.meta.env.VITE_COLOR_ACCENT, // オプショナル
  accentLight: import.meta.env.VITE_COLOR_ACCENT_LIGHT, // オプショナル
  accentSuperLight: import.meta.env.VITE_COLOR_ACCENT_SUPER_LIGHT, // オプショナル
  accentDark: import.meta.env.VITE_COLOR_ACCENT_DARK, // オプショナル
};

// 統合されたカラーシステムの初期化
const colors = initializeColorSystem(colorConfig);

export const siteConfig: SiteConfig = {
  siteName: import.meta.env.VITE_SITE_NAME || DEFAULT_SITE_NAME,
  logoUrl: import.meta.env.VITE_SITE_LOGO_URL || DEFAULT_LOGO_URL,
  colors,
};
