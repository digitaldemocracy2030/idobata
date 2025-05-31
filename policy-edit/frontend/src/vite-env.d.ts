/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GITHUB_REPO_OWNER: string
    readonly VITE_GITHUB_REPO_NAME: string
    readonly VITE_SITE_NAME: string
    readonly VITE_SITE_LOGO_URL: string
    readonly VITE_PRIMARY_COLOR?: string
    readonly VITE_POLICY_FRONTEND_ALLOWED_HOSTS: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
