import chroma from "chroma-js";
import type { ColorPalette } from "../types/siteConfig";

export function generatePrimaryPalette(baseColor: string): ColorPalette {
  const base = chroma(baseColor);
  return {
    50: base.brighten(2.5).hex(),
    100: base.brighten(2).hex(),
    200: base.brighten(1.5).hex(),
    300: base.brighten(1).hex(),
    400: base.brighten(0.5).hex(),
    500: base.hex(),
    600: base.darken(0.5).hex(),
    700: base.darken(1).hex(),
    800: base.darken(1.5).hex(),
    900: base.darken(2).hex(),
    950: base.darken(2.5).hex(),
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
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
    950: "#022c22",
  };
}
