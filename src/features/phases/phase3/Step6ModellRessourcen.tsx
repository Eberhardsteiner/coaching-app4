import { Boxes } from "lucide-react";

import { requestDrawer } from "@/components/layout/drawerBus";
import { Button } from "@/components/ui/button";
import { KiImpuls } from "@/features/ai/KiImpuls";
import { ContentLoadState } from "@/features/content/ContentLoadState";
import { promptModelle, useSmcKatalog } from "@/features/content/smcModelle";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { buildModellPrompt } from "@/features/phases/phase3/modellPrompt";
import { ResourceListEditor } from "@/features/phases/phase3/ResourceListEditor";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card, Cluster, ResourceItem } from "@/features/session/types";

/** Stable empty defaults for the store selectors. */
const NO_CARDS: Card[] = [];
const NO_CLUSTERS: Cluster[] = [];

/** Anmoderation — sichtbar (VOICE-1, Methodik-Wortlaut), K1: drei Absätze. */
const INTRO_ABSAETZE = [
  "Bisher hast du dich am Kompetenzmodell orientiert und deine inneren Ressourcen befragt — auf sie kannst du immer zugreifen, denn sie liegen bereits in dir. Jetzt betrachtest du dein Thema und dein Ziel aus einer ganz anderen Warte: aus wissenschaftlicher Sicht.",
  "Zu fast allem, was dich bewegt, hat sich eine wissenschaftliche Disziplin schon einmal Gedanken gemacht und ihr Wissen in Modelle gegossen. Modelle sind kein Abbild der Wirklichkeit, aber sie bieten eine Ordnung an, um die Welt in einer bestimmten Perspektive zu verstehen.",
  "Ein Blick durch die Brille eines Modells kann neue Erkenntnisse bis hin zu Impulsen für neues Verhalten liefern.",
];

/** Die vier Leitfragen (Methodik-Vorlage, wortgetreu). */
const LEITFRAGEN = [
  "Hat das Modell mit meinem Thema zu tun?",
  "Was hat es damit zu tun?",
  "Welche Erkenntnisse oder Fragen leite ich daraus ab?",
  "Ist etwas aus dem Modell — oder das ganze Modell — eine Ressource für mein Ziel? Schreibe auf!",
];

/**
 * Phase 3, Step 3.6 — Ressourcen aus Modellen (die KI-Vogelperspektive).
 * Replaces the old free hypotheses step on the SAME field (contract:
 * phase3.hypotheses — `note` = model name, `text` = insight/resource). Self
 * branch: KiImpuls with the model prompt from modellPrompt.ts (only the
 * models of the SMC catalog in `prompt_bereiche`, max 5); coached branch: the
 * coach guides, same capture. Both show the hint that only the catalog models
 * are used and a link that opens the Modelle drawer. Old entries without a
 * note stay valid (shown without a model badge).
 */
export function Step6ModellRessourcen({ nav }: { nav: PhaseNavigation }) {
  const branch = useSessionStore((s) => s.session?.meta.branch);
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");
  const vision = useSessionStore((s) => s.session?.phase2.vision ?? "");
  const istWord = useSessionStore((s) => s.session?.phase1.istWord ?? "");
  const cards = useSessionStore((s) => s.session?.phase1.cards) ?? NO_CARDS;
  const clusters =
    useSessionStore((s) => s.session?.phase1.clusters) ?? NO_CLUSTERS;
  const phase3 = useSessionStore((s) => s.session?.phase3);
  const hypotheses = useSessionStore((s) => s.session?.phase3.hypotheses ?? []);
  const patch = useSessionStore((s) => s.patch);
  const katalog = useSmcKatalog();
  const modelle = katalog.katalog ? promptModelle(katalog.katalog) : [];
  // Die Gruppen der Schublade, deren Modelle im Prompt stehen.
  const promptGruppen = katalog.katalog
    ? katalog.katalog.bereiche
        .filter((b) => katalog.katalog?.promptBereiche.includes(b.id))
        .map((b) => `„${b.label}“`)
        .join(" und ")
    : "";
  // Ohne geladenen Katalog gibt es keinen Prompt, sonst schlüge das
  // Sprachmodell wieder beliebige Modelle vor.
  const promptText =
    katalog.status === "loading"
      ? "Der Modellkatalog wird geladen …"
      : katalog.status === "error"
        ? "Der Modellkatalog ist gerade nicht verfügbar. Lade ihn oben erneut, dann erscheint hier dein Prompt."
        : modelle.length === 0
          ? "Im Modellkatalog ist für diesen Schritt kein Modell hinterlegt."
          : buildModellPrompt({
              istWord,
              clusters,
              cards,
              goalText,
              vision,
              phase3,
              modelle,
            });

  function setHypotheses(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, hypotheses: next } }));
  }

  return (
    <div className="space-y-6">
      <div className="max-w-prose space-y-2 text-muted">
        {INTRO_ABSAETZE.map((absatz) => (
          <p key={absatz}>{absatz}</p>
        ))}
      </div>

      <p className="text-sm text-muted">
        Es gibt hunderte solcher Modelle — längst nicht alle passen zu deinem
        Thema. Deshalb bekommst du maximal 5 Vorschläge; unpassende legst du
        einfach beiseite.
      </p>

      {/* Teil 1.3 e: nur die hinterlegten Modelle, Link zur Schublade. */}
      <div className="space-y-3 rounded-xl border border-subtle bg-surface-2 p-4">
        <p className="text-sm text-foreground">
          {branch === "coached"
            ? "Ihr arbeitet mit den Modellen, die in der App hinterlegt sind."
            : `Die KI darf nur die Modelle verwenden, die in der App hinterlegt sind. ${
                promptGruppen
                  ? `Dein Prompt enthält alle Modelle der Gruppe ${promptGruppen}, in der Übersicht mit „im Prompt“ gekennzeichnet.`
                  : "Dein Prompt enthält die Modellliste für diesen Schritt."
              }`}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => requestDrawer("models")}
        >
          <Boxes />
          Modelle anzeigen
        </Button>
        {katalog.status === "error" ? (
          <ContentLoadState
            status="error"
            error={katalog.error}
            onRetry={katalog.retry}
          />
        ) : null}
      </div>

      {/* Die vier Leitfragen */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <p className="text-sm font-medium text-foreground">
          Schau dir das Modell an und frage dich:
        </p>
        <ol className="mt-2 space-y-1 text-sm text-muted">
          {LEITFRAGEN.map((frage, index) => (
            <li key={frage}>
              <span className="font-medium text-foreground">{index + 1}.</span>{" "}
              {frage}
            </li>
          ))}
        </ol>
      </div>

      {branch === "coached" ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-subtle bg-surface-2 p-4 text-sm text-foreground">
            Diesen Schritt begleitet dein Coach — gemeinsam wählt ihr Modelle
            aus und geht sie durch. Halte hier fest, welche Erkenntnisse und
            Ressourcen dabei entstehen.
          </div>
          <ResourceListEditor
            items={hypotheses}
            onItemsChange={setHypotheses}
            addLabel="Erkenntnis / Ressource"
            placeholder="eine Erkenntnis, eine Ressource …"
            itemLabel="Erkenntnis"
            emptyHint="Noch nichts erfasst."
            noteLabel="Modell"
            notePlaceholder="Modellname"
            withPolarity
          />
          <NoPersonalDataHint />
        </div>
      ) : (
        <div className="space-y-3">
          <KiImpuls
            promptText={promptText}
            items={hypotheses}
            onItemsChange={setHypotheses}
            captureLabel="Erkenntnis / Ressource"
            captureNoteLabel="Modell"
            captureNotePlaceholder="Modellname"
            captureWithPolarity
          />
          <div className="space-y-1 rounded-lg border border-subtle bg-surface-2 p-3 text-xs text-muted">
            <p>
              So überträgst du die Antwort: Den Namen aus der Zeile „Modell“
              schreibst du in das Feld „Modellname“, den Text aus der Zeile
              „Ressource“ in das Feld daneben. Impuls und Frage kannst du im
              Erkenntnisboard festhalten.
            </p>
            <p>
              Die Vorschläge beruhen ausschließlich auf deinen Aussagen und sind
              keine Deutung. Wenn dir ein Modell unpassend erscheint, lege es
              einfach beiseite. Du kannst dir die Modelle kurz erklären lassen.
            </p>
            <p>
              Wenn keines passt, kopiere den Prompt erneut und bitte um eine
              neue Auswahl.
            </p>
          </div>
        </div>
      )}

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
      />
    </div>
  );
}
