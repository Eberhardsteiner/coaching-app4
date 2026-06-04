# Coaching-App — Fundament & Design-System (WP0)

Browserbasierte Single-Page-App (kein Backend) für einen mehrphasigen
systemischen Coaching-Prozess. Dieser Stand (WP0 / Prompt 1) liefert das
technische Fundament und die visuelle Sprache. Routing, Inhalte und Persistenz
folgen in späteren Prompts.

## Stack

- **Vite** + **React** + **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first über `@theme`, Plugin `@tailwindcss/vite`)
- **shadcn/ui** (Komponenten on-demand; Button als Smoke-Test)
- **Self-hosted Fonts** via `@fontsource-variable` (keine Laufzeit-CDNs)
- **ESLint** + **Prettier**

## Befehle

```bash
npm install        # Abhängigkeiten installieren
npm run dev        # Dev-Server (Vite)
npm run build      # tsc -b (strict) + Production-Build
npm run preview    # Production-Build lokal ansehen
npm run lint       # ESLint
npm run format     # Prettier (schreibend)
npm run typecheck  # tsc -b
```

Nach `npm run dev` zeigt die App eine **Design-System-Demoseite**
(`src/routes/DesignSystem.tsx`), die alle Tokens belegt. Diese Seite wird in
Prompt 2 durch die echte App-Shell ersetzt.

## Ordnerstruktur

```
src/
  app/          App-Root + Provider-Shell
  components/
    ui/         shadcn-Komponenten (button.tsx)
    layout/     App-Shell (ab Prompt 2)
  config/       branding.ts, constants.ts
  features/     Fachmodule (ab Prompt 2)
  lib/          Utilities (cn)
  routes/       Seiten/Routen (DesignSystem-Demo)
  styles/       tokens.css, global.css
```

## Design-Tokens

Single source of truth ist `src/styles/tokens.css`. Die Tokens sind als
Tailwind-v4-`@theme` definiert und damit gleichzeitig CSS-Custom-Properties
(`var(--…)`) **und** Quelle der Utilities:

- **Farb-Rampen:** Grün (Primär/Wachstum), Blau (Struktur/Coach),
  Pink (nur IST-Zustände), Teal & Amber (Akzente) → `bg-green-600`, `text-blue-400`, …
- **Semantik:** `bg-background`, `bg-surface`, `border-subtle`, `text-muted`,
  `text-faint`, `bg-accent` (persona-abhängig), `text-ist` / `bg-ist`.
- **Radien:** `--radius-sm|md|lg|xl` → `rounded-sm|md|lg|xl`.
- **Hero-Verlauf:** Token `--gradient-hero` + Utility `.bg-hero-gradient`.
- **Ruhiger Puls:** `.animate-pulse-calm` (9 s, scale 1→1.07, opacity .82→1);
  deaktiviert bei `prefers-reduced-motion: reduce`.

## Wording-Regel (verbindlich)

Keine echten Namen im Code oder UI. Alle marken-/namensbezogenen Strings liegen
als Platzhalter in `src/config/branding.ts`; Komponenten lesen ausschließlich
`BRANDING.*`.
