/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_API_BASE_URL: string;
    [key: string]: string;
  };
}
