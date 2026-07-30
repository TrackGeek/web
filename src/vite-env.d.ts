/// <reference types="vite/client" />

/**
 * @vitejs/plugin-react - React plugin for Vite
 *
 * https://vite.dev/guide/env-and-mode#intellisense-for-typescript
 */

type ViteTypeOptions = Record<string, never>;

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_OG_IMAGE_HOSTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
