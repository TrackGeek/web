/// <reference types="vite/client" />

/**
 * @vitejs/plugin-react - React plugin for Vite
 *
 * https://vite.dev/guide/env-and-mode#intellisense-for-typescript
 */

type ViteTypeOptions = Record<string, never>;

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
