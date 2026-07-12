import { PhaseCheck } from "@/features/phases/PhaseCheck";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { PhaseCheck as PhaseCheckValue } from "@/features/session/types";

const EMPTY_CHECK: PhaseCheckValue = {
  result: "",
  process: "",
  insight: "",
  transfer: "",
};

/** Outro (Methodik-Vorlage, wortgetreu, gekürzt). */
const OUTRO =
  "Deine Phase 4 ist mit dem Handlungsplan abgeschlossen. Du weißt, wo du hinwillst, kennst deine Ressourcen und hast aus deinen förderlichen Ressourcen einen Maßnahmenplan geschmiedet. Auch wenn dich dein innerer Prozess in Bewegung versetzt hat: In der äußeren Welt hast du noch nichts verändert. Es geht nun darum, deinen Plan wirklich werden zu lassen — die letzte, kurze Phase 5 unterstützt dich genau darin.";

/** Format an ISO date (yyyy-mm-dd) as a German date without timezone shifts. */
function formatGermanDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

/**
 * Phase 4, Step 4.4 — Abschluss & Check. The method's outro, a compact plan
 * overview (per cluster: measures with due-date badges) and the shared
 * four-part check. "Phase abschließen" completes Phase 4 → unlocks Phase 5.
 */
export function Step4Abschluss({ nav }: { nav: PhaseNavigation }) {
  const check = useSessionStore((s) => s.session?.phase4.check) ?? EMPTY_CHECK;
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const plans = useSessionStore((s) => s.session?.phase4.plans ?? []);
  const patch = useSessionStore((s) => s.patch);

  const sorted = [...clusters].sort(
    (a, b) =>
      Number(b.isCore ?? false) - Number(a.isCore ?? false) ||
      (b.weight ?? 0) - (a.weight ?? 0),
  );
  const groups = [
    ...sorted.map((cluster, index) => ({
      id: cluster.id,
      name: cluster.name.trim() || `Cluster ${index + 1}`,
      isCore: Boolean(cluster.isCore),
      measures: (
        plans.find((p) => p.clusterId === cluster.id)?.measures ?? []
      ).filter((m) => m.text.trim()),
    })),
    // Orphan plans (cluster no longer exists) — shown like in 4.2/4.3.
    ...plans
      .filter((p) => !clusters.some((c) => c.id === p.clusterId))
      .map((p) => ({
        id: p.clusterId,
        name: "Weitere",
        isCore: false,
        measures: p.measures.filter((m) => m.text.trim()),
      })),
  ].filter((g) => g.measures.length > 0);

  function setCheck(next: PhaseCheckValue) {
    patch((s) => ({ ...s, phase4: { ...s.phase4, check: next } }));
  }

  return (
    <div className="space-y-6">
      <p className="text-muted">{OUTRO}</p>

      {/* Kompakte Plan-Übersicht */}
      {groups.length > 0 ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            Dein Handlungsplan
          </p>
          <div className="mt-2 space-y-3">
            {groups.map((group) => (
              <div key={group.id}>
                <p className="text-sm font-medium text-foreground">
                  {group.name}
                  {group.isCore ? (
                    <span className="ml-1.5 text-xs font-normal text-faint">
                      (Kernthema)
                    </span>
                  ) : null}
                </p>
                <ul className="mt-1 space-y-1">
                  {group.measures.map((measure) => (
                    <li
                      key={measure.id}
                      className="flex flex-wrap items-baseline gap-2 text-sm text-foreground"
                    >
                      <span className="min-w-0">{measure.text.trim()}</span>
                      {measure.dueDate ? (
                        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                          bis {formatGermanDate(measure.dueDate)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <PhaseCheck value={check} onChange={setCheck} />

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext
        nextLabel="Phase abschließen"
      />
    </div>
  );
}
