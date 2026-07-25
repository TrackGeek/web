<p align="center">
  <img src="https://github.com/TrackGeek.png" height="100px">
</p>

<h1 align="center">
  <samp>Web</samp>
</h1>

<h4 align="center">
  <samp>Unified platform for tracking games, movies, series, anime, manga, and books — all in one place.</samp>
</h4>

<p align="center">
  <img src="https://img.shields.io/badge/React-99e3a0?style=for-the-badge&logo=react&logoColor=004b38">
  <img src="https://img.shields.io/badge/TypeScript-99e3a0?style=for-the-badge&logo=typescript&logoColor=004b38">
  <img src="https://img.shields.io/badge/Vite-99e3a0?style=for-the-badge&logo=vite&logoColor=004b38">
  <img src="https://img.shields.io/badge/TailwindCSS-99e3a0?style=for-the-badge&logo=tailwindcss&logoColor=004b38">
  <br>
  <img src="https://img.shields.io/badge/Tanstack-99e3a0?style=for-the-badge&logo=react&logoColor=004b38">
  <img src="https://img.shields.io/badge/shadcn/ui-99e3a0?style=for-the-badge&logo=shadcnui&logoColor=004b38">
  <img src="https://img.shields.io/badge/Radix_UI-99e3a0?style=for-the-badge&logo=radixui&logoColor=004b38">
  <a href="https://translate.trackgeek.net"><img src="https://img.shields.io/badge/Crowdin-99e3a0?style=for-the-badge&logo=crowdin&logoColor=004b38"></a>
</p>

## <samp>About</samp>

<samp>

TrackGeek Web is a React 19 single-page app that powers the unified media tracking experience. Users track progress across six media types — **Anime**, **Manga**, **TV Shows**, **Movies**, **Games**, and **Books** — browse popularity-driven catalogs, write reviews with a rich editor, and interact through a social feed.

The app is fully localized (30 languages via Crowdin) and consumes the [TrackGeek API](https://github.com/TrackGeek/api).

</samp>

## <samp>Features</samp>

<samp>

**Tracking & Catalogs**
- Track Anime, Manga, TV Shows, Movies, Games, and Books with an advanced progress system;
- Episode-level progress and quick status buttons on detail pages;
- Curated catalogs: top, popular, trending, airing, upcoming, anticipated, recent, and recommendations;
- Franchise and relationship views with interactive graphs (sequels, prequels, related media);
- Global search with fuzzy matching.

**Reviews & Content**
- Write reviews with a rich TipTap editor;
- Screenshot uploads with zoomable image previews;
- Cast, characters, and community statistics on detail pages;
- Compare media side by side.

**Social & Profiles**
- Activity feed with multiple views;
- Comments and reactions;
- Public profiles with top favorites and an activity heatmap;
- Custom lists for organizing collections.

**Personalization**
- Full i18n support — 30 languages;
- Dark / Light theme;
- Configurable settings for display and notifications;
- Hide specific content types.

**Payments**
- Subscription and donation flows backed by Stripe (billing, success/error pages).

</samp>

## <samp>Tech Stack</samp>

<samp>

| Category         | Technology                                      |
|------------------|-------------------------------------------------|
| Framework        | React 19                                        |
| Build Tool       | Vite 8                                          |
| Language         | TypeScript 5.9                                  |
| Styling          | TailwindCSS 4                                   |
| Routing          | TanStack Router                                 |
| Data Fetching    | TanStack Query + Axios                          |
| Tables           | TanStack Table                                  |
| UI Components    | shadcn/ui, Radix UI, Base UI                    |
| Editor           | TipTap                                          |
| Graphs / Charts  | @xyflow/react, @uiw/react-heat-map              |
| Animation        | Framer Motion, anime.js                         |
| Forms            | React Hook Form + Zod                           |
| Auth             | Better Auth                                     |
| i18n             | i18next + react-i18next                         |
| URL State        | nuqs                                            |
| Search           | Fuse.js                                         |
| Linting          | Biome                                           |

</samp>

## <samp>Project Structure</samp>

<samp>

```
src/
├── main.tsx                # Application entry
├── global.css              # Global styles / Tailwind layer
├── routeTree.gen.ts        # Generated TanStack Router tree
├── components/
│   ├── layouts/            # Page layouts
│   ├── pages/              # Page-level components (home, feed, details, user, compare)
│   ├── shared/             # Cards, comments, filters, header, sidebar, modals, footer
│   └── ui/                 # shadcn/ui primitives (incl. editor)
├── hooks/                  # Data hooks (comment, favorite, game, list, review)
├── lib/
│   ├── api.ts              # Axios API client
│   ├── auth.ts             # Better Auth client
│   ├── i18n/               # i18next setup + locales (30 languages)
│   ├── comparison.config.ts# Compare feature config
│   ├── mockups/            # Mock data
│   └── utils/              # Helpers (seo, status, genre, infinite scroll, debounce)
├── providers/              # App, TanStack Query, and devtools providers
└── routes/                 # File-based routes (TanStack Router)
```

</samp>

## <samp>Run Locally</samp>

<samp>

**Prerequisites:** Node.js and a running [TrackGeek API](https://github.com/TrackGeek/api) instance.

Clone the project

```bash
git clone https://github.com/TrackGeek/web.git
```

Go to the project directory

```bash
cd web
```

Copy the environment file and fill in the required variables

```bash
cp .env.example .env
```

Install dependencies

```bash
bun install
```

Start the development server

```bash
bun dev
```

</samp>

## <samp>Scripts</samp>

<samp>

| Script                 | Description                                 |
|------------------------|---------------------------------------------|
| `bun dev`              | Start development server (Vite)             |
| `bun run build`        | Type check and build for production         |
| `bun start`            | Preview the production build                |
| `bun types`            | Type check with TypeScript                  |
| `bun lint`             | Run Biome linter                            |
| `bun lint:fix`         | Run Biome linter and apply fixes            |
| `bun check`            | Run Biome checks                            |
| `bun check:fix`        | Run Biome checks and apply fixes            |
| `bun format`           | Check formatting with Biome                 |
| `bun format:fix`       | Format code with Biome                      |
| `bun crowdin:upload`   | Upload source strings to Crowdin            |
| `bun crowdin:download` | Download translations from Crowdin          |
| `bun crowdin:status`   | Show Crowdin translation status             |

</samp>

## <samp>Environment Variables</samp>

<samp>

| Variable          | Description                                          |
|-------------------|-------------------------------------------------------|
| `VITE_API_URL`    | Base URL of the TrackGeek API                        |
| `VITE_SITE_URL`   | Public origin of this site (used for SEO tags)       |

For the Crowdin scripts, set `CROWDIN_PROJECT_ID` and `CROWDIN_API_TOKEN` in your environment.

</samp>

## <samp>Translations</samp>

<samp>

The interface is available in 30 languages. Source strings live in `src/lib/i18n/locales/en-US` and translations are managed through [Crowdin](https://translate.trackgeek.net). Contributions to translations are welcome.

</samp>

## <samp>Contributing</samp>

<samp>

Contributions are always welcome!

See `CONTRIBUTING.md` for ways to get started.

Please adhere to this project's `code of conduct`.

</samp>
