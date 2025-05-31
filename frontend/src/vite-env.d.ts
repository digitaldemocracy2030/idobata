/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_SITE_NAME?: string;
    readonly VITE_SITE_LOGO_URL?: string;
    readonly VITE_PRIMARY_COLOR?: string;
    [key: string]: string | undefined;
  };
}
