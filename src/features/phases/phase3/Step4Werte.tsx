import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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

const COLUMNS: { category: ValueCategory; title: string; guide: string }[] = [
  {
    category: "mensch",
    title: "Was ist mir wichtig als Mensch?",
    guide:
      "Beginne mit den maximal 5 Werten, die dir ganz allgemein als Mensch wichtig sind — ganz gleich, in welchem Kontext du unterwegs bist. Falls dir das schwerfällt: Was würde jemand aus deinem nahen Umfeld sagen, der dich gut kennt? Du kannst auch einen Blick auf die Werteliste werfen.",
  },
  {
    category: "funktion",
    title: "Was ist mir wichtig in meiner Funktion?",
    guide:
      "Was musst du darüber hinaus in der Funktion oder Rolle, in der du gerade im Coaching bist, wichtig nehmen? Vielleicht Compliance oder Kennzahlen als Führungskraft. Oder Fürsorge als pflegende*r Angehörige*r. Ohne Doppelungen mit Spalte 1.",
  },
  {
    category: "ziel",
    title: "Was ist mir im Hinblick auf mein Ziel wichtig?",
    guide:
      "Was musst du darüber hinaus wichtig nehmen, damit du dein Ziel erreichst?",
  },
];

const COLUMN_SHORT: Record<ValueCategory, string> = {
  mensch: "Mensch",
  funktion: "Funktion",
  ziel: "Ziel",
};

/** MVWK-Erklärtext (Methodik-Vorlage, gestrafft; Sinn vollständig). */
const MVWK_TEXT =
  "Das MVWK-Modell (Motiv–Verhalten–Wert–Kontext) zeigt vereinfacht, dass wir mit unseren Motiven (M) und den Werten (W) im Kontext (K) interagieren — und unser Verhalten (V) von beidem beeinflusst wird. Während unsere Motive unsere grundsätzliche emotionale Ausrichtung festlegen, wählen wir unsere Werte aktiv. Werte sind im Handeln beobachtbar: Ich zeige in meinem Verhalten, was ich wichtig nehme — wer Genauigkeit wichtig nimmt, verhält sich anders als wer Schnelligkeit wichtig nimmt. Nicht immer stimmen geäußerte Werte mit den Werten aus unserem Verhalten überein. Motiv: ‚Was treibt mich an?‘ — Werte: ‚Was nehme ich wichtig?‘ / aus dem Kontext: ‚Was ist hier wichtig?‘ Passen Motive und Werte gut zusammen, kann unser Verhalten frei fließen und wir fühlen uns wohl. Deine Werte sind wichtige Ressourcen, denn sie steuern gemeinsam mit deinen Motiven deine Entscheidungen und dein Verhalten. Deshalb identifizierst du jetzt deine wichtigsten Werte.";

/**
 * Decorative MVWK sketch, following the template's figure: the motives (M)
 * at the core, the values (W) as a ring around them, the context as the
 * dashed frame — and the behaviour (V) as an arrow pointing outwards.
 * aria-hidden; the text block carries the content.
 */
function MvwkSketch() {
  return (
    <svg
      viewBox="0 0 280 160"
      className="mx-auto h-auto w-64"
      aria-hidden="true"
      focusable="false"
    >
      {/* Kontext — the dashed frame around everything */}
      <rect
        x={6}
        y={6}
        width={268}
        height={148}
        rx={12}
        strokeWidth={1.25}
        strokeDasharray="4 4"
        className="fill-none stroke-subtle"
      />
      <text x={16} y={24} className="fill-faint text-[10px]">
        Kontext
      </text>

      {/* Werte — the ring around the core */}
      <circle
        cx={118}
        cy={84}
        r={46}
        strokeWidth={16}
        className="fill-none stroke-accent/20"
      />
      <text
        x={118}
        y={34}
        textAnchor="middle"
        className="fill-accent text-[10px] font-medium"
      >
        Werte
      </text>

      {/* Motive — the core */}
      <circle cx={118} cy={84} r={24} className="fill-accent/30" />
      <text
        x={118}
        y={88}
        textAnchor="middle"
        className="fill-accent text-[10px] font-medium"
      >
        Motive
      </text>

      {/* Verhalten — the arrow pointing outwards */}
      <line
        x1={172}
        y1={84}
        x2={240}
        y2={84}
        strokeWidth={2}
        strokeLinecap="round"
        className="stroke-accent/60"
      />
      <path d="M240 78 L 252 84 L 240 90 Z" className="fill-accent/60" />
      <text
        x={208}
        y={74}
        textAnchor="middle"
        className="fill-accent text-[10px] font-medium"
      >
        Verhalten
      </text>
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
export function Step4Werte({ nav }: { nav: PhaseNavigation }) {
  const values = useSessionStore((s) => s.session?.phase3.values ?? []);
  const patch = useSessionStore((s) => s.patch);
  const [drafts, setDrafts] = useState<Record<ValueCategory, string>>({
    mensch: "",
    funktion: "",
    ziel: "",
  });
  const [pickTarget, setPickTarget] = useState<ValueCategory>("mensch");

  function setValues(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, values: next } }));
  }

  const ofColumn = (category: ValueCategory) =>
    values.filter((item) => item.category === category);
  // Legacy entries without a category (pre-MP3 sessions) — kept visible below.
  const legacy = values.filter(
    (item) =>
      !item.category || !COLUMNS.some((c) => c.category === item.category),
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
        // Regel der Methodik: Ziel-Werte sind per Definition förderlich.
        ...(category === "ziel" ? { polarity: "foerderlich" as const } : {}),
      },
    ]);
  }

  function addDraft(category: ValueCategory) {
    addValue(category, drafts[category]);
    setDrafts((d) => ({ ...d, [category]: "" }));
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
          <p className="text-sm text-muted">{MVWK_TEXT}</p>
        </div>
      </details>

      {/* Drei Werte-Spalten */}
      <div className="grid gap-4 lg:grid-cols-3">
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
                <h3 className="text-sm font-semibold text-foreground">
                  {column.title}
                </h3>
                <p className="mt-1 text-xs text-muted">{column.guide}</p>
              </div>

              <ul className="space-y-1.5">
                {entries.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-subtle bg-background px-2.5 py-1.5"
                  >
                    <span className="min-w-0 truncate text-sm text-foreground">
                      {item.text}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {column.category === "ziel" ? (
                        <span className="rounded-full bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-600">
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
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label={`„${item.text}“ entfernen`}
                        title="Entfernen"
                        className="flex size-7 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center gap-2">
                <input
                  type="text"
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
                  className={cn(
                    "min-w-0 flex-1 rounded-lg border border-subtle bg-background px-2.5 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    full && "cursor-not-allowed opacity-45",
                  )}
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
              <p className="text-xs text-faint">
                {entries.length}/{MAX_PER_COLUMN} — weniger ist ok!
              </p>
            </section>
          );
        })}
      </div>

      <p className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-muted">
        Die Werte für dein Ziel müssen alle förderlich sein.
      </p>

      {/* Werteliste-Referenz mit Ziel-Spalte für die Übernahme */}
      <div className="space-y-2">
        <div
          role="group"
          aria-label="Werteliste: Übernehmen in Spalte"
          className="flex flex-wrap items-center gap-2 text-sm"
        >
          <span className="text-muted">Übernehmen in:</span>
          <div className="inline-flex overflow-hidden rounded-lg border border-subtle">
            {COLUMNS.map((column, index) => (
              <button
                key={column.category}
                type="button"
                aria-pressed={pickTarget === column.category}
                onClick={() => setPickTarget(column.category)}
                className={cn(
                  "px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                  index > 0 && "border-l border-subtle",
                  pickTarget === column.category
                    ? "bg-accent text-white"
                    : "bg-surface text-muted hover:text-foreground",
                )}
              >
                {COLUMN_SHORT[column.category]}
              </button>
            ))}
          </div>
        </div>
        <WertelisteReferenz
          onPick={(value) => addValue(pickTarget, value)}
          disabled={ofColumn(pickTarget).length >= MAX_PER_COLUMN}
        />
      </div>

      {/* Legacy values from pre-MP3 sessions — nothing is thrown away. */}
      {legacy.length > 0 ? (
        <div className="space-y-2 border-t border-subtle pt-4">
          <p className="text-sm font-medium text-foreground">Weitere Werte</p>
          <p className="text-xs text-muted">
            Diese Einträge stammen aus einer früheren Bearbeitung ohne
            Spalten-Zuordnung.
          </p>
          <ul className="space-y-1.5">
            {legacy.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-subtle bg-surface px-2.5 py-1.5"
              >
                <span className="min-w-0 truncate text-sm text-foreground">
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
