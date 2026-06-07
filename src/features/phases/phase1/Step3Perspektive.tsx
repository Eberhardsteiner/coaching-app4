import { Building2, HeartPulse, Info, LayoutGrid, Swords } from "lucide-react";

import { CoachCardBoard } from "@/features/cards/CoachCardBoard";
import { ContentLoadState } from "@/features/content/ContentLoadState";
import type { ModelTerm } from "@/features/content/contentTypes";
import { useModel, useModelList } from "@/features/content/useModel";
import { ModelCard, type ModelMeta } from "@/features/phases/phase1/ModelCard";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card } from "@/features/session/types";
import { cn } from "@/lib/utils";

/** Intro before the model choice (verbatim). */
const INTRO_TOP = [
  "Wenn du alles aufgeschrieben hast, was dir zu deiner Ist-Situation einfällt, dann überprüfe doch bitte einmal aus der ‚Vogelperspektive‘, ob es weitere Aspekte gibt, die auch noch zu deinem Gefühl beitragen.",
  "Suche dir dazu eins der folgenden Modelle aus (nur eins!), gehe die Begriffe durch und entscheide, ob du noch etwas ergänzen möchtest. Wenn ja, gehe genauso vor, wie im ersten Teil und schreibe auf extra Karten auf, was du genau mit den gewählten Begriffen meinst und wie sie zu deinem Gefühl beitragen.",
  "Nun kennst du bereits die Vorgehensweise und hast alles aufgeschrieben, was dir aus deiner eigenen Perspektive zu deinem Thema eingefallen ist. Der SMC-Prozess hat dir eine Erweiterung deiner Perspektiven zugesagt. Vielleicht fällt dir ja noch etwas ein, was zusätzlich zu deinem Thema dazugehört, wenn du einmal durch die Brille eines Modells blickst. Das funktioniert, indem du dich durch einen Blick aus der Vogelperspektive inspirieren lassen kannst.",
  "Dafür sind 4 Modelle vorgesehen und du kannst bei der Auswahl nichts falsch machen. Die 4 Modelle folgen den häufigsten Veränderungsanliegen, die beim Coaching vorkommen:",
];

/** The four change concerns (verbatim). */
const ANLIEGEN = [
  "Beeinträchtigungen im persönlichen Wohlbefinden",
  "Konflikte",
  "(Betriebs-)wirtschaftliche Herausforderungen",
  "Gesundheitliche Probleme",
];

const INTRO_CHOOSE =
  "Wirf einen Blick auf alle 4 und suche dir das Modell aus, das zu deinem Thema am besten passt.";

const INTRO_TERMS =
  "Wenn du ein Modell gewählt hast, dann suche nach möglichen Ergänzungen deines aktuellen Bildes der Ist-Situation. Wenn du welche gefunden hast, gehe wieder genauso vor, wie du es bereits praktiziert hast: Was genau meinst du mit dem Begriff und wie trägt das zu deinem Gefühl bei?";

/** Model-button presentation metadata (icon + Anliegen + Kurzbeschreibung). */
const MODEL_META: Record<string, ModelMeta> = {
  "st-galler": {
    icon: Building2,
    anliegen: "(Betriebs-)wirtschaftliche Herausforderungen",
    summary:
      "Die Organisation als System: Umweltsphären, Anspruchsgruppen, Interaktionsthemen, Ordnungsmomente, Prozesse und Entwicklungsmodi.",
    subtitle: "Change in Unternehmen",
    description: (
      <>
        <p>
          Dieses Modell bildet{" "}
          <strong className="font-semibold text-foreground">22 Merkmale</strong>{" "}
          ab, die mit jeder Veränderung innerhalb eines unternehmerischen
          Kontextes in Zusammenhang stehen. Verändert sich ein Merkmal, z. B.
          eine rechtliche Grundlage, wirkt sich das auf die anderen Merkmale
          aus.{" "}
          <strong className="font-semibold text-foreground">
            Veränderung im Unternehmen ist systemisch.
          </strong>
        </p>
        <p className="mt-2">
          Jede Person, die sich selbst gewollt in einem unternehmerischen
          Kontext verändern will,{" "}
          <strong className="font-semibold text-foreground">
            unterliegt genauso
          </strong>{" "}
          den durch die Merkmale des Modells beschriebenen{" "}
          <strong className="font-semibold text-foreground">
            Wechselwirkungen
          </strong>
          .
        </p>
      </>
    ),
  },
  "gesundheit-konstruktivistisch": {
    icon: HeartPulse,
    anliegen: "Gesundheitliche Probleme",
    summary:
      "Faktoren der selbst erlebten Gesundheit (u. a. Erfahrungen, Biografie, Bewältigbarkeit, Verstehbarkeit, Bedeutsamkeit).",
  },
  "drei-k": {
    icon: Swords,
    anliegen: "Konflikte",
    summary:
      "Die Aspekte eines Konflikts: Ich, andere Partei, Dritte, Thema, Werte, Emotionen, Abhängigkeiten u. a.",
  },
  "zehn-felder": {
    icon: LayoutGrid,
    anliegen: "Persönliches Wohlbefinden",
    summary:
      "Felder des Wohlbefindens: u. a. psycho-biologisches Wohlbefinden, Erfahrungen, Erwartungen, Körper, Gedanken, Umwelt, Sinn, Beziehung.",
    subtitle: "Einflüsse auf das psychobiologische Empfinden",
    description: (
      <>
        <p>
          Dieses Modell bildet Zusammenhänge ab, die unser individuelles{" "}
          <strong className="font-semibold text-foreground">
            psychobiologisches Befinden
          </strong>{" "}
          beeinflussen. Jeder Veränderung liegt eine psychische und biologische
          Befindlichkeit zu Grunde. Eine Veränderung ist dann für uns{" "}
          <strong className="font-semibold text-foreground">
            attraktiv, wenn sie einen Beitrag zu unserem psychobiologischen
            Wohlbefinden leistet
          </strong>
          . Einer selbst gewollten Veränderung geht immer ein{" "}
          <strong className="font-semibold text-foreground">
            „psychobiologisches Unbehagen“
          </strong>{" "}
          voraus.
        </p>
        <p className="mt-2">
          Wird die Beschäftigung mit sich selbst als Anlass gesehen, sich
          coachen zu lassen, bietet das 10-Felder-Modell die Möglichkeit, sich
          strukturiert mit den aktuellen Einflüssen auf das eigene
          psychobiologische Befinden („Unbehagen“) auseinanderzusetzen und so zu
          erkennen, was zusätzlich noch bei der eigenen Veränderung von
          Bedeutung ist. Das 10-Felder-Modell trägt der Tatsache Rechnung, dass{" "}
          <strong className="font-semibold text-foreground">
            jede Entscheidung, sich selbst zu verändern, auf einer Beurteilung
            des eigenen psychobiologischen Empfindens beruht
          </strong>
          .
        </p>
      </>
    ),
  },
};

const DEFAULT_META: ModelMeta = {
  icon: LayoutGrid,
  anliegen: "",
  summary: "",
};

/** Per-term card-add affordances (same colour stages as Schritt 2). */
const STAGE_ADDS = [
  { colorId: "zusammenhang", label: "Zusammenhang", swatch: "bg-amber-200" },
  {
    colorId: "konkretisierung",
    label: "Konkretisierung",
    swatch: "bg-green-400",
  },
  { colorId: "beitrag", label: "Beitrag", swatch: "bg-faint" },
];

const ADD_STAGES = STAGE_ADDS.map((s) => ({
  colorId: s.colorId,
  addLabel: s.label,
}));

/** The 3K conflict aspects (B5 — verbatim). */
const CONFLICT_ASPECTS = [
  { term: "Thema", gloss: "worum geht es?" },
  { term: "Ich", gloss: "meine Rolle im Konflikt" },
  {
    term: "andere Partei",
    gloss: "Person(en), mit denen ich im Konflikt bin",
  },
  { term: "Dritte", gloss: "Unbeteiligte, die Folgen des Konflikts spüren" },
];

/**
 * Phase 1, Step 1.3 — Perspektive wechseln („Vogelperspektive"). Verbatim intro
 * + four model buttons (icon + Anliegen + Kurzbeschreibung + accessible
 * explain-flyover, ModelCard), single choice in the persona accent. After a
 * choice, the model's terms are shown as a scannable list and can be added as
 * colour-coded cards (stages 2–4, marked with Card.modelTerm) onto the same,
 * enlarged board. The 3K model shows a special conflict-aspects note. No AI.
 */
export function Step3Perspektive({ nav }: { nav: PhaseNavigation }) {
  const selectedModel = useSessionStore((s) => s.session?.phase1.selectedModel);
  const cards = useSessionStore((s) => s.session?.phase1.cards ?? []);
  const istWord = useSessionStore((s) => s.session?.phase1.istWord ?? "");
  const patch = useSessionStore((s) => s.patch);

  const list = useModelList("ist");
  const loaded = useModel(selectedModel);

  function selectModel(id: string) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, selectedModel: id } }));
  }

  function setCards(next: Card[]) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, cards: next } }));
  }

  /** Add a model term as a colour-coded card (marked with modelTerm). */
  function addTermCard(term: ModelTerm, colorId: string) {
    patch((s) => {
      const offset = (s.phase1.cards.length % 6) * 24;
      const card: Card = {
        id: crypto.randomUUID(),
        text: term.label,
        modelTerm: term.id,
        color: colorId,
        x: 20 + offset,
        y: 130 + offset,
        visibility: "shared",
      };
      return {
        ...s,
        phase1: { ...s.phase1, cards: [...s.phase1.cards, card] },
      };
    });
  }

  return (
    <div className="space-y-6">
      {/* B1 — intro + the four change concerns */}
      <div className="space-y-3 text-muted">
        {INTRO_TOP.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <ul className="ml-1 space-y-1">
          {ANLIEGEN.map((anliegen) => (
            <li key={anliegen} className="flex items-start gap-2">
              <span
                aria-hidden
                className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
              />
              <span className="text-foreground">{anliegen}</span>
            </li>
          ))}
        </ul>
        <p>{INTRO_CHOOSE}</p>
      </div>

      {/* B2 — model buttons with explain-flyover */}
      {list.status === "loading" || list.status === "error" ? (
        <ContentLoadState
          status={list.status}
          error={list.error}
          onRetry={list.retry}
          loadingLabel="Modelle werden geladen …"
        />
      ) : (
        <div
          role="group"
          aria-label="Modell wählen (nur eins)"
          className="grid gap-3 sm:grid-cols-2"
        >
          {list.models.map((model) => (
            <ModelCard
              key={model.id}
              id={model.id}
              name={model.name}
              meta={MODEL_META[model.id] ?? DEFAULT_META}
              selected={model.id === selectedModel}
              onSelect={() => selectModel(model.id)}
            />
          ))}
        </div>
      )}

      {/* Selected model: B5 note (3K only) + B4 terms */}
      {selectedModel ? (
        loaded.status === "loading" || loaded.status === "error" ? (
          <ContentLoadState
            status={loaded.status}
            error={loaded.error}
            onRetry={loaded.retry}
            loadingLabel="Modell wird geladen …"
          />
        ) : loaded.model ? (
          <div className="space-y-4">
            {/* Ausführliche Modellbeschreibung — sobald hinterlegt (Selected-State). */}
            {MODEL_META[selectedModel]?.description ? (
              <div className="rounded-xl border border-subtle bg-surface-2 p-4">
                {MODEL_META[selectedModel]?.subtitle ? (
                  <p className="text-xs font-medium uppercase tracking-wide text-faint">
                    {MODEL_META[selectedModel]?.subtitle}
                  </p>
                ) : null}
                <div className="mt-1 text-sm leading-relaxed text-muted">
                  {MODEL_META[selectedModel]?.description}
                </div>
              </div>
            ) : null}

            {/* B5 — 3K conflict-aspects special note */}
            {selectedModel === "drei-k" ? (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Info className="size-4 shrink-0 text-accent" aria-hidden />
                  Achtung Besonderheit
                </p>
                <p className="mt-1.5 text-sm text-muted">
                  Zu jedem Konflikt gehören diese Aspekte:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {CONFLICT_ASPECTS.map((aspect) => (
                    <li key={aspect.term}>
                      <span className="font-medium text-foreground">
                        {aspect.term}
                      </span>{" "}
                      (= {aspect.gloss})
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-muted">
                  Sollte davon etwas fehlen, ergänze diese Punkte bitte in jedem
                  Fall.
                </p>
              </div>
            ) : null}

            {/* B4 — terms to go through + per-term card adds */}
            <div>
              <h3 className="font-serif text-lg text-foreground">
                Begriffe durchgehen
              </h3>
              <p className="mt-1 text-sm text-muted">{INTRO_TERMS}</p>
              <p className="mt-2 text-xs text-faint">
                Ergänze je Begriff Karten: Zusammenhang (Amber), Konkretisierung
                (Grün), Beitrag (Grau).
              </p>

              {loaded.model.terms.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {loaded.model.terms.map((term) => (
                    <li
                      key={term.id}
                      className="flex flex-col gap-2 rounded-lg border border-subtle bg-surface p-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {term.label}
                        </p>
                        {term.subterms && term.subterms.length > 0 ? (
                          <p className="mt-0.5 text-xs text-muted">
                            {term.subterms.join(" · ")}
                          </p>
                        ) : term.hint ? (
                          <p className="mt-0.5 text-xs text-muted">
                            {term.hint}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1.5">
                        {STAGE_ADDS.map((stage) => (
                          <button
                            key={stage.colorId}
                            type="button"
                            onClick={() => addTermCard(term, stage.colorId)}
                            aria-label={`„${term.label}“ als ${stage.label} ergänzen`}
                            title={`Als ${stage.label} ergänzen`}
                            className="flex size-7 items-center justify-center rounded-md border border-subtle bg-surface transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "size-3 rounded-full",
                                stage.swatch,
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-faint">
                  Für dieses Modell sind noch keine Begriffe hinterlegt.
                </p>
              )}
            </div>
          </div>
        ) : null
      ) : (
        <p className="text-xs text-faint">
          Tipp: Wähle ein Modell, um seine Begriffe als Linsen zu nutzen. Du
          kannst auch ohne Modell weitergehen.
        </p>
      )}

      {/* The shared, enlarged board — model cards appear next to the others. */}
      <CoachCardBoard
        cards={cards}
        onCardsChange={setCards}
        anchorCard={{
          text: istWord,
          label: "So geht es mir aktuell",
          hint: "Starte hier",
        }}
        addStages={ADD_STAGES}
        large
      />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
