import { Eye, Flag } from "lucide-react";
import { useState, type ReactNode } from "react";

import { CloudSymbol } from "@/components/icons/PhaseSymbols";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCardColor } from "@/features/cards/cardColors";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Card, Cluster } from "@/features/session/types";
import { cn } from "@/lib/utils";

/** Stable empty defaults for the store selectors. */
const NO_CARDS: Card[] = [];
const NO_CLUSTERS: Cluster[] = [];

/** Eine Karte der Ist-Situation, nur zur Ansicht (Farbe = Kartentyp). */
function IstKarte({ card }: { card: Card }) {
  const color = getCardColor(card.color);
  return (
    <li
      className={cn(
        "rounded-lg border border-subtle px-3 py-2 text-sm break-words",
        color.surface,
        card.modelTerm && "border-l-4 border-l-blue-700",
      )}
    >
      <span className="block text-[0.65rem] font-medium uppercase tracking-wide opacity-70">
        {color.label}
        {card.modelTerm ? " · aus dem Modell" : ""}
      </span>
      {card.text.trim() || "(ohne Text)"}
    </li>
  );
}

/**
 * C1: die Ist-Situation aus Phase 1 als reine Anzeige. Alle Cluster mit
 * Überschrift und Bewertung, darunter ihre Karten (Zusammenhänge,
 * Konkretisierungen, Beiträge), dazu das Ausgangsgefühl und Karten ohne
 * Cluster. Keine Bearbeitung. Mobil als gut lesbare Liste statt des frei
 * gelegten Boards. `hinweis` (E5) steht als Einladung ganz oben.
 */
export function IstSituationDialog({
  open,
  onOpenChange,
  hinweis,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hinweis?: ReactNode;
}) {
  const istWord = useSessionStore((s) => s.session?.phase1.istWord ?? "");
  const istBurden = useSessionStore((s) => s.session?.phase1.istBurden);
  const cards = useSessionStore((s) => s.session?.phase1.cards) ?? NO_CARDS;
  const clusters =
    useSessionStore((s) => s.session?.phase1.clusters) ?? NO_CLUSTERS;

  const sorted = [...clusters].sort(
    (a, b) =>
      Number(b.isCore ?? false) - Number(a.isCore ?? false) ||
      (b.weight ?? 0) - (a.weight ?? 0),
  );
  const clusterIds = new Set(clusters.map((c) => c.id));
  const ohneCluster = cards.filter(
    (c) => !c.clusterId || !clusterIds.has(c.clusterId),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-lg flex-col gap-4 overflow-hidden p-0">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Deine Ist-Situation aus Phase 1</DialogTitle>
          <DialogDescription>
            Nur zur Ansicht. Ändern kannst du sie in Phase 1.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-5">
          {hinweis ? (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-foreground">
              {hinweis}
            </div>
          ) : null}

          <div className="flex items-center gap-3 rounded-xl border border-ist/30 bg-ist/5 px-4 py-3">
            <CloudSymbol className="size-8 shrink-0 text-ist" />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-ist">
                Dein Ausgangsgefühl
              </p>
              <p className="font-serif text-xl break-words text-foreground">
                {istWord.trim() || "noch nicht benannt"}
              </p>
              {typeof istBurden === "number" ? (
                <p className="text-sm text-muted">
                  Belastung {istBurden} von 10
                </p>
              ) : null}
            </div>
          </div>

          {sorted.length === 0 ? (
            <p className="text-sm text-faint">
              In Phase 1 wurden noch keine Cluster gebildet.
            </p>
          ) : null}

          {sorted.map((cluster, index) => {
            const clusterCards = cards.filter(
              (c) => c.clusterId === cluster.id,
            );
            return (
              <section
                key={cluster.id}
                aria-label={`Cluster ${cluster.name.trim() || index + 1}`}
                className={cn(
                  "space-y-2 rounded-xl border p-3",
                  cluster.isCore
                    ? "border-ist/40 bg-ist/5"
                    : "border-blue-600/30 bg-blue-50/60",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="min-w-0 font-medium break-words text-foreground">
                    {cluster.name.trim() || `Cluster ${index + 1}`}
                  </h3>
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {cluster.weight != null
                      ? `Wert ${cluster.weight}`
                      : "ohne Wert"}
                  </span>
                  {cluster.isCore ? (
                    <span className="rounded-full bg-ist/10 px-2 py-0.5 text-xs font-medium text-ist">
                      Kernthema
                    </span>
                  ) : null}
                </div>
                {clusterCards.length > 0 ? (
                  <ul className="space-y-1.5">
                    {clusterCards.map((card) => (
                      <IstKarte key={card.id} card={card} />
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-faint">Keine Karten zugeordnet.</p>
                )}
              </section>
            );
          })}

          {ohneCluster.length > 0 ? (
            <section
              aria-label="Karten ohne Cluster"
              className="space-y-2 rounded-xl border border-dashed border-subtle p-3"
            >
              <h3 className="font-medium text-foreground">
                Karten ohne Cluster
              </h3>
              <ul className="space-y-1.5">
                {ohneCluster.map((card) => (
                  <IstKarte key={card.id} card={card} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** C2: der Zielsatz als reine Anzeige. */
export function ZielDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const goalText = useSessionStore((s) => s.session?.phase2.goalText ?? "");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Dein Zielsatz</DialogTitle>
          <DialogDescription>
            Nur zur Ansicht. Ändern kannst du ihn in Phase 2.
          </DialogDescription>
        </DialogHeader>
        <p className="rounded-xl border border-accent/30 bg-accent/5 p-4 font-medium leading-relaxed break-words text-foreground">
          {goalText.trim() || "Du hast noch keinen Zielsatz formuliert."}
        </p>
      </DialogContent>
    </Dialog>
  );
}

/**
 * C1–C3: die zwei freiwilligen Schaltflächen „Ist-Situation anzeigen“ (ab dem
 * Start von Phase 2) und „Ziel anzeigen“ (ab 2.4 „Folgen meines Ziels“).
 * Eine erzwungene Anzeige gibt es nur in 3.9 (E5), dort direkt über den
 * IstSituationDialog.
 */
export function IstZielButtons({
  showIst,
  showZiel,
}: {
  showIst: boolean;
  showZiel: boolean;
}) {
  const [istOpen, setIstOpen] = useState(false);
  const [zielOpen, setZielOpen] = useState(false);
  if (!showIst && !showZiel) return null;
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {showIst ? (
        <Button variant="outline" size="sm" onClick={() => setIstOpen(true)}>
          <Eye />
          Ist-Situation anzeigen
        </Button>
      ) : null}
      {showZiel ? (
        <Button variant="outline" size="sm" onClick={() => setZielOpen(true)}>
          <Flag />
          Ziel anzeigen
        </Button>
      ) : null}
      <IstSituationDialog open={istOpen} onOpenChange={setIstOpen} />
      <ZielDialog open={zielOpen} onOpenChange={setZielOpen} />
    </div>
  );
}
