import {
  Building2,
  ChevronDown,
  HeartPulse,
  Info,
  LayoutGrid,
  Swords,
} from "lucide-react";
import { useState } from "react";

import { CoachCardBoard } from "@/features/cards/CoachCardBoard";
import { ContentLoadState } from "@/features/content/ContentLoadState";
import type { ModelTerm } from "@/features/content/contentTypes";
import { useModel, useModelList } from "@/features/content/useModel";
import { GefuehlsAnker } from "@/features/phases/phase1/GefuehlsAnker";
import { ModelCard, type ModelMeta } from "@/features/phases/phase1/ModelCard";
import { ModelImage } from "@/features/phases/phase1/ModelImage";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card } from "@/features/session/types";
import { publicAsset } from "@/lib/asset";
import { cn } from "@/lib/utils";

/**
 * Visible intro, condensed (MP1-REV) — the four Anliegen live as badges on
 * the model cards, the background explanation is collapsible below.
 */
const INTRO_SHORT =
  "Du hast aufgeschrieben, was dir aus deiner eigenen Perspektive einfällt. Prüfe nun aus der ‚Vogelperspektive‘, ob weitere Aspekte zu deinem Gefühl beitragen — die vier Modelle folgen den häufigsten Veränderungsanliegen, und du kannst bei der Auswahl nichts falsch machen.";

/** Sichtbare Kern-Anleitung (VOICE-1): das Vorgehen mit dem Modell. */
const INTRO_VORGEHEN =
  "Such dir eins der Modelle aus (nur eins!), gehe die Begriffe durch und entscheide, ob du etwas ergänzen möchtest. Wenn ja, gehe genauso vor wie im ersten Teil: Schreibe auf extra Karten, was du genau mit den Begriffen meinst und wie sie zu deinem Gefühl beitragen.";

/** Vertiefung (aufklappbar): die Perspektiv-Zusage des Prozesses. */
const INTRO_VERTIEFUNG =
  "Der SMC-Prozess hat dir eine Erweiterung deiner Perspektiven zugesagt. Ein Blick durch die Brille eines Modells kann Aspekte sichtbar machen, die dir aus der eigenen Perspektive nicht eingefallen sind.";

/** Kern-Anleitung der Begriffsarbeit — sichtbar (VOICE-1). */
const INTRO_TERMS =
  "Wenn du ein Modell gewählt hast, dann suche nach möglichen Ergänzungen deines aktuellen Bildes der Ist-Situation. Wenn du welche gefunden hast, gehe wieder genauso vor, wie du es bereits praktiziert hast: Was genau meinst du mit dem Begriff und wie trägt das zu deinem Gefühl bei?";

/** Model-button presentation metadata (icon + Anliegen + Kurzbeschreibung). */
const MODEL_META: Record<string, ModelMeta> = {
  "st-galler": {
    icon: Building2,
    anliegen: "(Betriebs-)wirtschaftliche Herausforderungen",
    summary:
      "Die Organisation als System: Umweltsphären, Anspruchsgruppen, Interaktionsthemen, Ordnungsmomente, Prozesse und Entwicklungsmodi.",
    image: publicAsset("content/models/images/st-galler.png"),
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
    image: publicAsset(
      "content/models/images/gesundheit-konstruktivistisch.png",
    ),
    subtitle: "Selbst erlebtes Wohlbefinden",
    description: (
      <>
        <p>
          Das Thema Gesundheit gewinnt im beruflichen Umfeld zunehmend an
          Bedeutung. Längst wird beherzigt, dass die Gesundheit des
          Humankapitals einen betriebswirtschaftlichen Beitrag leistet. Doch was
          ist Gesundheit genau? Oft lautet die einfache Antwort lapidar:{" "}
          <strong className="font-semibold text-foreground">
            „Das Fehlen von Krankheit.“
          </strong>{" "}
          Diese Herangehensweise ist einfach, da es z. B. mit der von der WHO
          herausgegebenen ICD-11 (ICD, englisch = International Classification
          of Diseases) ein Klassifikationssystem der weltweit bekannten
          Krankheiten gibt. Es müsste nur durch eine Untersuchung eines Arztes
          festgestellt werden, dass keine Krankheit vorliegt – der Patient also
          „gesund“ ist. Ein Unternehmen könnte das z. B. durch einen
          Betriebsarzt realisieren und dokumentieren lassen. Die WHO bietet
          jedoch eine weitreichende Definition von Gesundheit an, die dem
          individuellen Erleben besser gerecht wird als das schlichte „Fehlen
          von Krankheit“:{" "}
          <strong className="font-semibold text-foreground">
            „Gesundheit ist ein Zustand vollkommenen körperlichen, geistigen und
            sozialen Wohlbefindens und nicht allein das Fehlen von Krankheit und
            Gebrechen.“
          </strong>
        </p>
        <p className="mt-2">
          Vielleicht ist Ihnen einmal aufgefallen, dass manche Menschen auf die
          Frage nach ihrer Gesundheit ganz anders antworten, als man selbst
          zuvor (konstruktivistisch) angenommen hat. Es stört sie nicht, dass
          sie aus ärztlicher Sicht vielleicht krank sind. Sie fühlen sich
          gesund. Wieder andere fühlen sich krank, obgleich keine
          diagnostizierbare Krankheit vorliegt. Gesundheit ist in der moderneren
          Auslegung der Medizin daher etwas{" "}
          <strong className="font-semibold text-foreground">
            „selbst Erlebtes“
          </strong>
          . Mit den Worten dieses Buches gesprochen, unterliegt das Thema
          Gesundheit einer{" "}
          <strong className="font-semibold text-foreground">
            individuell konstruktivistischen Deutung
          </strong>
          .
        </p>
        <p className="mt-2">
          Bei Anliegen, die der Coachee selbst als „Gesundheit“ oder ähnlich
          formuliert, ist es für den Coachee eine Struktur, die ihm hilft, in
          der Auseinandersetzung mit den Merkmalen des Modells weitere
          Zusammenhänge in Bezug auf seinen „IST-Zustand Gesundheit“ zu
          entdecken. Auf diese Weise ist es möglich, dem Thema „Gesundheit“
          systemisch und konstruktivistisch zu begegnen. Der Coachee entdeckt,{" "}
          <strong className="font-semibold text-foreground">
            womit bei ihm persönlich „der IST-Zustand Gesundheit“ zusammenhängt
          </strong>
          , warum er sie gerade so erlebt und nicht anders. Die mit dem Coaching
          einhergehende alternative Selbstorganisation hilft ihm, seine
          Gesundheit künftig anders zu erleben.{" "}
          <strong className="font-semibold text-foreground">
            Selbstverständlich ersetzt ein Coaching zu einem Thema „Gesundheit“
            keinen Arzt.
          </strong>{" "}
          Darauf sollte der Coachee auch hingewiesen werden.
        </p>
        <p className="mt-2">
          Das Modell enthält im Vergleich zu anderen Modellen der visuellen
          Aufstellung eine{" "}
          <strong className="font-semibold text-foreground">
            Besonderheit
          </strong>
          : Einige Begriffe für Merkmale des Modells sind bewusst so gewählt,
          dass sie eine{" "}
          <strong className="font-semibold text-foreground">
            Irritation auslösen
          </strong>
          , z. B.{" "}
          <strong className="font-semibold text-foreground">
            „Bewältigbarkeit“ oder „Verstehbarkeit“
          </strong>
          . Das Wort selbst ist ungewohnt und erfordert ein wiederholtes,
          intensives Reflektieren der thematischen Zusammenhänge.
        </p>
      </>
    ),
  },
  "drei-k": {
    icon: Swords,
    anliegen: "Konflikte",
    summary:
      "Die Aspekte eines Konflikts: Ich, andere Partei, Dritte, Thema, Werte, Emotionen, Abhängigkeiten u. a.",
    image: publicAsset("content/models/images/drei-k.png"),
    subtitle: "Der konstruktivistische Konflikt-Kontext",
    description: (
      <>
        <p>
          Das Modell beschreibt die zentralen Merkmale eines Konflikt-Kontextes,
          die{" "}
          <strong className="font-semibold text-foreground">
            durch die Person (Ich) (konstruktivistisch) gedeutet
          </strong>{" "}
          werden. Einer (konstruktivistischen) Deutung folgen auch die Partei,
          mit der ein Konflikt vorliegt, und die Dritten, die in irgendeiner
          Form beteiligt sind.
        </p>
        <p className="mt-2">
          Jede Deutung basiert auf Erfahrungen des Deutenden und auf den zur
          Deutung genutzten Ressourcen im Sinne von eigenen Motiven, Werten,
          Intelligenzen, aber auch rein biologischer Ressourcen, wie der zur
          Wahrnehmung zur Verfügung stehenden Sensorik.{" "}
          <strong className="font-semibold text-foreground">
            Ein Konflikt kann nicht losgelöst vom Konstruktivismus betrachtet
            werden.
          </strong>
        </p>
        <p className="mt-2">
          Um einen Konflikt handelt es sich dann, wenn eine{" "}
          <strong className="font-semibold text-foreground">
            Abhängigkeit der beiden Parteien
          </strong>{" "}
          vorliegt. Ohne diese Abhängigkeit gäbe es keinen Grund, sich zu
          vertragen. Jeder Konflikt hat einen zeitlichen Vorlauf, der die
          Deutung beeinflusst, und auch Zeit im Sinne eines Kontingentes, die
          zur Lösung bleibt. Wird die zur Lösung verbleibende Zeit als gering
          empfunden, kann ein{" "}
          <strong className="font-semibold text-foreground">Tunnelblick</strong>{" "}
          entstehen. Dies wirkt sich auf die Emotionen aus. In einem Konflikt
          prallen unterschiedliche Werte aufeinander (psychologisch: die Werte
          konfligieren). Werte werden sprachlich häufig auch mit Interessen oder
          Bedürfnissen gleichgesetzt. Die eigene „Be-Wert-ung“ der Situation
          und/oder die Verletzung von Werten rufen Emotionen hervor.
        </p>
        <p className="mt-2">
          <strong className="font-semibold text-foreground">
            Abhängigkeiten, Zeit, Werte und Emotionen sind faktisch Bestandteil
            jedes Konfliktes.
          </strong>{" "}
          Diese vier Begriffe sind im Modell etwas dunkler hervorgehoben. Das
          führt zur{" "}
          <strong className="font-semibold text-foreground">
            ersten Besonderheit
          </strong>{" "}
          in der Arbeit mit dem Modell: Da faktisch immer ein Zusammenhang
          besteht, fragt der Coach z. B. „Was haben Abhängigkeiten mit Ihrem
          IST-Zustand zu tun?“
        </p>
        <p className="mt-2">
          Der Unterschied zur bisherigen Vorgehensweise besteht darin: Es wird
          postuliert, dass Zeit, Abhängigkeit, Werte und Emotionen immer
          relevant für Konflikte sind. Wählt der Coachee als deduktive
          Wahrnehmungserweiterung zu seinem Thema z. B. „St. Galler
          Management-Modell“, so kann er aus sich heraus (aus seinem
          Konstruktivismus) entscheiden, ob z. B. „Staat“ oder
          „Unterstützungsprozesse“ mit seinem Thema zu tun haben. Bei „Konflikt“
          sind{" "}
          <strong className="font-semibold text-foreground">
            die vier Grundbegriffe gesetzt
          </strong>
          , d. h., der Coachee muss sich mit ihnen auseinandersetzen, weil jeder
          Konflikt eben diese vier Kategorien umfasst. Die{" "}
          <strong className="font-semibold text-foreground">
            zweite Besonderheit
          </strong>{" "}
          in der Arbeit mit dem Modell ist die „Statik“ eines Konfliktes. Zu
          einem Konflikt gehören mindestens „zwei“. Das können zwei Menschen,
          aber auch zwei Teams oder zwei Unternehmenseinheiten sein, im Modell
          beschrieben durch „Ich“ und „Die andere Partei“. In einer systemischen
          Konfliktbetrachtung kann sich ein Konflikt nicht nur auf die beiden
          Parteien auswirken, es gibt in der Regel „Dritte“, die gewollt oder
          ungewollt daran beteiligt sind.
        </p>
        <p className="mt-2">
          Wenn nicht klar ist, worüber oder worum gestritten wird – also was das
          eigentliche Streit-„Thema“ bzw. der Grund der Auseinandersetzung ist
          –, kann ein Konflikt selten gelöst werden.{" "}
          <strong className="font-semibold text-foreground">
            „Ich“, „Die andere Partei“, „Dritte“ und das „Thema“ sind feste,
            faktische Bestandteile eines Konfliktes.
          </strong>{" "}
          Diese Begriffe bilden die{" "}
          <strong className="font-semibold text-foreground">
            Statik, das Gerüst des Konfliktes
          </strong>{" "}
          ab. Als Prozessverantwortlicher sorgt der Coach dafür, dass in jedem
          Fall eine Auseinandersetzung mit diesen Begriffen erfolgt und diese
          Begriffe geeignet visualisiert werden.
        </p>
      </>
    ),
  },
  "zehn-felder": {
    icon: LayoutGrid,
    anliegen: "Persönliches Wohlbefinden",
    summary:
      "Felder des Wohlbefindens: u. a. psycho-biologisches Wohlbefinden, Erfahrungen, Erwartungen, Körper, Gedanken, Umwelt, Sinn, Beziehung.",
    image: publicAsset("content/models/images/zehn-felder.png"),
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

/**
 * Per-term card-add affordances (same colour stages as Schritt 2). `swatch`
 * fills the circle (captured state), `outline` draws the empty circle (open).
 */
const STAGE_ADDS = [
  {
    colorId: "zusammenhang",
    label: "Zusammenhang",
    swatch: "bg-orange-200",
    outline: "border-orange-200",
  },
  {
    colorId: "konkretisierung",
    label: "Konkretisierung",
    swatch: "bg-green-400",
    outline: "border-green-400",
  },
  {
    colorId: "beitrag",
    label: "Beitrag",
    swatch: "bg-faint",
    outline: "border-faint",
  },
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

/** Die vier in jedem Konflikt gesetzten Kategorien (3K — immer relevant). */
const CONFLICT_FACTORS = [
  {
    term: "Abhängigkeiten",
    gloss: "wovon hängen die Parteien voneinander ab?",
  },
  { term: "Zeit", gloss: "Vorlauf und die verbleibende Zeit zur Lösung" },
  { term: "Werte", gloss: "welche Werte prallen aufeinander?" },
  { term: "Emotionen", gloss: "welche Gefühle löst das aus?" },
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
  // P2: sichtbare Rückmeldung nach jedem Karten-Button (was ist passiert,
  // was ist jetzt zu tun) — aria-live, direkt über dem Karten-Feld.
  const [lastAdded, setLastAdded] = useState<{
    term: string;
    stage: string;
  } | null>(null);

  const list = useModelList("ist");
  const loaded = useModel(selectedModel);

  function selectModel(id: string) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, selectedModel: id } }));
  }

  function setCards(next: Card[]) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, cards: next } }));
  }

  function setIstWord(text: string) {
    patch((s) => ({ ...s, phase1: { ...s.phase1, istWord: text } }));
  }

  /** Add a model term as a colour-coded card (marked with modelTerm). */
  function addTermCard(term: ModelTerm, colorId: string) {
    const stage = STAGE_ADDS.find((s) => s.colorId === colorId);
    setLastAdded({ term: term.label, stage: stage?.label ?? colorId });
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
      {/* Gefühls-Anker aus 1.1 */}
      <GefuehlsAnker />

      {/* Anmoderation sichtbar (VOICE-1): Vogelperspektive + Vorgehen führen;
          die vier Anliegen stehen als Badges direkt auf den Modell-Karten.
          Aufklappbar bleibt nur die Perspektiv-Zusage (Vertiefung). */}
      <div className="space-y-3">
        <p className="text-muted">{INTRO_SHORT}</p>
        <p className="text-muted">{INTRO_VORGEHEN}</p>
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-accent">
            <ChevronDown
              className="size-4 motion-safe:transition-transform group-open:rotate-180"
              aria-hidden
            />
            Was dir der Modell-Blick bringt
          </summary>
          <p className="mt-2 text-sm text-muted">{INTRO_VERTIEFUNG}</p>
        </details>
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
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            Wähle dein Modell
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              nur 1 Modell
            </span>
          </p>
          <div
            role="group"
            aria-label="Modell wählen (nur eins)"
            className="grid gap-3 sm:grid-cols-2"
          >
            {list.models.map((model) => (
              <div
                key={model.id}
                className={cn(
                  "h-full transition-opacity",
                  // Exklusive Wahl sichtbar: die nicht gewählten treten zurück.
                  selectedModel && model.id !== selectedModel && "opacity-55",
                )}
              >
                <ModelCard
                  id={model.id}
                  name={model.name}
                  meta={MODEL_META[model.id] ?? DEFAULT_META}
                  selected={model.id === selectedModel}
                  onSelect={() => selectModel(model.id)}
                />
              </div>
            ))}
          </div>
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
            {/* Modellbeschreibung — Kernsatz sichtbar, Langtext aufklappbar. */}
            {MODEL_META[selectedModel]?.description ? (
              <div className="rounded-xl border border-subtle bg-surface-2 p-4">
                {MODEL_META[selectedModel]?.subtitle ? (
                  <p className="text-xs font-medium uppercase tracking-wide text-faint">
                    {MODEL_META[selectedModel]?.subtitle}
                  </p>
                ) : null}
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {MODEL_META[selectedModel]?.summary}
                </p>
                <details className="group mt-2">
                  <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-accent">
                    <ChevronDown
                      className="size-3.5 motion-safe:transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                    Mehr zum Modell
                  </summary>
                  <div className="mt-2 text-sm leading-relaxed text-muted">
                    {MODEL_META[selectedModel]?.description}
                  </div>
                </details>
              </div>
            ) : null}

            {/* Modell-Schaubild — unter der Beschreibung, klickbar vergrößerbar. */}
            {MODEL_META[selectedModel]?.image ? (
              <ModelImage
                src={MODEL_META[selectedModel]!.image!}
                alt={`Schaubild: ${loaded.model.name}`}
              />
            ) : null}

            {/* B5 — 3K conflict-aspects special note */}
            {selectedModel === "drei-k" ? (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Info className="size-4 shrink-0 text-accent" aria-hidden />
                  Achtung Besonderheit
                </p>

                <p className="mt-1.5 text-sm text-muted">
                  Diese vier Kategorien sind in{" "}
                  <span className="font-medium text-foreground">jedem</span>{" "}
                  Konflikt relevant — geh sie auf jeden Fall durch (z. B.: „Was
                  haben Abhängigkeiten mit deinem IST-Zustand zu tun?“):
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {CONFLICT_FACTORS.map((factor) => (
                    <li key={factor.term}>
                      <span className="font-medium text-foreground">
                        {factor.term}
                      </span>{" "}
                      (= {factor.gloss})
                    </li>
                  ))}
                </ul>

                <p className="mt-3 text-sm text-muted">
                  Zu jedem Konflikt gehören außerdem diese festen Bestandteile
                  (die „Statik“):
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

                <p className="mt-3 text-sm text-muted">
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
              {/* Legende: die Farbe zeigt sich selbst — keine Farbnamen. */}
              <div
                role="list"
                aria-label="Legende der Kartentypen"
                className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5"
              >
                {STAGE_ADDS.map((stage) => (
                  <span
                    key={stage.colorId}
                    role="listitem"
                    className="inline-flex items-center gap-1.5 text-xs text-muted"
                  >
                    <span
                      aria-hidden
                      className={cn("size-3 rounded-full", stage.swatch)}
                    />
                    {stage.label}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-sm text-faint">
                Die Kreis-Buttons legen den Begriff als farbige Karte auf dein
                Karten-Feld unten — gefüllte Kreise am Begriff zeigen, was du
                dort schon erfasst hast.
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
                          <p className="mt-0.5 text-sm text-muted">
                            {term.subterms.join(" · ")}
                          </p>
                        ) : term.hint ? (
                          <p className="mt-0.5 text-sm text-muted">
                            {term.hint}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1.5">
                        {STAGE_ADDS.map((stage) => {
                          // Erfassungsstand: gibt es zu diesem Begriff schon
                          // eine Karte dieses Typs? Gefüllt = erfasst.
                          const captured = cards.some(
                            (card) =>
                              card.modelTerm === term.id &&
                              card.color === stage.colorId,
                          );
                          return (
                            <button
                              key={stage.colorId}
                              type="button"
                              onClick={() => addTermCard(term, stage.colorId)}
                              aria-label={`„${term.label}“ als ${stage.label} ergänzen${captured ? " (bereits erfasst)" : ""}`}
                              title={`Als ${stage.label} ergänzen${captured ? " — bereits erfasst" : ""}`}
                              className="flex size-7 items-center justify-center rounded-md border border-subtle bg-surface transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            >
                              <span
                                aria-hidden
                                className={cn(
                                  "size-3 rounded-full",
                                  captured
                                    ? stage.swatch
                                    : cn(
                                        "border-2 bg-transparent",
                                        stage.outline,
                                      ),
                                )}
                              />
                            </button>
                          );
                        })}
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
        <p className="text-sm text-faint">
          Tipp: Wähle ein Modell, um seine Begriffe als Linsen zu nutzen. Du
          kannst auch ohne Modell weitergehen.
        </p>
      )}

      {/* P2: Rückmeldung des letzten Karten-Buttons — sofort sichtbar. */}
      <div aria-live="polite">
        {lastAdded ? (
          <p className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-foreground">
            ✓ „{lastAdded.term}“ liegt jetzt als{" "}
            <strong className="font-semibold">{lastAdded.stage}</strong>-Karte
            auf deinem Karten-Feld (direkt hier unten). Zieh sie an ihren Platz
            und beschreibe wie gewohnt, was du damit meinst und wie es zu deinem
            Gefühl beiträgt.
          </p>
        ) : null}
      </div>

      {/* The shared, enlarged board — model cards appear next to the others. */}
      <CoachCardBoard
        cards={cards}
        onCardsChange={setCards}
        anchorCard={{
          text: istWord,
          label: "So geht es mir aktuell",
          hint: "Starte hier",
          onTextChange: setIstWord,
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
