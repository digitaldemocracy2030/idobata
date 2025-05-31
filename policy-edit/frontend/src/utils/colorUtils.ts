import chroma from "chroma-js";
import type { ColorPalette } from "../types/siteConfig";

export function generatePrimaryPalette(baseColor: string): ColorPalette {
  const base = chroma(baseColor);
  return {
    50: base.brighten(2).hex(), // very light
    200: base.brighten(1).hex(), // light
    500: base.hex(), // base
    700: base.darken(1).hex(), // dark
    900: base.darken(2).hex(), // very dark
  };
}

export function getFixedSecondaryPalette(): ColorPalette {
  return {
    50: "#f9fafb",
    200: "#e5e7eb",
    500: "#6b7280",
    700: "#374151",
    900: "#111827",
  };
}

export function getFixedAccentPalette(): ColorPalette {
  return {
    50: "#a7f3d0", // hsl(170 64.3% 83.5%) 相当
    200: "#6ee7b7", // light
    500: "#10b981", // base (emerald-500相当)
    700: "#047857", // dark
    900: "#064e3b", // very dark
  };
}
