# Agents

## Dev Commands

```bash
bun dev               # Start dev server (requires .env with VITE_API_URL)
bun run build         # Build for production (tsc + vite build)
bun types             # TypeScript type check
bun lint              # Biome lint
bun lint:fix          # Biome lint --write
bun format:fix        # Biome format --write
bun check             # Biome check (lint + import sorting)
bun check:fix         # Biome check --write
bun crowdin:download  # Download translations from Crowdin
bun crowdin:upload    # Upload source strings to Crowdin
```

## Order Matters

`lint:fix` / `check:fix` before commit. Build runs `tsc -b && vite build` so typecheck is included.

## Architecture

- **Router**: TanStack Router with code generation. Route files in `src/routes/`. The generated `src/routeTree.gen.ts` is auto-created — do not edit it.
- **Styling**: TailwindCSS v4 via Vite plugin (`@tailwindcss/vite`). No `tailwind.config.js`.
- **Auth**: Better Auth via `src/lib/auth.ts` / `src/lib/auth`. API base URL comes from `VITE_API_URL` env var.
- **API client**: Axios-based, configured in `src/lib/api.ts`.
- **i18n**: i18next. Locale files live in `src/lib/i18n/locales/<lang>/`. Crowdin manages translations.
- **Entry**: `src/main.tsx` bootstraps the router.

## Key Conventions

- Double quotes in JS/TS (Biome default)
- 2-space indent, 120-char line width
- `useImportType` and `noArrayIndexKey` rules are disabled in Biome
- Generated files excluded from linting: `routeTree.gen.ts` (in `biome.json` ignore)

## PR Requirements

Commit messages follow Angular convention (`feat(...)`, `fix(...)`, etc.) — see `.github/COMMIT_CONVENTION.md`. PR title must match same format. Screenshots/recordings required for every PR.

## VSCode

Recommended extensions (see `.vscode/extensions.json`): Biome, EditorConfig, errorlens, npm/path intellisense, pretty-ts-errors.