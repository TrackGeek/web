/// <reference types="vite/client" />
/// <reference types="@son426/vite-image/client" />

/**
 * @vitejs/plugin-react - React plugin for Vite
 *
 * https://vite.dev/guide/env-and-mode#intellisense-for-typescript
 */

type ViteTypeOptions = {}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
