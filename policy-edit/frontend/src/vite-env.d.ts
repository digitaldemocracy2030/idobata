/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GITHUB_REPO_OWNER: string
    readonly VITE_GITHUB_REPO_NAME: string
    readonly VITE_OGP_IMAGE_URL: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
