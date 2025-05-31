import { siteConfig } from "../config/siteConfig";

export function generateCSSVariables(): string {
  const { colors } = siteConfig;

  return `
    :root {
      --color-primary-50: ${colors.primary[50]};
      --color-primary-200: ${colors.primary[200]};
      --color-primary-500: ${colors.primary[500]};
      --color-primary-700: ${colors.primary[700]};
      --color-primary-900: ${colors.primary[900]};

      --color-secondary-50: ${colors.secondary[50]};
      --color-secondary-200: ${colors.secondary[200]};
      --color-secondary-500: ${colors.secondary[500]};
      --color-secondary-700: ${colors.secondary[700]};
      --color-secondary-900: ${colors.secondary[900]};

      --color-accent-50: ${colors.accent[50]};
      --color-accent-200: ${colors.accent[200]};
      --color-accent-500: ${colors.accent[500]};
      --color-accent-700: ${colors.accent[700]};
      --color-accent-900: ${colors.accent[900]};
    }
  `;
}

export function injectCSSVariables(): void {
  const styleElement = document.createElement("style");
  styleElement.textContent = generateCSSVariables();
  document.head.appendChild(styleElement);
}
