import { useId, useState } from "react";

import type { ModelTerm } from "@/features/content/contentTypes";
import { cn } from "@/lib/utils";

/**
 * Layout der Zwiebel (K2, Nachschärfung nach Nutzer-Feedback): Position und
 * Form je Modell-Element. Die TEXTE kommen weiter aus kompetenzmodell.json
 * (nichts hart codiert) — hier steht nur, WO ein Element sitzt. Alle
 * Ring-Beschriftungen laufen GEBOGEN auf ihrem Ring (<textPath>, wie in der
 * Original-Grafik der Methodik) — dadurch kollidiert kein Label mehr mit den
 * weißen Kreisen, und jedes Label ist ein interaktives Modell-Element.
 */
const CENTER = 260;

/** Die drei weißen Kreise um den SOMA-Kern (Anordnung wie im Original:
 *  Motive oben, Persönlichkeitseigenschaften links, Intelligenzen rechts). */
const INNER_CIRCLES: { id: string; angle: number; short: string }[] = [
  { id: "motive", angle: -90, short: "Motive" },
  {
    id: "persoenlichkeitseigenschaften",
    angle: 150,
    short: "Persönlichkeits­eigenschaften",
  },
  { id: "intelligenzen", angle: 30, short: "Intelligenzen" },
];

/**
 * Gebogene Ring-Labels: Ring-Radius, Bogen (oben/unten — unten läuft der
 * Pfad gegen den Uhrzeigersinn, damit der Text nicht kopfsteht) und die
 * Position auf dem Bogen (startOffset in %; 50 = Bogenmitte).
 */
const RING_LABELS: {
  id: string;
  ring: "aussen" | "mitte" | "innen";
  arc: "oben" | "unten";
  offset: number;
  size: number;
  short?: string;
}[] = [
  // Äußerster Ring (Limette): der eine Modell-Begriff mit zwei Ankern.
  {
    id: "handlungskompetenz",
    ring: "aussen",
    arc: "oben",
    offset: 50,
    size: 24,
  },
  // Zweiter Ring (Olivgrün).
  {
    id: "fach-methodenkompetenz",
    ring: "mitte",
    arc: "oben",
    offset: 50,
    size: 15,
  },
  { id: "feldkompetenz", ring: "mitte", arc: "unten", offset: 12, size: 15 },
  // Dunkelblauer Ring — oben die drei inneren Prägungen …
  { id: "innere-antreiber", ring: "innen", arc: "oben", offset: 22, size: 12 },
  {
    id: "denk-bewertungsstrukturen",
    ring: "innen",
    arc: "oben",
    offset: 54,
    size: 12,
    short: "Denk- & Bewertungsstrukturen",
  },
  { id: "glaubenssaetze", ring: "innen", arc: "oben", offset: 84, size: 12 },
  // … unten die drei erworbenen Kompetenzen.
  {
    id: "reflektierte-erfahrung",
    ring: "innen",
    arc: "unten",
    offset: 16,
    size: 12,
  },
  {
    id: "leitwerte",
    ring: "innen",
    arc: "unten",
    offset: 50,
    size: 12,
    short: "Persönliche Leitwerte",
  },
  {
    id: "sozial-kommunikative-kompetenz",
    ring: "innen",
    arc: "unten",
    offset: 83,
    size: 12,
  },
];

/** Ring-Radien (Textlinie) je Ring-Id. */
const RING_RADIUS: Record<"aussen" | "mitte" | "innen", number> = {
  aussen: 234,
  mitte: 189,
  innen: 144,
};

/** Polarkoordinate um den Mittelpunkt (Winkel in Grad, 0° = rechts). */
function polar(r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

/** Halbkreis-Pfad für gebogene Labels (oben im, unten gegen den Uhrzeigersinn). */
function arcPath(r: number, arc: "oben" | "unten"): string {
  const left = CENTER - r;
  const right = CENTER + r;
  return arc === "oben"
    ? `M ${left} ${CENTER} A ${r} ${r} 0 0 1 ${right} ${CENTER}`
    : `M ${left} ${CENTER} A ${r} ${r} 0 0 0 ${right} ${CENTER}`;
}

/**
 * K2 — das Kompetenzmodell als interaktive Zwiebel-Grafik nach der
 * Original-Vorlage: SOMA-Kern (oliv), drei weiße Kreise (Motive ·
 * Persönlichkeitseigenschaften · Intelligenzen), dunkelblauer Begriffs-Ring,
 * olivgrüner und limettengrüner Außenring — alle Ring-Beschriftungen gebogen
 * (textPath) und interaktiv. Hover/Tap/Fokus zeigt die Beschreibung in der
 * aria-live-Erklärkarte darunter (aria-describedby); „Selbstorganisation"
 * (unten) gehört zum Begriff Handlungskompetenz/Selbstorganisation.
 */
export function KompetenzZwiebel({ terms }: { terms: ModelTerm[] }) {
  const byId = new Map(terms.map((t) => [t.id, t]));
  const [activeId, setActiveId] = useState("soma");
  const active = byId.get(activeId) ?? byId.get("soma");
  const uid = useId();
  const pathId = (ring: string, arc: string) => `${uid}-${ring}-${arc}`;

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

  /** Schriftfarbe je Ring (Original: dunkelblau auf grün, weiß auf blau). */
  const ringTextFill = (ring: "aussen" | "mitte" | "innen", act: boolean) =>
    ring === "innen"
      ? act
        ? "fill-white underline"
        : "fill-white/90"
      : act
        ? "fill-blue-950 underline"
        : "fill-blue-950/90";

  return (
    <div className="space-y-3">
      <svg
        viewBox="0 0 520 520"
        role="group"
        aria-label="Kompetenzmodell — Zwiebel von innen nach außen"
        className="mx-auto h-auto w-full max-w-md"
      >
        <defs>
          {(["aussen", "mitte", "innen"] as const).map((ring) =>
            (["oben", "unten"] as const).map((arc) => (
              <path
                key={`${ring}-${arc}`}
                id={pathId(ring, arc)}
                d={arcPath(RING_RADIUS[ring], arc)}
                fill="none"
              />
            )),
          )}
        </defs>

        {/* Ringe von außen nach innen: Limette · Olivgrün · Dunkelblau
            (Original-Farbwelt), plus die dunkelblaue Innenfläche mit dünnem
            Trennkreis um die weißen Kreise. */}
        <circle cx={CENTER} cy={CENTER} r={260} className="fill-lime-300/80" />
        <circle cx={CENTER} cy={CENTER} r={212} className="fill-lime-600/90" />
        <circle cx={CENTER} cy={CENTER} r={167} className="fill-blue-950" />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={121}
          strokeWidth={1.25}
          className="fill-blue-950 stroke-lime-200/70"
        />

        {/* Gebogene Ring-Labels — jedes ein interaktives Modell-Element. */}
        {RING_LABELS.map((label) => {
          const term = byId.get(label.id);
          if (!term) return null;
          const isSelbstorgAnchor = label.id === "handlungskompetenz";
          return (
            <g key={label.id} {...interactive(label.id)}>
              <text
                style={{ fontSize: label.size }}
                className={cn(
                  "font-semibold",
                  ringTextFill(label.ring, isActive(label.id)),
                )}
              >
                <textPath
                  href={`#${pathId(label.ring, label.arc)}`}
                  startOffset={`${label.offset}%`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {label.short ?? term.label.split("/")[0]}
                </textPath>
              </text>
              {/* Der zweite Anker des Doppel-Begriffs: Selbstorganisation
                  läuft gebogen auf dem unteren Außenring. */}
              {isSelbstorgAnchor ? (
                <text
                  style={{ fontSize: label.size }}
                  className={cn(
                    "font-semibold",
                    ringTextFill("aussen", isActive(label.id)),
                  )}
                >
                  <textPath
                    href={`#${pathId("aussen", "unten")}`}
                    startOffset="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    Selbstorganisation
                  </textPath>
                </text>
              ) : null}
            </g>
          );
        })}

        {/* Die drei weißen Kreise: Motive · PE · Intelligenzen. */}
        {INNER_CIRCLES.map((circle) => {
          const term = byId.get(circle.id);
          if (!term) return null;
          const p = polar(74, circle.angle);
          const lines = circle.short.split("­");
          return (
            <g key={circle.id} {...interactive(circle.id)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={40}
                className={cn(
                  "fill-white",
                  isActive(circle.id) ? "stroke-accent" : "stroke-blue-950/30",
                )}
                strokeWidth={isActive(circle.id) ? 3 : 1}
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

        {/* Der Kern: SOMA (oliv, wie im Original). */}
        <g {...interactive("soma")}>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={32}
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
            className="fill-white text-[13px] font-semibold"
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
