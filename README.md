# Portfolio

Een persoonlijk portfolio voor Tim van Gorkom met een scrollovergang van digitale netwerken naar wegen, blijvend zichtbare glazen navigatie en afzonderlijke projectgroepen voor IT en civiele techniek. Gebouwd op de bestaande Astro-website, met lokale fonts en normale paginascroll.

## Online

GitHub Pages publiceert via `.github/workflows/pages.yml` bij een push naar `main`.
Zet in **Settings → Pages → Build and deployment → Source** de bron op **GitHub Actions**.
De project-URL is `https://tstrngt.github.io/portofolio/`.

## Je portret toevoegen

Plaats je foto als `public/images/tim-van-gorkom.webp` en commit het bestand. Het portret verschijnt automatisch na de volgende publicatie. Zonder foto toont de site je monogram.

Met `?preview=1` achter de website-URL kun je een foto lokaal uitproberen bij **Over Tim → Foto toevoegen**. Die selectie wordt niet geüpload of blijvend opgeslagen. Gebruik het bestand in de bovenstaande map voor de gepubliceerde foto.

## Requirements

- Node.js 22 LTS
- pnpm 12 through Corepack

## Local development

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The development server is available at `http://localhost:4321`.

## Production build

```sh
pnpm build
pnpm preview
```

Astro writes the static site to `dist/`.

## Verification

Install Chromium once before running the complete local suite:

```sh
pnpm exec playwright install chromium
pnpm verify
```

`pnpm verify` checks formatting, linting, strict types, the production build, unresolved content markers, first-load JavaScript size, local links, accessibility, screenshots, no-JavaScript behavior, reduced motion, and Lighthouse budgets.

## Runtime policy

The built page makes no third-party requests. Fonts are packaged into the build, and there are no analytics, trackers, external scripts, or external font stylesheets.

## Content

De homepage staat in `src/pages/index.astro`, de vormgeving in `src/styles/portfolio.css` en de scrollanimatie in `src/scripts/portfolio.js`. De eerdere componenten blijven in de repository beschikbaar. CI rejects any unresolved string beginning with `TODO:` in `src/content/`.
