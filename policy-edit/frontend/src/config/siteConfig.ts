import type { SiteConfig } from "../types/siteConfig";
import {
  generatePrimaryPalette,
  getFixedAccentPalette,
  getFixedSecondaryPalette,
} from "../utils/colorUtils";
import { initializeColorPalette } from "../utils/cssVariableManager";

const DEFAULT_SITE_NAME = "いどばた政策";
const DEFAULT_LOGO_URL = "";
const DEFAULT_PRIMARY_COLOR = "#0086cc";

const colorConfig = {
  primary: import.meta.env.VITE_PRIMARY_COLOR || DEFAULT_PRIMARY_COLOR,
  bgSub: import.meta.env.VITE_BG_SUB_COLOR,
  accent: import.meta.env.VITE_ACCENT_COLOR,
  accentLight: import.meta.env.VITE_ACCENT_LIGHT_COLOR,
  accentSuperLight: import.meta.env.VITE_ACCENT_SUPER_LIGHT_COLOR,
  accentDark: import.meta.env.VITE_ACCENT_DARK_COLOR,
  secondary: import.meta.env.VITE_SECONDARY_COLOR,
};

initializeColorPalette(colorConfig.primary, {
  bgSub: colorConfig.bgSub,
  accent: colorConfig.accent,
  accentLight: colorConfig.accentLight,
  accentSuperLight: colorConfig.accentSuperLight,
  accentDark: colorConfig.accentDark,
  secondary: colorConfig.secondary,
});

export const siteConfig: SiteConfig = {
  siteName: import.meta.env.VITE_SITE_NAME || DEFAULT_SITE_NAME,
  logoUrl: import.meta.env.VITE_SITE_LOGO_URL || DEFAULT_LOGO_URL,
  colors: {
    primary: generatePrimaryPalette(colorConfig.primary),
    secondary: getFixedSecondaryPalette(),
    accent: getFixedAccentPalette(),
  },
};
