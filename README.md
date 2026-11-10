# Persönliche Webseite (d-mohles.de)

Der Quellcode meiner persönlichen Webseite [d-mohles.de](https://d-mohles.de): Projekte, Reisen, Gaming-Setup und Finanzen, zweisprachig auf Deutsch und Englisch.

Ich habe das Repo öffentlich gemacht, damit andere sehen können, wie man eine eigene Webseite von Grund auf baut und selbst hostet. Die Historie zeigt beide Versionen:

| Version | Zeitraum | Technik | Ordner |
|---|---|---|---|
| 1 | 2024 | Statische Seite mit Pug, SCSS und Bootstrap, gehostet in einem privaten S3-Bucket hinter CloudFront, Infrastruktur mit Terraform | [`v1/`](v1/) |
| 2 | 2026 | Next.js (App Router), React, Bootstrap, SQLite für die Inhalte, Vitest und Playwright | Hauptverzeichnis |

> Bilder, Zertifikate, Videos und alles, was mit meinem eigenen Server zu tun hat (Deployment, Zugangsdaten, Server-Konfiguration), sind bewusst **nicht** im Repo. Die Seite läuft trotzdem lokal, nur ohne Fotos.

## Schnellstart

Voraussetzung: Node.js 24 (die Inhaltsdatenbank nutzt das eingebaute `node:sqlite`).

```bash
npm ci
cp .env.example .env.local   # alles darf leer bleiben
npm run dev                  # http://localhost:3000
```

Ohne API-Schlüssel laufen alle Seiten. Die Bereiche, die einen Schlüssel brauchen (Binance-Portfolio, Morning Briefing über die Claude-API, Valorant-Profil), zeigen dann einen Hinweis statt Daten.

Prüfen wie in der CI:

```bash
npm run lint
npm run typecheck
npm test            # Vitest
npm run test:e2e    # Playwright
```

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/app/` | Seiten (`page.tsx` je Route), Komponenten, Übersetzungen (`locales/de.json`, `locales/en.json`) |
| `src/app/api/` | Server-Routen für Inhalte, Finance (Binance, Aktien, Briefing), Valorant-Profil |
| `src/lib/seed-data.ts` | **Alle Seiteninhalte**: Texte, Projekte, Reisen, Setup, Lebenslauf |
| `src/lib/db.ts` | SQLite-Zugriff. Die Datenbank wird beim Start aus `seed-data.ts` neu befüllt, sobald sich die Datei ändert |
| `src/proxy.ts` | Einfaches Rate-Limit für `/api` |
| `next.config.mjs` | Security-Header und Content-Security-Policy |
| `public/` | Statische Dateien. Eigene Bilder gehören nach `public/images/` (siehe unten) |
| `tests/e2e/` | Playwright-Tests |
| `v1/` | Die erste Version: statisches Hosting auf AWS mit Terraform und Deploy-Skripten |

## Für die eigene Webseite anpassen

1. **Inhalte:** Texte, Projekte, Reisen und Lebenslauf in `src/lib/seed-data.ts` ändern. Die Struktur der Einträge bleibt gleich, nur die Werte ersetzen.
2. **Bilder:** In passende Unterordner von `public/images/` legen (zum Beispiel `projects/`, `travel/<reiseziel>/`) und in `seed-data.ts` mit dem Pfad ab `/images/...` eintragen. Vorher die Metadaten entfernen, damit keine GPS-Koordinaten mitkommen, zum Beispiel mit `exiftool -all= bild.jpg`.
3. **Impressum und Datenschutz:** `src/app/impressum/` und `src/app/datenschutz/` mit den eigenen Angaben füllen. Für Seiten aus Deutschland ist ein Impressum Pflicht.
4. **Kontaktformular:** Bei [Formspree](https://formspree.io) ein Formular anlegen und die ID in `NEXT_PUBLIC_FORMSPREE_FORM_ID` eintragen.
5. **Social-Links:** in `src/app/components/Icons.tsx`.

## Umgebungsvariablen

Alle Variablen mit Beschreibung stehen in [`.env.example`](.env.example).

- **`NEXT_PUBLIC_*`** wird beim Build fest in den Browser-Code eingebaut. Dort darf nichts Geheimes stehen.
- **API-Schlüssel** gehören nur auf den Server in eine `.env`-Datei, die nie committet wird. Für Binance nur einen Read-only-Schlüssel ohne Handels- und Auszahlungsrechte verwenden.

## Hosting: worauf ich achten würde

Es gibt zwei typische Wege:

- **Rein statisch** (wie Version 1): Dateien in einen privaten S3-Bucket, davor CloudFront mit HTTPS. Günstig, schnell, und es gibt keinen Server, den man pflegen muss. Die komplette Anleitung mit Terraform steht in [`v1/`](v1/).
- **Mit Server** (nötig für die API-Routen von Version 2): `npm run build` und `npm run start` auf einem kleinen Linux-Server, davor ein Reverse-Proxy mit automatischem TLS (zum Beispiel Caddy) und optional ein CDN.

Unabhängig vom Weg:

- Next.js nur auf `127.0.0.1` lauschen lassen, nach außen spricht nur der Reverse-Proxy.
- SSH nur mit Schlüssel, Passwort- und Root-Login aus, in der Firewall nur 22, 80 und 443 öffnen, automatische Sicherheitsupdates einschalten.
- Zugangsdaten für das Deployment (SSH-Schlüssel, Hostnamen) als GitHub-Secrets ablegen, nie im Repo.
- Dependabot aktiv lassen und Sicherheitsupdates für Next.js zeitnah einspielen.
- Security-Header setzen (siehe `next.config.mjs`) und mit [securityheaders.com](https://securityheaders.com) prüfen.

## Lizenz

Der Code steht unter der [MIT-Lizenz](LICENSE). Texte, Fotos und Inhalte beschreiben mein eigenes Leben und sind davon ausgenommen. Ersetze sie durch deine eigenen.
