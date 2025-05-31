export interface ColorPalette {
  50: string; // very light
  200: string; // light
  500: string; // base
  700: string; // dark
  900: string; // very dark
}

export interface SiteConfig {
  siteName: string;
  logoUrl: string;
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    accent: ColorPalette;
  };
}
