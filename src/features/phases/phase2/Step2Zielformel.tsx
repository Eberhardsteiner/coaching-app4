import { useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import {
  DEFAULT_SATZANFANG,
  assembleGoalText,
  withBausteine,
} from "@/features/phases/phase2/zielsatz";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Cluster } from "@/features/session/types";
import { cn } from "@/lib/utils";

/** Stable empty default for the clusters selector. */
const NO_CLUSTERS: Cluster[] = [];

/**
 * Anmoderation (MP2-REV, wortgetreu) — sichtbarer Coaching-Text (VOICE-1),
 * K1: in drei Sinnabsätze + einen Handlungs-Absatz gesetzt. „dem obigen
 * Muster" ist Pflicht-Wortlaut aus der Methodik-Vorlage; die Muster-Zeile
 * wird direkt darunter gerendert (wie schon in MP2-REV).
 */
const INTRO_ABSAETZE: ReactNode[] = [
  "Du hast nun eine Vorstellung deiner positiven neuen Situation. Vermutlich wirst du dir die Stichworte aus deinem Brainstorming nicht alle einfach so merken können.",
  <>
    Deshalb geht es nun darum, dass du dir einen Satz zurechtlegst, der für dich
    wie eine Art{" "}
    <strong className="font-semibold text-foreground">Mantra</strong> dienen
    kann. Der in einem Satz beschreibt, wonach du strebst.
  </>,
  "Damit der Satz für dich gut funktioniert, sollen Qualitätsmerkmale unterstützen, die du leicht selbst überprüfen kannst.",
  <>
    Bitte beginne damit, dass du dein erstrebenswertes Gefühl (als{" "}
    <strong className="font-semibold text-foreground">Substantiv</strong>, also
    z. B.{" "}
    <strong className="font-semibold text-foreground">„Gelassenheit“</strong>{" "}
    statt „gelassen“) identifizierst. Formuliere dann bitte einen Satz, der dem
    obigen Muster entspricht.
  </>,
];

/** Muster-Zeile (MP2-REV, wortgetreu) — sichtbar unter der Anmoderation. */
const MUSTER =
  "Muster: Ab dem DATUM werde ich (in meiner Funktion als …) das POSITIVE GEFÜHL in Bezug auf „mein Hauptproblem“ erreicht haben.";

/**
 * Phase 2, Step 2.2 — Mein Zielsatz (D4). Der Satz entsteht aus Bausteinen:
 * Satzanfang (frei, Standard „Ab dem“) + Datum aus der Kalenderauswahl,
 * „werde ich als“ + Rolle, das Gefühl aus 2.1 (vorbelegt, änderbar), „in
 * Bezug auf“ + freier Bezug (leer, die Clusterüberschrift wird NICHT mehr
 * automatisch übernommen, zur Orientierung aber angezeigt), „erreicht haben“.
 * Der zusammengesetzte Satz steht darunter in einem frei bearbeitbaren Feld.
 * Nach einer Handänderung überschreiben die Bausteine ihn nicht mehr, bis er
 * neu zusammengesetzt wird. Gespeichert werden Datum und endgültiger Satz.
 *
 * D2 als unnummerierte Zwischenstufe: „Weiter“ führt zuerst zur Frage, ob sich
 * das Ziel auf das höchstbewertete Cluster bezieht (Schritt bleibt 2.2).
 * Keine Pflichteingabe.
 */
export function Step2Zielformel({ nav }: { nav: PhaseNavigation }) {
  const phase2 = useSessionStore((s) => s.session?.phase2);
  const clusters =
    useSessionStore((s) => s.session?.phase1.clusters) ?? NO_CLUSTERS;
  const patch = useSessionStore((s) => s.patch);
  const [stage, setStage] = useState<"satz" | "bezug">("satz");

  const satzanfang = phase2?.satzanfang ?? "";
  const datum = phase2?.datum ?? "";
  const rolle = phase2?.rolle ?? "";
  const gefuehl = phase2?.gefuehl ?? "";
  const bezug = phase2?.bezug ?? "";
  const goalText = phase2?.goalText ?? "";
  const manuell = phase2?.goalTextManuell ?? false;
  const antwort = phase2?.zielClusterBezug;

  const core = clusters.find((c) => c.isCore);
  const coreName = core
    ? core.name.trim() || `Cluster ${clusters.indexOf(core) + 1}`
    : "";

  function setBaustein(
    partial: Partial<{
      satzanfang: string;
      datum: string;
      rolle: string;
      gefuehl: string;
      bezug: string;
    }>,
  ) {
    patch((s) => ({ ...s, phase2: withBausteine(s.phase2, partial) }));
  }

  /** Handänderung am Satz: ab jetzt überschreiben die Bausteine ihn nicht. */
  function setGoalTextManuell(value: string) {
    patch((s) => ({
      ...s,
      phase2: { ...s.phase2, goalText: value, goalTextManuell: true },
    }));
  }

  function neuZusammensetzen() {
    patch((s) => ({
      ...s,
      phase2: {
        ...s.phase2,
        goalTextManuell: false,
        goalText: assembleGoalText(s.phase2),
      },
    }));
  }

  /** D2-Antwort speichern und das Kriterium „Bezug zum Kernthema“ vorbelegen. */
  function setAntwort(value: boolean) {
    patch((s) => ({
      ...s,
      phase2: {
        ...s.phase2,
        zielClusterBezug: value,
        components: { ...s.phase2.components, kontextbezug: value },
      },
    }));
  }

  function toTop() {
    document.querySelector("main")?.scrollTo({ top: 0 });
  }

  // ---- D2: die unnummerierte Zwischenstufe ---------------------------------
  if (stage === "bezug" && core) {
    return (
      <div>
        <div className="space-y-5">
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-faint">
              Dein Zielsatz
            </p>
            <p className="mt-2 font-medium leading-relaxed break-words text-foreground">
              {goalText.trim() || "Du hast noch keinen Zielsatz formuliert."}
            </p>
          </div>

          <div className="rounded-xl border border-ist/40 bg-ist/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ist">
              Dein am höchsten bewertetes Cluster aus Phase 1
            </p>
            <p className="mt-1 font-serif text-xl break-words text-foreground">
              {coreName}
              {core.weight != null ? (
                <span className="ml-2 align-middle text-sm font-medium text-muted">
                  Wert {core.weight}
                </span>
              ) : null}
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-foreground">
              Bezieht sich dein Ziel auf dieses Cluster?
            </p>
            <div
              role="group"
              aria-label="Bezieht sich dein Ziel auf dieses Cluster?"
              className="inline-flex overflow-hidden rounded-lg border border-subtle"
            >
              {[
                { value: true, label: "Ja" },
                { value: false, label: "Nein" },
              ].map((option, index) => (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={antwort === option.value}
                  onClick={() => setAntwort(option.value)}
                  className={cn(
                    "px-5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                    index > 0 && "border-l border-subtle",
                    antwort === option.value
                      ? "bg-accent text-white"
                      : "bg-surface text-muted hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {antwort === false ? (
            <div className="space-y-3 rounded-xl border border-amber-600/40 bg-amber-50 p-4">
              <p className="text-foreground">
                Prüfe noch einmal, ob dieses Cluster wirklich dein Hauptproblem
                ist.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nav.goTo(1, 3)}
                >
                  Zurück zur Bewertung in Phase 1
                </Button>
                <Button size="sm" onClick={nav.advance}>
                  Ziel so beibehalten
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <StepNav
          onBack={() => {
            setStage("satz");
            toTop();
          }}
          canBack
          onNext={nav.advance}
          canNext
        />
      </div>
    );
  }

  // ---- D4: der Zielsatz aus Bausteinen -------------------------------------
  return (
    <div>
      <div className="space-y-5">
        {/* Die vollständige Mantra-Anmoderation + Muster-Zeile — SICHTBAR
            (VOICE-1: MP2-REV-Anmoderationen sind nie zugeklappt). */}
        <div className="max-w-prose space-y-2 text-muted">
          {INTRO_ABSAETZE.map((absatz, index) => (
            <p key={index}>{absatz}</p>
          ))}
        </div>
        {/* P5: Muster + Beispielsatz — direkt über der Eingabe, damit der
            Verweis „dem obigen Muster" an Ort und Stelle stimmt. */}
        <div className="rounded-xl border border-subtle bg-surface-2 p-4">
          <p className="font-medium text-foreground">{MUSTER}</p>
          <p className="mt-2 text-sm text-muted">
            Beispiel: „Ab dem 01.06.2027 werde ich als Teamleiterin Gelassenheit
            in Bezug auf die Zusammenarbeit in meinem Team erreicht haben.“
          </p>
        </div>

        {/* Die Bausteine in Satzreihenfolge. */}
        <div className="space-y-4 rounded-xl border border-subtle bg-surface p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Satzanfang"
              htmlFor="phase2-satzanfang"
              hint="Zum Beispiel „Ab dem“ oder „Am Abend des“."
            >
              <Input
                id="phase2-satzanfang"
                value={satzanfang}
                onChange={(event) =>
                  setBaustein({ satzanfang: event.target.value })
                }
                placeholder={DEFAULT_SATZANFANG}
              />
            </Field>
            <Field label="Datum" htmlFor="phase2-datum">
              <Input
                id="phase2-datum"
                type="date"
                value={datum}
                onChange={(event) => setBaustein({ datum: event.target.value })}
              />
            </Field>
          </div>

          <Field
            label="werde ich als (Rolle oder Funktion, optional)"
            htmlFor="phase2-rolle"
            hint="Bleibt das Feld leer, entfällt „als …“ im Satz."
          >
            <Input
              id="phase2-rolle"
              value={rolle}
              onChange={(event) => setBaustein({ rolle: event.target.value })}
              placeholder="z. B. Teamleitung"
            />
          </Field>

          <Field
            label="Gefühl"
            htmlFor="phase2-gefuehl"
            hint="Aus Schritt 2.1 übernommen. Du kannst es hier ändern."
          >
            <Input
              id="phase2-gefuehl"
              value={gefuehl}
              onChange={(event) => setBaustein({ gefuehl: event.target.value })}
              placeholder="z. B. Gelassenheit"
            />
          </Field>

          <Field
            label="in Bezug auf"
            htmlFor="phase2-bezug"
            hint={
              coreName
                ? `Zur Orientierung: Dein am höchsten bewertetes Cluster aus Phase 1 heißt „${coreName}“.`
                : undefined
            }
          >
            <Input
              id="phase2-bezug"
              value={bezug}
              onChange={(event) => setBaustein({ bezug: event.target.value })}
              placeholder="Worauf bezieht sich dein Ziel?"
            />
          </Field>
          <p className="text-sm text-muted">… erreicht haben.</p>
        </div>

        {/* Der zusammengesetzte, frei bearbeitbare Satz. */}
        <div className="space-y-2 rounded-xl border border-accent/30 bg-accent/5 p-4">
          <label
            htmlFor="phase2-zielsatz"
            className="block text-xs font-medium uppercase tracking-wide text-faint"
          >
            Dein Zielsatz
          </label>
          <Textarea
            id="phase2-zielsatz"
            autoResize
            rows={3}
            value={goalText}
            onChange={(event) => setGoalTextManuell(event.target.value)}
            placeholder="Dein Satz entsteht hier, sobald du die Bausteine ausfüllst."
            className="font-medium"
          />
          <p className="text-sm text-faint">
            Du kannst den Satz frei ändern und ergänzen.
          </p>
          {manuell ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted">
                Du hast den Satz von Hand geändert. Die Bausteine oben ändern
                ihn erst wieder, wenn du ihn neu zusammensetzt.
              </p>
              <Button variant="outline" size="sm" onClick={neuZusammensetzen}>
                <RotateCcw />
                Satz neu zusammensetzen
              </Button>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-subtle bg-surface-2 p-4">
          <p className="text-sm text-muted">
            Lies ihn dir{" "}
            <strong className="font-semibold text-foreground">laut</strong> vor
            und spüre, ob er in dir ein gutes Gefühl auslöst.
          </p>
        </div>

        <NoPersonalDataHint />
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={() => {
          if (core) {
            setStage("bezug");
            toTop();
          } else {
            nav.advance();
          }
        }}
        canNext
      />
    </div>
  );
}

/** Small labelled field wrapper with an optional hint. */
function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-sm text-faint">{hint}</p> : null}
    </div>
  );
}
