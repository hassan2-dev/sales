/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_STORE_URL?: string;
  readonly VITE_ADMIN_URL?: string;
  /** Optional CDN/R2 logo URL. Empty → local `/energy-horizon-logo.png`. */
  readonly VITE_LOGO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
