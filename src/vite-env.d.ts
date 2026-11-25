/// <reference types="vite/client" />

/** Set by vite.config.ts. */
declare const __APP_BUILD__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
