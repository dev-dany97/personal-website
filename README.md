# d-mohles.de

The source code of my personal website [d-mohles.de](https://d-mohles.de): my projects, travels, gaming setup and finance, in German and English.

I made this repository public to show how I built and host my own website, from a first static version in 2023 to a full Next.js app in 2026. The commit history follows that path.

| Version | Built | Stack | Folder |
|---|---|---|---|
| 1 | 2023/2024 | Pug, SCSS and Bootstrap 5 on top of the Start Bootstrap Grayscale theme, compiled to static HTML. Hosted in a private S3 bucket behind CloudFront, later described with Terraform | [`v1/`](v1/) |
| 2 | 2026 | Next.js (App Router), React 19, Bootstrap, i18next, SQLite as content store, Vitest and Playwright | root |

Photos, videos, certificates and everything about my own server are not part of this repository.

## How version 2 works

**Content in one file.** All texts, projects, travel stories, the hardware list and my resume live in `src/lib/seed-data.ts`. On start the server writes them into a small SQLite database (`node:sqlite`, no extra dependency) and rebuilds it whenever that file changes. The pages read their content from API routes in `src/app/api/`, so the layout code stays free of long texts.

**Two languages.** Interface labels come from `src/app/locales/de.json` and `en.json` via i18next. Every content entry in the seed data has a `_de` and an `_en` field.

**Pages.**

| Route | What it shows |
|---|---|
| `/` | About me, stats, motto |
| `/projects` | Project cards with topic filter, image gallery and fullscreen view |
| `/travel` | Destinations on an animated globe, photo galleries |
| `/setup` | Gaming setup as a neon cockpit: hardware matrix, 3D model of my PC (`public/pc-modell.html`, loaded on tap), live Valorant rank, GTA VI countdown |
| `/finance` | Stock and crypto allocation in percent (never amounts), watchlist, trading rules, reading list, and a daily market briefing written by the Claude API |
| `/contact` | Resume, certificates with proofs, contact form via Formspree |
| `/impressum`, `/datenschutz` | Legal pages |

**External data.** The finance page reads my Binance wallet with a read-only key and stock prices from Yahoo Finance. The morning briefing uses the Claude API with web search and falls back to RSS headlines; every answer is checked before it is stored, and visitors see the last good briefing while a new one is generated. The Valorant rank comes from the HenrikDev API. All of these are cached in SQLite and the API routes are rate-limited (`src/proxy.ts`). Without keys the affected sections simply show a notice.

**Security headers.** `next.config.mjs` sets a strict Content Security Policy, HSTS, `nosniff`, a referrer policy and a permissions policy. Only my own Home Assistant dashboards may embed the site.

**Tests.** Vitest covers the database, the briefing checks, RSS parsing and the rate limit. Playwright covers navigation, the language switch, the project lightbox and the certificate dialogs. GitHub Actions runs lint, typecheck and both test suites on every push.

## How it is hosted

Version 1 was plain static HTML: a private S3 bucket that only CloudFront can read (Origin Access Control), an ACM certificate, Route 53 for DNS and CloudTrail for audit logs. [`v1/`](v1/) contains the Terraform code and scripts for that setup.

Version 2 needs a server for its API routes, so it runs as a Node.js process behind a reverse proxy with automatic TLS and a CDN in front. Large videos are served from a separate media CDN (`NEXT_PUBLIC_MEDIA_BASE_URL`). Analytics run on Umami Cloud without cookies.

## Running it locally

Requires Node.js 24.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
```

## License

The code is MIT licensed, see [LICENSE](LICENSE). Texts and other content describe my own life and are not covered by it.
