import { siteConfig } from "../config/siteConfig";

export function generateCSSVariables(): string {
  const { colors } = siteConfig;

  return `
    :root {
      --color-primary-50: ${colors.primary[50]};
      --color-primary-100: ${colors.primary[100]};
      --color-primary-200: ${colors.primary[200]};
      --color-primary-300: ${colors.primary[300]};
      --color-primary-400: ${colors.primary[400]};
      --color-primary-500: ${colors.primary[500]};
      --color-primary-600: ${colors.primary[600]};
      --color-primary-700: ${colors.primary[700]};
      --color-primary-800: ${colors.primary[800]};
      --color-primary-900: ${colors.primary[900]};
      --color-primary-950: ${colors.primary[950]};

      --color-secondary-50: ${colors.secondary[50]};
      --color-secondary-100: ${colors.secondary[100]};
      --color-secondary-200: ${colors.secondary[200]};
      --color-secondary-300: ${colors.secondary[300]};
      --color-secondary-400: ${colors.secondary[400]};
      --color-secondary-500: ${colors.secondary[500]};
      --color-secondary-600: ${colors.secondary[600]};
      --color-secondary-700: ${colors.secondary[700]};
      --color-secondary-800: ${colors.secondary[800]};
      --color-secondary-900: ${colors.secondary[900]};
      --color-secondary-950: ${colors.secondary[950]};

      --color-accent-50: ${colors.accent[50]};
      --color-accent-100: ${colors.accent[100]};
      --color-accent-200: ${colors.accent[200]};
      --color-accent-300: ${colors.accent[300]};
      --color-accent-400: ${colors.accent[400]};
      --color-accent-500: ${colors.accent[500]};
      --color-accent-600: ${colors.accent[600]};
      --color-accent-700: ${colors.accent[700]};
      --color-accent-800: ${colors.accent[800]};
      --color-accent-900: ${colors.accent[900]};
      --color-accent-950: ${colors.accent[950]};
    }
  `;
}

export function injectCSSVariables(): void {
  const styleElement = document.createElement("style");
  styleElement.textContent = generateCSSVariables();
  document.head.appendChild(styleElement);
}
