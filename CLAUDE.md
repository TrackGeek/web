# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev               # Dev server (needs .env with VITE_API_URL)
bun run build         # tsc -b && vite build (typecheck included)
bun start             # Serve prod build via srvx
bun types             # tsc --noEmit typecheck only
bun check:fix         # Biome check + import sort + write (run before commit)
bun lint:fix          # Biome lint --write
bun format:fix        # Biome format --write
bun crowdin:upload    # Push en-US source strings to Crowdin
bun crowdin:download  # Pull translations from Crowdin
```

Use `bun`, never `npm`. No test runner configured — do not add curl/fetch/bash smoke tests.

## Architecture

- **TanStack Start + SSR.** `start.ts` sets `defaultSsr: true`; prod served by `srvx`. Not a pure SPA despite README wording — routes can run server-side, so guard browser-only APIs (`window`, `localStorage`, `document`) with typeof checks (see `getClientLanguage` in `src/lib/i18n/config.ts`).
- **Routing:** TanStack Router, file-based in `src/routes/`. `src/routeTree.gen.ts` is generated — never edit it (also Biome-ignored). Router built in `src/router.tsx`, auth client injected into router context.
- **Styling:** TailwindCSS v4 via `@tailwindcss/vite`. No `tailwind.config.js`; theme lives in `src/global.css`.
- **Auth:** Better Auth (`src/lib/auth.ts`). API base = `VITE_API_URL`.
- **API:** Axios client `src/lib/api.ts`. Data layer = TanStack Query; hooks in `src/hooks/`.
- **Components:** `ui/` shadcn primitives · `shared/` reusable · `pages/` page-level · `layouts/`.
- **SEO:** `VITE_SITE_URL` drives og/twitter URLs during SSR; helpers in `src/lib/utils/seo.ts` and `json-ld.ts`.

## Conventions

- Double quotes, 2-space indent, 120-char width (Biome). `useImportType` + `noArrayIndexKey` off; `noExplicitAny` off under `src/routes/**` only.
- Icons via Iconify: `import { Icon } from "@iconify/react"` → `<Icon icon="lucide:home" />`. Don't add per-icon lucide-react packages.
- Commits/PRs: Angular convention (`feat(...)`, `fix(...)`) — see `.github/COMMIT_CONVENTION.md`.

## i18n — STRICT RULES

Setup: i18next, namespaced JSON per language in `src/lib/i18n/locales/<lang>/<namespace>.json`. Namespaces + supported langs derive automatically from files present. `en-US` is the source of truth; Crowdin manages all others (`crowdin.yml`).

1. **Only ever edit `en-US`.** Never touch, add, or modify files under any other language folder (`de-DE`, `es-ES`, etc.) — translations come from Crowdin only. Editing them corrupts the pipeline.
2. **Before adding any key, search existing en-US JSON for it.** Reuse existing keys instead of creating duplicates or near-duplicate strings. Check `common.json` first — shared/generic strings belong there.
3. Add new keys to the matching namespace (`common`, `pages`, `settings`, `feed`, `user`, `auth`, `api`, `comments`, `library`, `medals`, `notifications`). Keep keys minimal — no throwaway or one-off strings when an existing key fits.
