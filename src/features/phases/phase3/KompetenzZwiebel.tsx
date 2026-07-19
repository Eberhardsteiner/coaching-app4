import { useState } from "react";

import type { ModelTerm } from "@/features/content/contentTypes";
import { cn } from "@/lib/utils";

/**
 * Layout der Zwiebel (K2): Position und Form je Modell-Element. Die TEXTE
 * kommen weiter aus kompetenzmodell.json (nichts hart codiert) — hier steht
 * nur, WO ein Element sitzt. Ring-Beschriftungen ohne eigenen JSON-Begriff
 * (Reflektierte Erfahrung, Sozial-kommunikative Kompetenz, Fach- &
 * Methodenkompetenz) sind dekorative Ringtexte (aria-hidden).
 */
const CENTER = 260;

/** Die drei weißen Kreise um den SOMA-Kern (auf dem dunkelblauen Innenring). */
const INNER_CIRCLES: { id: string; angle: number; short: string }[] = [
  { id: "motive", angle: -90, short: "Motive" },
  { id: "intelligenzen", angle: 150, short: "Intelligenzen" },
  {
    id: "persoenlichkeitseigenschaften",
    angle: 30,
    short: "Persönlichkeits­eigenschaften",
  },
];

/** Interaktive Ring-Labels (Begriffe aus dem JSON) — Radius + Winkel. */
const RING_LABELS: { id: string; r: number; angle: number; short?: string }[] =
  [
    { id: "innere-antreiber", r: 148, angle: -90 },
    { id: "glaubenssaetze", r: 148, angle: 150 },
    {
      id: "denk-bewertungsstrukturen",
      r: 148,
      angle: 30,
      short: "Denk- & Bewertungsstrukturen",
    },
    { id: "leitwerte", r: 193, angle: -30, short: "Persönliche Leitwerte" },
    { id: "feldkompetenz", r: 238, angle: -140 },
  ];

/** Dekorative Ring-Beschriftungen ohne eigenen Modell-Begriff. */
const DECOR_LABELS: { text: string; r: number; angle: number }[] = [
  { text: "Reflektierte Erfahrung", r: 193, angle: -150 },
  { text: "Sozial-kommunikative Kompetenz", r: 193, angle: 90 },
  { text: "Fach- & Methodenkompetenz", r: 238, angle: -40 },
];

/** Polarkoordinate um den Mittelpunkt (Winkel in Grad, 0° = rechts). */
function polar(r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

/**
 * K2 — das Kompetenzmodell als interaktive Zwiebel-Grafik: SOMA-Kern (accent),
 * drei weiße Kreise (Motive · Persönlichkeitseigenschaften · Intelligenzen)
 * auf dem dunkelblauen Innenring, zwei weitere Ringe mit Beschriftungen,
 * außen Handlungskompetenz (oben) / Selbstorganisation (unten). Jedes Element
 * mit eigenem JSON-Begriff ist fokussierbar (role="button", Hover/Tap/Fokus)
 * und zeigt seine Beschreibung in der aria-live-Erklärkarte darunter
 * (aria-describedby) — das mobile-taugliche Flyover-Muster der Rubikon-Szene.
 */
export function KompetenzZwiebel({ terms }: { terms: ModelTerm[] }) {
  const byId = new Map(terms.map((t) => [t.id, t]));
  const [activeId, setActiveId] = useState("soma");
  const active = byId.get(activeId) ?? byId.get("soma");

  /** Interaktions-Props eines Elements (Hover + Tap/Klick + Tastatur-Fokus). */
  const interactive = (id: string) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": byId.get(id)?.label ?? id,
    "aria-describedby": "zwiebel-detail",
    "aria-pressed": activeId === id,
    onMouseEnter: () => setActiveId(id),
    onFocus: () => setActiveId(id),
    onClick: () => setActiveId(id),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveId(id);
      }
    },
    className: "cursor-pointer focus:outline-none",
  });

  /** Sichtbarer Aktiv-/Fokus-Zustand eines Elements. */
  const isActive = (id: string) => activeId === id;

  return (
    <div className="space-y-3">
      <svg
        viewBox="0 0 520 520"
        role="group"
        aria-label="Kompetenzmodell — Zwiebel von innen nach außen"
        className="mx-auto h-auto w-full max-w-md"
      >
        {/* Äußerste Beschriftung: Handlungskompetenz (oben) /
            Selbstorganisation (unten) — EIN Modell-Begriff, zwei Anker. */}
        <g {...interactive("handlungskompetenz")}>
          <text
            x={CENTER}
            y={22}
            textAnchor="middle"
            className={cn(
              "text-[15px] font-semibold",
              isActive("handlungskompetenz")
                ? "fill-accent"
                : "fill-foreground",
            )}
          >
            Handlungskompetenz
          </text>
          <text
            x={CENTER}
            y={510}
            textAnchor="middle"
            className={cn(
              "text-[15px] font-semibold",
              isActive("handlungskompetenz")
                ? "fill-accent"
                : "fill-foreground",
            )}
          >
            Selbstorganisation
          </text>
        </g>

        {/* Ringe von außen nach innen: hellgrün · dunkel · dunkelblau. */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={238}
          strokeWidth={44}
          className="fill-none stroke-green-200/70"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={193}
          strokeWidth={44}
          className="fill-none stroke-blue-900/80"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={148}
          strokeWidth={44}
          className="fill-none stroke-blue-950"
        />
        {/* Innenfläche, auf der die drei weißen Kreise liegen. */}
        <circle cx={CENTER} cy={CENTER} r={126} className="fill-blue-900" />

        {/* Dekorative Ring-Beschriftungen (kein eigener Modell-Begriff). */}
        {DECOR_LABELS.map((label) => {
          const p = polar(label.r, label.angle);
          return (
            <text
              key={label.text}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              aria-hidden
              className={cn(
                "text-[11px]",
                label.r === 238 ? "fill-green-950" : "fill-white/90",
              )}
            >
              {label.text}
            </text>
          );
        })}

        {/* Interaktive Ring-Labels (Begriffe aus dem JSON). */}
        {RING_LABELS.map((label) => {
          const term = byId.get(label.id);
          if (!term) return null;
          const p = polar(label.r, label.angle);
          return (
            <g key={label.id} {...interactive(label.id)}>
              <text
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn(
                  "text-[11px] font-medium",
                  label.r === 238
                    ? isActive(label.id)
                      ? "fill-green-950 underline"
                      : "fill-green-950"
                    : isActive(label.id)
                      ? "fill-white underline"
                      : "fill-white/90",
                )}
              >
                {label.short ?? term.label}
              </text>
            </g>
          );
        })}

        {/* Die drei weißen Kreise: Motive · PE · Intelligenzen. */}
        {INNER_CIRCLES.map((circle) => {
          const term = byId.get(circle.id);
          if (!term) return null;
          const p = polar(78, circle.angle);
          const lines = circle.short.split("­");
          return (
            <g key={circle.id} {...interactive(circle.id)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={40}
                className={cn(
                  "fill-white",
                  isActive(circle.id) ? "stroke-accent" : "stroke-blue-950/40",
                )}
                strokeWidth={isActive(circle.id) ? 3 : 1.5}
              />
              {lines.length > 1 ? (
                <>
                  <text
                    x={p.x}
                    y={p.y - 5}
                    textAnchor="middle"
                    className="fill-blue-950 text-[10px] font-medium"
                  >
                    {lines[0]}-
                  </text>
                  <text
                    x={p.x}
                    y={p.y + 7}
                    textAnchor="middle"
                    className="fill-blue-950 text-[10px] font-medium"
                  >
                    {lines[1]}
                  </text>
                </>
              ) : (
                <text
                  x={p.x}
                  y={p.y + 3}
                  textAnchor="middle"
                  className="fill-blue-950 text-[11px] font-medium"
                >
                  {lines[0]}
                </text>
              )}
            </g>
          );
        })}

        {/* Der Kern: SOMA. */}
        <g {...interactive("soma")}>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={30}
            className={cn(
              "fill-accent",
              isActive("soma") ? "stroke-foreground" : "stroke-transparent",
            )}
            strokeWidth={2}
          />
          <text
            x={CENTER}
            y={CENTER + 4}
            textAnchor="middle"
            className="fill-white text-[12px] font-semibold"
          >
            SOMA
          </text>
        </g>
      </svg>

      {/* Erklärkarte — Flyover-Ziel für Hover/Tap/Fokus (aria-live). */}
      <div
        id="zwiebel-detail"
        aria-live="polite"
        className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2"
      >
        <p className="text-sm font-medium text-foreground">{active?.label}</p>
        <p className="text-sm text-muted">{active?.hint}</p>
      </div>
    </div>
  );
}
