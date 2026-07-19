import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { PolarityToggle } from "@/features/phases/phase3/ResourceHarvest";
import { WertelisteReferenz } from "@/features/phases/phase3/WertelisteReferenz";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { ResourceItem } from "@/features/session/types";
import { cn } from "@/lib/utils";

/** Max. 5 Werte je Spalte — „weniger ist ok!" (Methodik). */
const MAX_PER_COLUMN = 5;

type ValueCategory = "mensch" | "funktion" | "ziel";

// K1: guide als Absatz-Array — die Spalten-Anleitungen brechen in kurze
// Sinneinheiten statt in einen Block (Wortlaut unverändert).
const COLUMNS: { category: ValueCategory; title: string; guide: string[] }[] = [
  {
    category: "mensch",
    title: "Was ist mir wichtig als Mensch?",
    guide: [
      "Beginne mit den maximal 5 Werten, die dir ganz allgemein als Mensch wichtig sind — ganz gleich, in welchem Kontext du unterwegs bist.",
      "Falls dir das schwerfällt: Was würde jemand aus deinem nahen Umfeld sagen, der dich gut kennt? Du kannst auch einen Blick auf die Werteliste werfen.",
    ],
  },
  {
    category: "funktion",
    title: "Was ist mir wichtig in meiner Funktion?",
    guide: [
      "Was musst du darüber hinaus in der Funktion oder Rolle, in der du gerade im Coaching bist, wichtig nehmen? Vielleicht Compliance oder Kennzahlen als Führungskraft. Oder Fürsorge als pflegende*r Angehörige*r.",
      "Ohne Doppelungen mit Spalte 1.",
    ],
  },
  {
    category: "ziel",
    title: "Was ist mir im Hinblick auf mein Ziel wichtig?",
    guide: [
      "Was musst du darüber hinaus wichtig nehmen, damit du dein Ziel erreichst?",
    ],
  },
];

const COLUMN_SHORT: Record<ValueCategory, string> = {
  mensch: "Mensch",
  funktion: "Funktion",
  ziel: "Ziel",
};

/**
 * MVWK-Erklärtext (Methodik-Vorlage, gestrafft; Sinn vollständig), K1: in
 * Sinnabsätze gesetzt — die Merkfragen als eigene abgesetzte Zeile.
 */
const MVWK_ABSAETZE = [
  "Das MVWK-Modell (Motiv–Verhalten–Wert–Kontext) zeigt vereinfacht, dass wir mit unseren Motiven (M) und den Werten (W) im Kontext (K) interagieren — und unser Verhalten (V) von beidem beeinflusst wird. Während unsere Motive unsere grundsätzliche emotionale Ausrichtung festlegen, wählen wir unsere Werte aktiv.",
  "Werte sind im Handeln beobachtbar: Ich zeige in meinem Verhalten, was ich wichtig nehme — wer Genauigkeit wichtig nimmt, verhält sich anders als wer Schnelligkeit wichtig nimmt. Nicht immer stimmen geäußerte Werte mit den Werten aus unserem Verhalten überein.",
];

/** Die drei Merkfragen des Modells (abgesetzte Zeile). */
const MVWK_MERKFRAGEN =
  "Motiv: ‚Was treibt mich an?‘ — Werte: ‚Was nehme ich wichtig?‘ / aus dem Kontext: ‚Was ist hier wichtig?‘";

const MVWK_SCHLUSS = [
  "Passen Motive und Werte gut zusammen, kann unser Verhalten frei fließen und wir fühlen uns wohl.",
  "Deine Werte sind wichtige Ressourcen, denn sie steuern gemeinsam mit deinen Motiven deine Entscheidungen und dein Verhalten. Deshalb identifizierst du jetzt deine wichtigsten Werte.",
];

/** Polarkoordinate um das MVWK-Zentrum (Winkel in Grad, 0° = rechts). */
function mvwkPolar(r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 170 + r * Math.cos(rad), y: 150 + r * Math.sin(rad) };
}

/**
 * MVWK exakt nach dem Methodik-Modell (K2): äußerer schwarzer Kreis =
 * Kontext (Label zweimal schräg außen) · acht graue W-Quadrate auf dem Kreis
 * · Doppelpfeile von jedem W nach innen · dunkelblauer Kern mit vier
 * hellblauen M-Kreisen · breiter dunkler „Verhalten"-Pfeil vom Kern schräg
 * nach außen über den Ring. aria-hidden; der (K1-)Erklärtext daneben trägt
 * den Inhalt.
 */
function MvwkSketch() {
  const wAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      viewBox="0 0 340 300"
      className="mx-auto h-auto w-72"
      aria-hidden="true"
      focusable="false"
    >
      {/* Kontext — der äußere schwarze Kreis mit zwei schrägen Labels. */}
      <circle
        cx={170}
        cy={150}
        r={110}
        strokeWidth={2}
        className="fill-none stroke-foreground"
      />
      <text
        transform="rotate(-45 62 60)"
        x={62}
        y={60}
        textAnchor="middle"
        className="fill-foreground text-[12px]"
      >
        Kontext
      </text>
      <text
        transform="rotate(-45 282 244)"
        x={282}
        y={244}
        textAnchor="middle"
        className="fill-foreground text-[12px]"
      >
        Kontext
      </text>

      {/* Acht W-Quadrate auf dem Kreis + Doppelpfeile nach innen. */}
      {wAngles.map((angle) => {
        const w = mvwkPolar(110, angle);
        const from = mvwkPolar(92, angle);
        const to = mvwkPolar(62, angle);
        const tipIn = mvwkPolar(56, angle);
        const tipOut = mvwkPolar(98, angle);
        const side = mvwkPolar(1, angle + 90);
        const sx = side.x - 170;
        const sy = side.y - 150;
        return (
          <g key={angle}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              strokeWidth={2}
              className="stroke-foreground/70"
            />
            {/* Pfeilspitzen beider Richtungen (Doppelpfeil). */}
            <polygon
              points={`${tipIn.x},${tipIn.y} ${to.x + sx * 4},${to.y + sy * 4} ${to.x - sx * 4},${to.y - sy * 4}`}
              className="fill-foreground/70"
            />
            <polygon
              points={`${tipOut.x},${tipOut.y} ${from.x + sx * 4},${from.y + sy * 4} ${from.x - sx * 4},${from.y - sy * 4}`}
              className="fill-foreground/70"
            />
            <rect
              x={w.x - 12}
              y={w.y - 12}
              width={24}
              height={24}
              rx={3}
              className="fill-gray-400"
            />
            <text
              x={w.x}
              y={w.y + 4}
              textAnchor="middle"
              className="fill-white text-[12px] font-semibold"
            >
              W
            </text>
          </g>
        );
      })}

      {/* Kern: dunkelblauer Kreis mit vier hellblauen M-Kreisen. */}
      <circle cx={170} cy={150} r={44} className="fill-blue-900" />
      {[
        [-17, -17],
        [17, -17],
        [-17, 17],
        [17, 17],
      ].map(([dx, dy]) => (
        <g key={`${dx}-${dy}`}>
          <circle
            cx={170 + dx}
            cy={150 + dy}
            r={12}
            className="fill-blue-300"
          />
          <text
            x={170 + dx}
            y={150 + dy + 4}
            textAnchor="middle"
            className="fill-blue-950 text-[11px] font-semibold"
          >
            M
          </text>
        </g>
      ))}

      {/* Breiter dunkler „Verhalten"-Pfeil vom Kern schräg nach außen über
          den Ring (Schaft + Spitze, radial bei -42° berechnet). */}
      {(() => {
        const angle = -42;
        const a = mvwkPolar(28, angle);
        const b = mvwkPolar(112, angle);
        const tip = mvwkPolar(140, angle);
        const side = mvwkPolar(1, angle + 90);
        const sx = side.x - 170;
        const sy = side.y - 150;
        const shaft = 10;
        const head = 19;
        const mid = mvwkPolar(74, angle);
        return (
          <g>
            <polygon
              points={`${a.x + sx * shaft},${a.y + sy * shaft} ${b.x + sx * shaft},${b.y + sy * shaft} ${b.x + sx * head},${b.y + sy * head} ${tip.x},${tip.y} ${b.x - sx * head},${b.y - sy * head} ${b.x - sx * shaft},${b.y - sy * shaft} ${a.x - sx * shaft},${a.y - sy * shaft}`}
              className="fill-blue-950"
            />
            <text
              transform={`rotate(${angle} ${mid.x} ${mid.y})`}
              x={mid.x}
              y={mid.y + 4}
              textAnchor="middle"
              className="fill-white text-[11px] font-semibold"
            >
              Verhalten
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

/**
 * Phase 3, Step 3.4 — Meine Werte (MVWK + drei Spalten + Werteliste). Values
 * go into phase3.values with `category` "mensch" | "funktion" | "ziel", max 5
 * per column. Columns 1–2 are rated zielförderlich/zielhinderlich in place;
 * the Ziel column is förderlich by rule ("Die Werte für dein Ziel müssen alle
 * förderlich sein.") — set automatically, shown as a badge. The value list
 * reference picks into the actively selected column. Soft step.
 */
/** P8c: die Markierungen eines Werts (Mehrfach) — categories mit Fallback. */
function categoriesOf(item: ResourceItem): string[] {
  return item.categories ?? (item.category ? [item.category] : []);
}

export function Step4Werte({ nav }: { nav: PhaseNavigation }) {
  const values = useSessionStore((s) => s.session?.phase3.values ?? []);
  const patch = useSessionStore((s) => s.patch);
  const [drafts, setDrafts] = useState<Record<ValueCategory, string>>({
    mensch: "",
    funktion: "",
    ziel: "",
  });

  function setValues(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, values: next } }));
  }

  const ofColumn = (category: ValueCategory) =>
    values.filter((item) => categoriesOf(item).includes(category));
  // Legacy entries without any category (pre-MP3 sessions) — kept below.
  const legacy = values.filter(
    (item) =>
      !categoriesOf(item).some((c) =>
        COLUMNS.some((column) => column.category === c),
      ),
  );

  function addValue(category: ValueCategory, text: string) {
    const trimmed = text.trim();
    if (!trimmed || ofColumn(category).length >= MAX_PER_COLUMN) return;
    setValues([
      ...values,
      {
        id: crypto.randomUUID(),
        text: trimmed,
        category,
        categories: [category],
        // Regel der Methodik: Ziel-Werte sind per Definition förderlich.
        ...(category === "ziel" ? { polarity: "foerderlich" as const } : {}),
      },
    ]);
  }

  function addDraft(category: ValueCategory) {
    addValue(category, drafts[category]);
    setDrafts((d) => ({ ...d, [category]: "" }));
  }

  /**
   * P8c: eine Markierung (Mensch/Funktion/Ziel) an einem Wert umschalten.
   * Die letzte Markierung bleibt bestehen (sonst verschwände der Wert aus
   * allen Säulen); Ziel-Markierung erzwingt förderlich (Methodik-Regel);
   * `category` bleibt als Erst-Markierung für Alt-Leser gepflegt.
   */
  function toggleCategory(id: string, category: ValueCategory) {
    setValues(
      values.map((item) => {
        if (item.id !== id) return item;
        const current = categoriesOf(item);
        const has = current.includes(category);
        if (has && current.length === 1) return item; // letzte Markierung
        if (!has && ofColumn(category).length >= MAX_PER_COLUMN) return item;
        const next = has
          ? current.filter((c) => c !== category)
          : [...current, category];
        // Ziel-Markierung erzwingt förderlich (Methodik-Regel). Wird „ziel"
        // wieder ABGEWÄHLT, geht die Wertung auf „offen" zurück — die
        // erzwungene förderlich-Wertung darf nicht als Nutzerwahl
        // stehenbleiben (Review-Finding: stiller Falschwert).
        const zielVorher = current.includes("ziel");
        const zielNachher = next.includes("ziel");
        return {
          ...item,
          categories: next,
          category: next[0],
          ...(zielNachher
            ? { polarity: "foerderlich" as const }
            : zielVorher
              ? { polarity: undefined }
              : {}),
        };
      }),
    );
  }

  function setPolarity(
    id: string,
    polarity: "foerderlich" | "hinderlich" | undefined,
  ) {
    setValues(
      values.map((item) => (item.id === id ? { ...item, polarity } : item)),
    );
  }

  function remove(id: string) {
    setValues(values.filter((item) => item.id !== id));
  }

  /** P8c: die drei Ankreuz-Chips einer Wert-Zeile. */
  function renderCategoryChips(item: ResourceItem) {
    const current = categoriesOf(item);
    return (
      <span
        role="group"
        aria-label={`„${item.text}“ ist mir wichtig als`}
        className="flex flex-wrap items-center gap-1.5"
      >
        {COLUMNS.map((column) => {
          const checked = current.includes(column.category);
          const lastOne = checked && current.length === 1;
          // Review-Finding: volle Ziel-Säule sichtbar sperren statt still
          // zu verpuffen (Max 5 je Säule).
          const columnFull =
            !checked && ofColumn(column.category).length >= MAX_PER_COLUMN;
          return (
            <button
              key={column.category}
              type="button"
              aria-pressed={checked}
              aria-disabled={lastOne || columnFull || undefined}
              title={
                lastOne
                  ? "Mindestens eine Markierung bleibt bestehen"
                  : columnFull
                    ? `Säule voll — maximal ${MAX_PER_COLUMN} Werte`
                    : COLUMN_SHORT[column.category]
              }
              onClick={() => toggleCategory(item.id, column.category)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                checked
                  ? "border-accent bg-accent/10 font-medium text-accent"
                  : "border-subtle bg-surface text-muted hover:text-foreground",
                columnFull && "cursor-not-allowed opacity-45",
              )}
            >
              {checked ? "✓ " : ""}
              {COLUMN_SHORT[column.category]}
            </button>
          );
        })}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* MVWK */}
      <details className="group rounded-xl border border-subtle bg-surface p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-foreground">
          Warum Werte? Das MVWK-Modell
          <ChevronDown
            className="size-4 text-muted motion-safe:transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-3 space-y-3">
          <MvwkSketch />
          <div className="max-w-prose space-y-2 text-sm text-muted">
            {MVWK_ABSAETZE.map((absatz) => (
              <p key={absatz}>{absatz}</p>
            ))}
            <p className="border-l-2 border-accent/40 pl-3 italic">
              {MVWK_MERKFRAGEN}
            </p>
            {MVWK_SCHLUSS.map((absatz) => (
              <p key={absatz}>{absatz}</p>
            ))}
          </div>
        </div>
      </details>

      {/* P8b: die drei Säulen ÜBEREINANDER in voller Breite (Mensch,
          Funktion, Ziel). P8c: jeder Wert trägt drei einzeln setzbare
          Markierungen — ein Wert kann in mehreren Säulen stehen. */}
      <div className="grid grid-cols-1 gap-4">
        {COLUMNS.map((column) => {
          const entries = ofColumn(column.category);
          const full = entries.length >= MAX_PER_COLUMN;
          return (
            <section
              key={column.category}
              aria-label={column.title}
              className="flex flex-col gap-3 rounded-xl border border-subtle bg-surface p-4"
            >
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {column.title}
                </h3>
                <div className="mt-1 max-w-prose space-y-1 text-sm text-muted">
                  {column.guide.map((absatz) => (
                    <p key={absatz}>{absatz}</p>
                  ))}
                </div>
              </div>

              <ul className="space-y-2">
                {entries.map((item) => {
                  const zielMarkiert = categoriesOf(item).includes("ziel");
                  return (
                    /* P8a: Text horizontal lesbar in voller Breite; Chips
                       und Wertung DARUNTER — nie über dem Text. */
                    <li
                      key={item.id}
                      className="space-y-2 rounded-lg border border-subtle bg-background px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0 flex-1 break-words text-base text-foreground">
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          aria-label={`„${item.text}“ entfernen`}
                          title="Entfernen"
                          className="flex size-7 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="text-sm text-faint">Wichtig als:</span>
                        {renderCategoryChips(item)}
                        {zielMarkiert ? (
                          <span className="rounded-full bg-green-600/10 px-2 py-0.5 text-sm font-medium text-green-600">
                            förderlich
                          </span>
                        ) : (
                          <PolarityToggle
                            value={item.polarity}
                            onChange={(next) => setPolarity(item.id, next)}
                            helpLabel="zielförderlich"
                            hinderLabel="zielhinderlich"
                            ariaContext={`„${item.text}“`}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto flex items-center gap-2">
                <Input
                  value={drafts[column.category]}
                  disabled={full}
                  aria-label={`Wert ergänzen: ${column.title}`}
                  onChange={(event) =>
                    setDrafts((d) => ({
                      ...d,
                      [column.category]: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addDraft(column.category);
                    }
                  }}
                  placeholder={full ? "Maximal 5 — weniger ist ok!" : "Wert …"}
                  className="min-w-0 flex-1 bg-background"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={full}
                  onClick={() => addDraft(column.category)}
                  aria-label={`Wert hinzufügen: ${column.title}`}
                >
                  <Plus />
                </Button>
              </div>
              <p className="text-sm text-faint">
                {entries.length}/{MAX_PER_COLUMN} — weniger ist ok!
              </p>
            </section>
          );
        })}
      </div>

      <p className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-muted">
        Die Werte für dein Ziel müssen alle förderlich sein.
      </p>

      {/* Werteliste-Referenz — Übernahme startet „als Mensch"; die
          Zuordnung verfeinerst du je Wert über die Ankreuz-Chips (P8c). */}
      <div className="space-y-2">
        <p className="text-sm text-muted">
          Übernommene Werte landen zunächst unter „als Mensch“ — markiere danach
          je Wert, wofür er wichtig ist.
        </p>
        <WertelisteReferenz
          onPick={(value) => addValue("mensch", value)}
          disabled={ofColumn("mensch").length >= MAX_PER_COLUMN}
          isTaken={(value) =>
            // Review-Finding: Legacy-Werte ohne Spalten-Zuordnung sperren
            // die Übernahme nicht — nur markierte Werte zählen.
            values.some(
              (item) => categoriesOf(item).length > 0 && item.text === value,
            )
          }
        />
      </div>

      {/* Legacy values from pre-MP3 sessions — nothing is thrown away. */}
      {legacy.length > 0 ? (
        <div className="space-y-2 border-t border-subtle pt-4">
          <p className="text-sm font-medium text-foreground">Weitere Werte</p>
          <p className="text-sm text-muted">
            Diese Einträge stammen aus einer früheren Bearbeitung ohne
            Spalten-Zuordnung.
          </p>
          <ul className="space-y-1.5">
            {legacy.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-subtle bg-surface px-2.5 py-1.5"
              >
                <span className="min-w-0 flex-1 text-sm break-words text-foreground">
                  {item.text || "—"}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <PolarityToggle
                    value={item.polarity}
                    onChange={(next) => setPolarity(item.id, next)}
                    helpLabel="zielförderlich"
                    hinderLabel="zielhinderlich"
                    ariaContext={`„${item.text || "Eintrag"}“`}
                  />
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`„${item.text || "Eintrag"}“ entfernen`}
                    title="Entfernen"
                    className="flex size-7 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <NoPersonalDataHint />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
