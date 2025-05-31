/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string
    readonly VITE_GITHUB_REPO_OWNER: string
    readonly VITE_GITHUB_REPO_NAME: string
    readonly VITE_SITE_NAME: string
    readonly VITE_SITE_LOGO_URL: string
    readonly VITE_POLICY_FRONTEND_ALLOWED_HOSTS: string
    // Color theme variables
    readonly VITE_COLOR_BG_SUB: string
    readonly VITE_COLOR_ACCENT: string
    readonly VITE_COLOR_ACCENT_LIGHT: string
    readonly VITE_COLOR_ACCENT_SUPER_LIGHT: string
    readonly VITE_COLOR_ACCENT_DARK: string
    readonly VITE_COLOR_PRIMARY: string
    readonly VITE_COLOR_SECONDARY: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
