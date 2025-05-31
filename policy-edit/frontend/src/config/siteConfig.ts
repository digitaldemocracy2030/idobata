import type { SiteConfig } from "../types/siteConfig";
import {
  generatePrimaryPalette,
  getFixedAccentPalette,
  getFixedSecondaryPalette,
} from "../utils/colorUtils";

const DEFAULT_SITE_NAME = "いどばた政策";
const DEFAULT_LOGO_URL = "";
const DEFAULT_PRIMARY_COLOR = "#ff6b35";

// 環境変数のデバッグ
console.log("=== Policy-Edit Environment Variables Debug ===");
console.log("VITE_SITE_NAME:", import.meta.env.VITE_SITE_NAME);
console.log("VITE_SITE_LOGO_URL:", import.meta.env.VITE_SITE_LOGO_URL);
console.log("VITE_PRIMARY_COLOR:", import.meta.env.VITE_PRIMARY_COLOR);
console.log("DEFAULT_PRIMARY_COLOR:", DEFAULT_PRIMARY_COLOR);
console.log("All import.meta.env:", import.meta.env);
console.log("===============================================");

const primaryColor = import.meta.env.VITE_PRIMARY_COLOR || DEFAULT_PRIMARY_COLOR;
console.log("Final primary color used:", primaryColor);

export const siteConfig: SiteConfig = {
  siteName: import.meta.env.VITE_SITE_NAME || DEFAULT_SITE_NAME,
  logoUrl: import.meta.env.VITE_SITE_LOGO_URL || DEFAULT_LOGO_URL,
  colors: {
    primary: generatePrimaryPalette(primaryColor),
    secondary: getFixedSecondaryPalette(),
    accent: getFixedAccentPalette(),
  },
};

console.log("Generated siteConfig:", siteConfig);
