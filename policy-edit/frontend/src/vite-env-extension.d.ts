
interface ImportMeta {
  readonly env: {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_GITHUB_REPO_OWNER: string;
    readonly VITE_GITHUB_REPO_NAME: string;
    readonly VITE_POLICY_FRONTEND_ALLOWED_HOSTS: string;
    readonly VITE_AUTH_DRIZZLE_URL: string;
    readonly VITE_AUTH_SECRET: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly SSR: boolean;
    [key: string]: string | boolean | undefined;
  };
}
