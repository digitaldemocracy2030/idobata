import chroma from "chroma-js";
import type { ColorPalette } from "../types/siteConfig";

export function generatePrimaryPalette(baseColor: string): ColorPalette {
  const base = chroma(baseColor);

  return {
    50: base.luminance(0.95).hex(),
    100: base.luminance(0.85).hex(),
    200: base.luminance(0.75).hex(),
    300: base.luminance(0.65).hex(),
    400: base.luminance(0.55).hex(),
    500: base.hex(),
    600: base.luminance(0.35).hex(),
    700: base.luminance(0.25).hex(),
    800: base.luminance(0.15).hex(),
    900: base.luminance(0.08).hex(),
    950: base.luminance(0.04).hex(),
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
    50: "hsl(170 64.3% 83.5%)",
    100: "hsl(170 64.1% 77.1%)",
    200: "hsl(170 62.7% 70.6%)",
    300: "hsl(170 62.8% 64.1%)",
    400: "hsl(170 62.2% 57.5%)",
    500: "hsl(170 62.2% 51.2%)",
    600: "hsl(170 77.1% 44.5%)",
    700: "hsl(170 100.0% 38.2%)",
    800: "hsl(170 100.0% 31.8%)",
    900: "hsl(170 100.0% 25.5%)",
    950: "hsl(170 100.0% 19.2%)",
  };
}
