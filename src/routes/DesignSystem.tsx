import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Demo data
 *
 * Class names are written as *literal* strings so Tailwind's on-demand
 * scanner can see them. Only the shade steps the spec defines exist.
 * ------------------------------------------------------------------ */

type Shade = { step: number; hex: string; className: string };
type Ramp = { name: string; role: string; shades: Shade[] };

const RAMPS: Ramp[] = [
  {
    name: "Grün",
    role: "Primär / Wachstum",
    shades: [
      { step: 50, hex: "#EAF3DE", className: "bg-green-50" },
      { step: 100, hex: "#C0DD97", className: "bg-green-100" },
      { step: 200, hex: "#97C459", className: "bg-green-200" },
      { step: 400, hex: "#639922", className: "bg-green-400" },
      { step: 600, hex: "#3B6D11", className: "bg-green-600" },
      { step: 800, hex: "#27500A", className: "bg-green-800" },
      { step: 900, hex: "#173404", className: "bg-green-900" },
    ],
  },
  {
    name: "Blau",
    role: "Struktur / Coach",
    shades: [
      { step: 50, hex: "#E6F1FB", className: "bg-blue-50" },
      { step: 100, hex: "#B5D4F4", className: "bg-blue-100" },
      { step: 200, hex: "#85B7EB", className: "bg-blue-200" },
      { step: 400, hex: "#378ADD", className: "bg-blue-400" },
      { step: 600, hex: "#185FA5", className: "bg-blue-600" },
      { step: 800, hex: "#0C447C", className: "bg-blue-800" },
      { step: 900, hex: "#042C53", className: "bg-blue-900" },
    ],
  },
  {
    name: "Pink",
    role: "nur IST-Zustände",
    shades: [
      { step: 50, hex: "#FBEAF0", className: "bg-pink-50" },
      { step: 100, hex: "#F4C0D1", className: "bg-pink-100" },
      { step: 400, hex: "#D4537E", className: "bg-pink-400" },
      { step: 600, hex: "#993556", className: "bg-pink-600" },
      { step: 900, hex: "#72243E", className: "bg-pink-900" },
    ],
  },
  {
    name: "Teal",
    role: "Akzent",
    shades: [
      { step: 100, hex: "#9FE1CB", className: "bg-teal-100" },
      { step: 200, hex: "#5DCAA5", className: "bg-teal-200" },
      { step: 600, hex: "#0F6E56", className: "bg-teal-600" },
      { step: 900, hex: "#085041", className: "bg-teal-900" },
    ],
  },
  {
    name: "Amber",
    role: "Akzent / Cluster",
    shades: [
      { step: 50, hex: "#FAEEDA", className: "bg-amber-50" },
      { step: 100, hex: "#FAC775", className: "bg-amber-100" },
      { step: 200, hex: "#EF9F27", className: "bg-amber-200" },
      { step: 600, hex: "#854F0B", className: "bg-amber-600" },
      { step: 900, hex: "#633806", className: "bg-amber-900" },
    ],
  },
];

type Neutral = { name: string; token: string; hex: string; swatch: string };

const NEUTRALS: Neutral[] = [
  { name: "bg", token: "--color-bg", hex: "#FFFFFF", swatch: "bg-background" },
  {
    name: "surface",
    token: "--color-surface",
    hex: "#F7F6F2",
    swatch: "bg-surface",
  },
  {
    name: "surface-2",
    token: "--color-surface-2",
    hex: "#F4F3EE",
    swatch: "bg-surface-2",
  },
  {
    name: "border / subtle",
    token: "--color-border",
    hex: "#E6E4DC",
    swatch: "bg-subtle",
  },
  {
    name: "accent",
    token: "--color-accent",
    hex: "#3B6D11",
    swatch: "bg-accent",
  },
  { name: "ist", token: "--color-ist", hex: "#D4537E", swatch: "bg-ist" },
];

const RADII: { className: string; value: string }[] = [
  { className: "rounded-sm", value: "6px" },
  { className: "rounded-md", value: "8px" },
  { className: "rounded-lg", value: "12px" },
  { className: "rounded-xl", value: "16px" },
];

const TYPE_SCALE: { className: string; label: string }[] = [
  { className: "text-4xl", label: "text-4xl" },
  { className: "text-2xl", label: "text-2xl" },
  { className: "text-xl", label: "text-xl" },
  { className: "text-base", label: "text-base" },
  { className: "text-sm", label: "text-sm" },
  { className: "text-xs", label: "text-xs" },
];

/* ------------------------------------------------------------------ *
 * Local presentational helpers (not exported — keeps fast-refresh happy)
 * ------------------------------------------------------------------ */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Design-System demo route
 *
 * Temporary: replaced by the real app shell + routing in Prompt 2.
 * ------------------------------------------------------------------ */

export function DesignSystem() {
  return (
    <div className="min-h-dvh bg-background">
      {/* ---- Hero: gradient + three calm pulsing circles ------------- */}
      <header className="relative isolate overflow-hidden bg-hero-gradient text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span
            className="animate-pulse-calm absolute left-[8%] top-[20%] size-44 rounded-full bg-teal-200/25 ring-1 ring-white/20"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="animate-pulse-calm absolute right-[12%] top-[28%] size-56 rounded-full bg-blue-400/25 ring-1 ring-white/15"
            style={{ animationDelay: "-3s" }}
          />
          <span
            className="animate-pulse-calm absolute bottom-[-3rem] left-1/3 size-40 rounded-full bg-white/10 ring-1 ring-white/20"
            style={{ animationDelay: "-6s" }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-28">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-100">
            {BRANDING.methodLabel}
          </p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
            „Veränderung beginnt dort, wo wir aufhören, Antworten zu
            verteidigen, und anfangen, bessere Fragen zu stellen.“
          </h1>
          <p className="mt-6 max-w-xl text-base text-blue-100">
            Design-System-Demo für {BRANDING.appName}. Diese Seite belegt
            Farben, Typografie, Radien, den Hero-Verlauf und den ruhigen
            Puls-Effekt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button>
              Loslegen
              <ArrowRight />
            </Button>
            <Button variant="secondary">Mehr erfahren</Button>
          </div>
          <p className="mt-6 text-xs text-blue-100/80">
            Drei Kreise mit ruhigem Puls (9 s) — respektiert
            „prefers-reduced-motion“.
          </p>
        </div>
      </header>

      {/* ---- Token showcase ------------------------------------------ */}
      <main className="mx-auto max-w-5xl space-y-16 px-6 py-16">
        {/* Colour ramps */}
        <Section
          title="Farb-Rampen"
          description="Fünf Rampen mit den im Design-System definierten Abstufungen. Utilities wie bg-green-600 oder bg-blue-400 werden direkt aus den Tokens generiert."
        >
          <div className="space-y-7">
            {RAMPS.map((ramp) => (
              <div key={ramp.name}>
                <div className="mb-2 flex items-baseline gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {ramp.name}
                  </h3>
                  <span className="text-xs text-muted">{ramp.role}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                  {ramp.shades.map((shade) => (
                    <figure key={shade.step}>
                      <div
                        className={cn(
                          shade.className,
                          "h-14 rounded-md border border-subtle",
                        )}
                      />
                      <figcaption className="mt-1.5 text-xs">
                        <span className="font-medium text-foreground">
                          {shade.step}
                        </span>{" "}
                        <span className="text-faint">{shade.hex}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Neutral & semantic */}
        <Section
          title="Neutrale & semantische Tokens"
          description="Hintergründe, Flächen, Rahmen und der persona-abhängige Akzent. Pink/IST ausschließlich für IST-Zustände."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {NEUTRALS.map((n) => (
              <figure key={n.token}>
                <div
                  className={cn(
                    n.swatch,
                    "h-16 rounded-md border border-subtle",
                  )}
                />
                <figcaption className="mt-1.5 text-xs">
                  <span className="block font-medium text-foreground">
                    {n.name}
                  </span>
                  <code className="text-faint">{n.token}</code>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section
          title="Typografie"
          description="Humanistische Sans als UI-Default, Serif für Maximen und Anmoderationen."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-subtle bg-surface p-6">
              <p className="text-xs uppercase tracking-wider text-faint">
                Serif — Maximen / Anmoderationen
              </p>
              <p className="mt-3 font-serif text-2xl leading-snug text-foreground">
                „Eine gute Frage verändert mehr als zehn Antworten.“
              </p>
            </div>
            <div className="rounded-lg border border-subtle bg-surface p-6">
              <p className="text-xs uppercase tracking-wider text-faint">
                Sans — Fließtext (UI-Default)
              </p>
              <p className="mt-3 text-base text-foreground">
                Dieser Absatz nutzt die humanistische Sans als Standard-Schrift
                der Oberfläche — gut lesbar in längeren Texten und neutral im
                Ton.
              </p>
              <p className="mt-2 text-sm text-muted">
                Sekundärer Hinweis in <code>text-muted</code>.
              </p>
            </div>
          </div>

          <dl className="divide-y divide-subtle overflow-hidden rounded-lg border border-subtle">
            {TYPE_SCALE.map((t) => (
              <div
                key={t.label}
                className="flex items-baseline justify-between gap-6 px-5 py-3"
              >
                <span className={cn(t.className, "truncate text-foreground")}>
                  Systemisches Coaching
                </span>
                <code className="shrink-0 text-xs text-faint">{t.label}</code>
              </div>
            ))}
          </dl>
        </Section>

        {/* Buttons (shadcn smoke test) */}
        <Section
          title="Buttons"
          description="shadcn/ui-Button (CVA-Varianten + Radix Slot), verdrahtet mit den Design-Tokens."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Bestätigen">
              <Check />
            </Button>
            <Button>
              <ArrowRight />
              Mit Icon
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        {/* Radii */}
        <Section
          title="Radien"
          description="rounded-sm · md · lg · xl aus den --radius-* Tokens."
        >
          <div className="flex flex-wrap gap-6">
            {RADII.map((r) => (
              <figure key={r.className} className="text-center">
                <div
                  className={cn(
                    r.className,
                    "size-20 border border-subtle bg-surface-2",
                  )}
                />
                <figcaption className="mt-2 text-xs text-muted">
                  <span className="font-medium text-foreground">
                    {r.className}
                  </span>{" "}
                  · {r.value}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* Component preview */}
        <Section
          title="Komponentenvorschau"
          description="Eine kleine Komposition aus den Bausteinen — inklusive IST-Zustand-Badge (text-ist)."
        >
          <div className="rounded-lg border border-subtle bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-serif text-xl text-foreground">
                Phase 1 — Anliegen klären
              </h3>
              <span className="rounded-md bg-pink-50 px-2.5 py-1 text-xs font-medium text-ist">
                IST-Zustand
              </span>
            </div>
            <p className="mt-3 max-w-prose text-sm text-muted">
              Karten dieser Art führen später durch die Phasen des Prozesses.
              Hier dienen sie nur als Beleg für das Zusammenspiel von Flächen,
              Rahmen, Radien, Typo und Buttons.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button size="sm">
                Weiter
                <ArrowRight />
              </Button>
              <Button size="sm" variant="ghost">
                Überspringen
              </Button>
            </div>
          </div>
        </Section>
      </main>

      {/* ---- Footer -------------------------------------------------- */}
      <footer className="border-t border-subtle">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted">
          <p>
            {BRANDING.appName} · {BRANDING.methodLabel}
          </p>
          <p className="mt-1 text-faint">Kontakt: {BRANDING.contactEmail}</p>
        </div>
      </footer>
    </div>
  );
}
