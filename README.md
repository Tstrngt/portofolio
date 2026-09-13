# Portfolio

A static, one-page portfolio about physical and digital infrastructure. The site is built with Astro 5, strict TypeScript, Tailwind CSS v4, and progressively enhanced interactions.

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

Structured portfolio content will be added in a later milestone. Once `src/content/` exists, CI rejects any unresolved string beginning with `TODO:`.
