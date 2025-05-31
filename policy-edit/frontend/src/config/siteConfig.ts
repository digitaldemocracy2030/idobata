import type { SiteConfig } from "../types/siteConfig";
import {
  generatePrimaryPalette,
  getFixedAccentPalette,
  getFixedSecondaryPalette,
} from "../utils/colorUtils";

const DEFAULT_SITE_NAME = "いどばた政策";
const DEFAULT_LOGO_URL = "";
const DEFAULT_PRIMARY_COLOR = "#D2E7FF";

const primaryColor = import.meta.env.VITE_PRIMARY_COLOR || DEFAULT_PRIMARY_COLOR;

export const siteConfig: SiteConfig = {
  siteName: import.meta.env.VITE_SITE_NAME || DEFAULT_SITE_NAME,
  logoUrl: import.meta.env.VITE_SITE_LOGO_URL || DEFAULT_LOGO_URL,
  colors: {
    primary: generatePrimaryPalette(primaryColor),
    secondary: getFixedSecondaryPalette(),
    accent: getFixedAccentPalette(),
  },
};
