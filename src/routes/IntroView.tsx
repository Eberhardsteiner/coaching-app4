import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";
import { INTRO_SEEN_KEY } from "@/config/constants";
import { setKvFlag } from "@/features/session/sessionRepository";
import { cn } from "@/lib/utils";

/**
 * The intro, condensed to two sentences (MP1-REV — the scene shows the rest).
 * The method name "Neue Hamburger Schule" is quoted inline (declined); it is
 * also listed centrally in METHOD_LABELS.schoolName — when the SMC/NHS label
 * is unified, edit METHOD_LABELS and this literal spot.
 */
const INTRO_TEXT =
  "Ein Selbstcoaching nach den Grundsätzen der Neuen Hamburger Schule folgt einem logischen Prozess: dem Rubikon-Modell der Veränderung. Es zeigt die Schritte, in denen Veränderung sinnvollerweise erfolgt.";

type Station = {
  n: number;
  /** "ist" carries the pink IST accent; "calm" uses the persona accent. */
  tone: "ist" | "calm";
  title: string;
  /** One core sentence (compact list under the scene). */
  short: string;
  /** 2–3 condensed sentences (the card of the active station). */
  card: string;
  /** Button position in the scene (percentages of the scene box). */
  x: number;
  y: number;
};

/** The five stations of the journey (texts condensed, meaning complete). */
const STATIONS: Station[] = [
  {
    n: 1,
    tone: "ist",
    title: "Ist-Situation",
    short: "Konsequent analysieren: Aspekte, Personen, Wechselwirkungen.",
    card: "Der Prozess beginnt mit einer konsequenten Analyse deiner Ist-Situation: Du hältst Aspekte, Personen und ihre Wechselwirkungen fest. Am Ende weißt du, wo du wirklich stehst — und wo der Schuh am meisten drückt.",
    x: 13,
    y: 22,
  },
  {
    n: 2,
    tone: "calm",
    title: "Attraktives Ziel",
    short: "Wohin willst du — und was bedeutet das für dein Umfeld?",
    card: "Als Nächstes klärst du dein Ziel: Welchen Zustand strebst du an? Und welche Auswirkungen hat er auf dein Umfeld und dein System?",
    x: 87,
    y: 22,
  },
  {
    n: 3,
    tone: "calm",
    title: "Ressourcen",
    short: "Womit reist du? Deine inneren Ressourcen im Fokus.",
    card: "Wie für eine Reise packst du deine Ressourcen — vor allem die inneren. Zum Schluss klärst du: Wie hast du dich bisher verhalten, und was musst du künftig vermeiden?",
    x: 30,
    y: 66,
  },
  {
    n: 4,
    tone: "calm",
    title: "Handlungsplan",
    short: "Maßnahmen — entlang der Struktur deiner IST-Analyse.",
    card: "Mit Ziel und Ressourcen entwickelst du deinen Handlungsplan — konsequent entlang der Struktur, mit der du deine Ist-Situation analysiert hast.",
    x: 51,
    y: 72,
  },
  {
    n: 5,
    tone: "calm",
    title: "Nachhaltigkeit",
    short: "Dranbleiben — den Plan in die Realität bringen.",
    card: "Zum Schluss sicherst du die Nachhaltigkeit: Wie bleibst du dran und setzt deinen Plan tatsächlich in die Realität um?",
    x: 76,
    y: 56,
  },
];

/**
 * The Rubikon scene (decorative SVG): storm cloud ("Weg von …") on the left,
 * sun ("Hin zu …") on the right, a curved arrow between them; below, the two
 * banks with the river (the Rubikon), the paper boat crossing it, a figure
 * with a suitcase on the near bank and an open-armed figure with the flag on
 * the far bank. The five interactive station buttons are real HTML buttons
 * layered over the scene (positioned in %), so keyboard and screen-reader
 * users get the full interaction; the compact list below is the no-JS/a11y
 * fallback.
 */
function RubikonScene() {
  return (
    <svg
      viewBox="0 0 720 320"
      aria-hidden="true"
      focusable="false"
      className="h-auto w-full"
    >
      {/* ---- links: Gewitterwolke „Weg von …" ---- */}
      <text
        x={94}
        y={26}
        textAnchor="middle"
        className="fill-current text-[15px] font-medium"
      >
        Weg von …
      </text>
      <path
        d="M62 96 a15 15 0 0 1 3-29.5 A20.5 20.5 0 0 1 105 61 a14.5 14.5 0 0 1 7 27.6 L112 96 Z"
        className="fill-ist/85"
      />
      <g strokeWidth={2.5} strokeLinecap="round" className="stroke-ist/60">
        <line x1={70} y1={102} x2={66} y2={113} />
        <line x1={104} y1={102} x2={100} y2={113} />
      </g>
      <path
        d="M88 100 L79 116 L86 116 L82 130 L96 112 L89 112 Z"
        className="fill-ist"
      />

      {/* ---- rechts: Sonne „Hin zu …" ---- */}
      <text
        x={626}
        y={26}
        textAnchor="middle"
        className="fill-current text-[15px] font-medium"
      >
        Hin zu …
      </text>
      <circle cx={626} cy={82} r={20} className="fill-accent/85" />
      <g strokeWidth={2.5} strokeLinecap="round" className="stroke-accent/60">
        <line x1={626} y1={46} x2={626} y2={56} />
        <line x1={626} y1={108} x2={626} y2={118} />
        <line x1={590} y1={82} x2={600} y2={82} />
        <line x1={652} y1={82} x2={662} y2={82} />
        <line x1={601} y1={57} x2={608} y2={64} />
        <line x1={644} y1={100} x2={651} y2={107} />
        <line x1={601} y1={107} x2={608} y2={100} />
        <line x1={644} y1={64} x2={651} y2={57} />
      </g>

      {/* ---- geschwungener Pfeil von links nach rechts ---- */}
      <path
        d="M140 84 C 280 24, 440 24, 574 66"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="1 9"
        className="fill-none stroke-accent/70"
      />
      <path d="M582 70 L 562 60 L 566 76 Z" className="fill-accent/70" />

      {/* ---- Landschaft: zwei Ufer + der Fluss (Rubikon) ---- */}
      {/* linkes Ufer */}
      <path
        d="M0 210 Q 120 192 236 202 Q 282 206 306 216 L 306 320 L 0 320 Z"
        className="fill-faint/20"
      />
      {/* rechtes Ufer */}
      <path
        d="M430 214 Q 470 202 560 198 Q 650 194 720 204 L 720 320 L 430 320 Z"
        className="fill-faint/20"
      />
      {/* Fluss */}
      <path
        d="M306 216 Q 360 226 430 214 L 430 320 L 306 320 Z"
        className="fill-blue-50"
      />
      <g strokeWidth={2} strokeLinecap="round" className="stroke-blue-200/80">
        <path
          d="M318 244 q 8 -4 16 0 t 16 0 t 16 0 t 16 0 t 16 0"
          fill="none"
        />
        <path d="M330 272 q 8 -4 16 0 t 16 0 t 16 0 t 16 0" fill="none" />
        <path
          d="M322 300 q 8 -4 16 0 t 16 0 t 16 0 t 16 0 t 16 0"
          fill="none"
        />
      </g>

      {/* ---- Papierschiff auf dem Fluss ---- */}
      <g>
        <path d="M368 210 L368 238 L350 238 Z" className="fill-accent/40" />
        <path d="M368 216 L368 238 L383 238 Z" className="fill-accent/85" />
        <path
          d="M342 242 L 394 242 L 381 256 L 355 256 Z"
          className="fill-accent"
        />
      </g>

      {/* ---- Figur links am Ufer, mit Koffer ---- */}
      <g strokeLinecap="round" className="stroke-current">
        <circle
          cx={198}
          cy={158}
          r={9}
          strokeWidth={2.5}
          className="fill-none"
        />
        <line x1={198} y1={167} x2={198} y2={192} strokeWidth={2.5} />
        {/* Arme — einer hält den Koffer */}
        <line x1={198} y1={174} x2={186} y2={184} strokeWidth={2.5} />
        <line x1={198} y1={174} x2={212} y2={182} strokeWidth={2.5} />
        {/* Beine */}
        <line x1={198} y1={192} x2={190} y2={208} strokeWidth={2.5} />
        <line x1={198} y1={192} x2={206} y2={208} strokeWidth={2.5} />
      </g>
      {/* Koffer neben der Figur */}
      <path
        d="M218 182 v-3 a2.5 2.5 0 0 1 2.5-2.5 h7 a2.5 2.5 0 0 1 2.5 2.5 v3"
        strokeWidth={2}
        className="fill-none stroke-accent"
      />
      <rect
        x={210}
        y={182}
        width={28}
        height={20}
        rx={3.5}
        className="fill-accent/20"
      />
      <rect
        x={210}
        y={182}
        width={28}
        height={20}
        rx={3.5}
        strokeWidth={2}
        className="fill-none stroke-accent"
      />

      {/* ---- Figur rechts am Ziel-Ufer: offene, freudige Haltung + Fahne ---- */}
      <g strokeLinecap="round" className="stroke-current">
        <circle
          cx={508}
          cy={148}
          r={9}
          strokeWidth={2.5}
          className="fill-none"
        />
        <line x1={508} y1={157} x2={508} y2={182} strokeWidth={2.5} />
        {/* offene Arme (V) */}
        <line x1={508} y1={164} x2={494} y2={150} strokeWidth={2.5} />
        <line x1={508} y1={164} x2={522} y2={150} strokeWidth={2.5} />
        {/* Beine */}
        <line x1={508} y1={182} x2={500} y2={198} strokeWidth={2.5} />
        <line x1={508} y1={182} x2={516} y2={198} strokeWidth={2.5} />
      </g>
      {/* Fahne am Ziel */}
      <line
        x1={548}
        y1={196}
        x2={548}
        y2={150}
        strokeWidth={3}
        strokeLinecap="round"
        className="stroke-accent/70"
      />
      <path d="M548 152 L574 159 L548 166 Z" className="fill-accent" />
    </svg>
  );
}

/**
 * /einfuehrung — shell-free, persona "Ruhig". Explains the self-coaching
 * process along the Rubikon model as ONE coherent scene (MP1-REV): storm
 * cloud → curved arrow → sun over the river landscape with the paper boat,
 * plus five numbered, clickable stations (real buttons, keyboard-usable) that
 * open a short explainer card; the compact station list below is the
 * always-readable fallback. First page of the self-coaching intro chain
 * (/einfuehrung → /grundwerte → session). Shown once before the first self
 * session (introSeen flag in SessionRoute) and re-callable from the Hilfe
 * drawer. "Weiter" continues the chain; "Überspringen" marks the chain seen
 * and skips straight to the session. Self-coaching specific.
 */
export function IntroView() {
  const navigate = useNavigate();
  const [activeN, setActiveN] = useState(1);
  const active = STATIONS.find((s) => s.n === activeN) ?? STATIONS[0];

  /** Continue the chain to the second orientation page (the values page). */
  function next() {
    navigate("/grundwerte");
  }

  /** Skip the rest of the chain: mark it seen + go straight to the session. */
  function skip() {
    void setKvFlag(INTRO_SEEN_KEY, true);
    navigate("/session");
  }

  return (
    <div
      data-persona="ruhig"
      className="min-h-dvh bg-background text-foreground"
    >
      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">
            {BRANDING.methodLabel}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">
            Der Weg deiner Veränderung
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{INTRO_TEXT}</p>
        </header>

        {/* Die Rubikon-Szene mit den fünf klickbaren Stationen. */}
        <div className="relative mt-10 text-muted">
          {/* Die Weg-von/Hin-zu-Dichotomie der Szene ist im aria-hidden SVG —
              hier als Text für Screenreader (Rahmen: „Inhalte immer auch als
              Text zugänglich"). */}
          <p className="sr-only">
            Die Szene zeigt links die Gewitterwolke der Ist-Situation („Weg von
            …“), rechts die Sonne des attraktiven Ziels („Hin zu …“) —
            dazwischen der Fluss, den das Papierschiff der Maßnahmen überquert.
          </p>
          <RubikonScene />
          {STATIONS.map((station) => {
            const isActive = station.n === activeN;
            return (
              <button
                key={station.n}
                type="button"
                aria-label={`Station ${station.n}: ${station.title}`}
                aria-expanded={isActive}
                onClick={() => setActiveN(station.n)}
                style={{ left: `${station.x}%`, top: `${station.y}%` }}
                className={cn(
                  "absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2",
                  station.tone === "ist"
                    ? "focus-visible:ring-ist"
                    : "focus-visible:ring-accent",
                  isActive
                    ? station.tone === "ist"
                      ? "border-ist bg-ist text-white"
                      : "border-accent bg-accent text-white"
                    : cn(
                        "bg-background",
                        station.tone === "ist"
                          ? "border-ist/50 text-ist hover:bg-ist/10"
                          : "border-accent/50 text-accent hover:bg-accent/10",
                      ),
                )}
              >
                {station.n}
              </button>
            );
          })}
        </div>

        {/* Erklärkarte der aktiven Station. */}
        <div
          aria-live="polite"
          className={cn(
            "mt-4 rounded-xl border p-4",
            active.tone === "ist"
              ? "border-ist/30 bg-ist/5"
              : "border-accent/30 bg-accent/5",
          )}
        >
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wide",
              active.tone === "ist" ? "text-ist" : "text-accent",
            )}
          >
            Station {active.n}
          </p>
          <h2 className="mt-1 font-serif text-lg text-foreground">
            {active.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {active.card}
          </p>
        </div>

        {/* Kompakte Stationsliste — Übersicht + Fallback ohne Szene. */}
        <ol
          aria-label="Die fünf Phasen des Rubikon-Modells der Veränderung"
          className="mt-6 space-y-2"
        >
          {STATIONS.map((station) => (
            <li key={station.n}>
              <button
                type="button"
                onClick={() => setActiveN(station.n)}
                aria-pressed={station.n === activeN}
                className={cn(
                  "flex w-full items-baseline gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2",
                  station.tone === "ist"
                    ? "focus-visible:ring-ist"
                    : "focus-visible:ring-accent",
                  station.n === activeN
                    ? station.tone === "ist"
                      ? "border-ist/40 bg-ist/5"
                      : "border-accent/40 bg-accent/5"
                    : "border-subtle bg-surface hover:bg-surface-2",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    station.tone === "ist" ? "text-ist" : "text-accent",
                  )}
                >
                  {station.n}.
                </span>
                <span className="min-w-0">
                  <span className="text-sm font-medium text-foreground">
                    {station.title}
                  </span>{" "}
                  <span className="text-sm text-muted">— {station.short}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-subtle pt-6">
          <Button variant="ghost" onClick={skip}>
            Überspringen
          </Button>
          <Button onClick={next} aria-label="Weiter zu den Grundwerten">
            Weiter
            <ArrowRight />
          </Button>
        </footer>
      </main>
    </div>
  );
}
