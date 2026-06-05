import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Monitor, Save, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isShared } from "@/features/cards/visibility";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { usePhaseNavigation } from "@/features/phases/usePhaseNavigation";
import {
  downloadHandoff,
  downloadSession,
} from "@/features/session/exportSession";
import { getKvFlag, setKvFlag } from "@/features/session/sessionRepository";
import { useSessionStore } from "@/features/session/sessionStore";

/** kv flag for the (app-local) console collapse preference. */
const COLLAPSED_KEY = "coachConsoleCollapsed";

/**
 * Coach console (coached branch only). A collapsible right column with three
 * read/work areas: (a) the current phase/step anmoderation from phaseConfig
 * (read-only, same single-source text as the coachee view), (b) coach-only
 * notes/hypotheses (→ session.coachNotes; never shown on the stage), and
 * (c) an Inspector overview of the work surface. The collapse state persists
 * (kv flag). The console reads the store directly; AppShell renders it only in
 * the coached branch.
 */
export function CoachConsole() {
  const nav = usePhaseNavigation();
  const sessionId = useSessionStore((s) => s.session?.meta.id);
  const coachNotes = useSessionStore((s) => s.session?.coachNotes) ?? "";
  const cards = useSessionStore((s) => s.session?.phase1.cards ?? []);
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const patch = useSessionStore((s) => s.patch);

  const [collapsed, setCollapsed] = useState(false);

  // Load the persisted collapse state once (setState in the async callback).
  useEffect(() => {
    let active = true;
    void getKvFlag(COLLAPSED_KEY).then((value) => {
      if (active) setCollapsed(value);
    });
    return () => {
      active = false;
    };
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    void setKvFlag(COLLAPSED_KEY, next);
  }

  function setCoachNotes(value: string) {
    patch((s) => ({ ...s, coachNotes: value }));
  }

  /** Open the read-only presenter stage in a second window (reused if open). */
  function openStage() {
    if (!sessionId) return;
    window.open(
      `/buehne?id=${encodeURIComponent(sessionId)}`,
      "nhs-coaching-buehne",
    );
  }

  /** Cleaned handoff for the coachee (no coach_only / coachNotes; branch self). */
  function handoffToCoachee() {
    const current = useSessionStore.getState().session;
    if (current) downloadHandoff(current);
  }

  /** Full coach backup (includes coach_only cards + coachNotes). */
  function fullBackup() {
    const current = useSessionStore.getState().session;
    if (current) downloadSession(current);
  }

  const stepDef = nav.phaseDef.steps[nav.stepIndex];
  const sharedCount = cards.filter(isShared).length;
  const coachOnlyCount = cards.length - sharedCount;

  if (collapsed) {
    return (
      <aside
        aria-label="Konsole"
        className="flex w-10 shrink-0 flex-col items-center border-l border-subtle bg-surface py-3"
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Konsole öffnen"
          aria-expanded={false}
          title="Konsole öffnen"
          className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronLeft className="size-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Konsole"
      className="flex w-80 max-w-[85vw] shrink-0 flex-col overflow-y-auto border-l border-subtle bg-surface"
    >
      <header className="sticky top-0 flex items-center justify-between gap-2 border-b border-subtle bg-surface px-4 py-3">
        <h2 className="font-serif text-lg text-foreground">Konsole</h2>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Konsole einklappen"
          aria-expanded
          title="Einklappen"
          className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronRight className="size-5" />
        </button>
      </header>

      <div className="space-y-6 p-4">
        {/* Bühne öffnen — read-only presenter window to share in the call */}
        <section className="space-y-2">
          <button
            type="button"
            onClick={openStage}
            aria-label="Bühne öffnen"
            className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Monitor className="size-4" />
            Bühne öffnen
          </button>
          <p className="text-xs text-faint">
            Teile dieses Fenster im Videogespräch.
          </p>
        </section>

        {/* Übergabe — two clearly-distinguished export paths */}
        <section className="space-y-2 border-t border-subtle pt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-faint">
            Übergabe
          </h3>
          <div className="flex flex-col items-start gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handoffToCoachee}
              aria-label="An Coachee übergeben (bereinigte Datei)"
            >
              <Share2 />
              An Coachee übergeben
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fullBackup}
              aria-label="Vollständige Coach-Sicherung exportieren"
            >
              <Save />
              Vollständige Sicherung
            </Button>
          </div>
          <p className="text-xs text-faint">
            „An Coachee übergeben“ enthält nicht deine Coach-Notizen — sie
            reisen nicht mit und werden beim Zurück-Import nicht automatisch
            zusammengeführt.
          </p>
        </section>

        {/* (a) Anmoderation — read-only, single source: phaseConfig */}
        <section className="space-y-1.5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-faint">
            Anmoderation
          </h3>
          <p className="text-sm font-medium text-foreground">
            {nav.phaseDef.title} · {stepDef.title}
          </p>
          {stepDef.intro ? (
            <p className="text-sm text-muted">{stepDef.intro}</p>
          ) : null}
          <p className="text-xs text-faint">{nav.phaseDef.short}</p>
        </section>

        {/* (b) Coach notes — coach_only */}
        <section className="space-y-1.5 border-t border-subtle pt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-faint">
            Meine Hypothesen
          </h3>
          <label htmlFor="coach-notes" className="block text-xs text-muted">
            Nur für dich als Coach sichtbar.
          </label>
          <textarea
            id="coach-notes"
            value={coachNotes}
            rows={6}
            onChange={(event) => setCoachNotes(event.target.value)}
            placeholder="Beobachtungen, Hypothesen, nächste Impulse …"
            className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <NoPersonalDataHint />
        </section>

        {/* (c) Inspector — work-surface overview */}
        <section className="space-y-2 border-t border-subtle pt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-faint">
            Inspector
          </h3>
          <dl className="space-y-1 text-sm">
            <Row label="Aktive Phase">{nav.phaseDef.title}</Row>
            <Row label="Schritt">
              {stepDef.title} ({nav.stepIndex + 1}/{nav.stepCount})
            </Row>
            <Row label="Karten">{cards.length}</Row>
            <Row label="davon geteilt">{sharedCount}</Row>
            <Row label="nur Coach">{coachOnlyCount}</Row>
            <Row label="Cluster">{clusters.length}</Row>
          </dl>
          <p className="text-xs text-faint">
            Auswahl-Detail einer Karte folgt in einem späteren Paket.
          </p>
        </section>
      </div>
    </aside>
  );
}

/** One label/value row in the Inspector. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium tabular-nums text-foreground">{children}</dd>
    </div>
  );
}
