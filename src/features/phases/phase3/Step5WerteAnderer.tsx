import {
  Boxes,
  Check,
  ChevronDown,
  HelpCircle,
  Plus,
  SkipForward,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { InfoCallout } from "@/components/method/InfoCallout";
import { Button } from "@/components/ui/button";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import { ResourceListEditor } from "@/features/phases/phase3/ResourceListEditor";
import { WertelisteReferenz } from "@/features/phases/phase3/WertelisteReferenz";
import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";
import type { Cluster, ResourceItem } from "@/features/session/types";
import { cn } from "@/lib/utils";

/** Max. 3 Werte je Cluster (Methodik). */
const MAX_PER_CLUSTER = 3;

/** Anmoderation (Methodik-Vorlage, wortgetreu, gekürzt). */
const INTRO_1 =
  "Du hast deine Motive, Persönlichkeitseigenschaften, Intelligenzen und Werte identifiziert und nach zielförderlich und zielhinderlich klassifiziert. Beachte: Die Klassifikation gilt nur in Bezug auf dein Ziel — sie ist keine allgemeine Aussage! Dein Motiv ‚Dominanz‘ kann dir hier helfen und in einem anderen Kontext im Weg stehen.";
const INTRO_2 =
  "Jetzt folgt ein Perspektivwechsel: Du orientierst dich an deinen Werten — deine systemischen Mitspieler orientieren sich an ihren eigenen. Je nachdem, wie gut deine Werte und die der anderen zueinander passen, laufen die Dinge besser oder eben nicht. Bitte gehe durch alle deine Cluster.";

function clusterName(cluster: Cluster, index: number): string {
  return cluster.name.trim() || `Cluster ${index + 1}`;
}

/**
 * Phase 3, Step 3.5 — Werte der Anderen: a guided pass through the Phase-1
 * clusters (core theme first, then by weight — the Phase-2.4 pattern). Per
 * cluster: a "Wer?" field (ONE othersValues entry with category "wer"), up to
 * three values (entries without category, linked via clusterId) and a
 * deliberate skip (persisted as a category "skip" entry, so the soft gate
 * survives reloads). Below: the comparison of own vs. others' values →
 * phase3.othersValuesInsight. Gate: every cluster has ≥1 value OR is skipped.
 */
export function Step5WerteAnderer({ nav }: { nav: PhaseNavigation }) {
  const othersValues = useSessionStore(
    (s) => s.session?.phase3.othersValues ?? [],
  );
  const myValues = useSessionStore((s) => s.session?.phase3.values ?? []);
  const insight = useSessionStore(
    (s) => s.session?.phase3.othersValuesInsight ?? "",
  );
  const clusters = useSessionStore((s) => s.session?.phase1.clusters ?? []);
  const patch = useSessionStore((s) => s.patch);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const sorted = [...clusters].sort(
    (a, b) =>
      Number(b.isCore ?? false) - Number(a.isCore ?? false) ||
      (b.weight ?? 0) - (a.weight ?? 0),
  );

  const valuesOf = (clusterId: string) =>
    othersValues.filter((i) => i.clusterId === clusterId && !i.category);
  const werOf = (clusterId: string) =>
    othersValues.find((i) => i.clusterId === clusterId && i.category === "wer");
  const isSkipped = (clusterId: string) =>
    othersValues.some(
      (i) => i.clusterId === clusterId && i.category === "skip",
    );
  const isDone = (clusterId: string) => valuesOf(clusterId).length > 0;

  // Legacy entries from pre-MP3 sessions (flat list, no cluster reference or
  // one whose cluster no longer exists) — shown and editable below, so no old
  // data becomes invisible or undeletable.
  const legacy = othersValues.filter(
    (i) =>
      !i.category &&
      (!i.clusterId || !clusters.some((c) => c.id === i.clusterId)),
  );

  /** Replace the legacy entries while keeping every cluster-bound entry. */
  function setLegacy(next: ResourceItem[]) {
    const legacyIds = new Set(legacy.map((i) => i.id));
    setOthersValues([
      ...othersValues.filter((i) => !legacyIds.has(i.id)),
      ...next,
    ]);
  }

  function setOthersValues(next: ResourceItem[]) {
    patch((s) => ({ ...s, phase3: { ...s.phase3, othersValues: next } }));
  }

  function setInsight(value: string) {
    patch((s) => ({
      ...s,
      phase3: { ...s.phase3, othersValuesInsight: value },
    }));
  }

  /**
   * Any interaction pins its cluster as the selected one — otherwise the
   * derived "first incomplete" active cluster would jump away the moment the
   * first value makes the current cluster complete (mid-input).
   */
  function pin(clusterId: string) {
    setSelectedId(clusterId);
  }

  /** Upsert the single "Wer?" entry of a cluster. */
  function setWer(clusterId: string, text: string) {
    pin(clusterId);
    const existing = werOf(clusterId);
    if (existing) {
      setOthersValues(
        othersValues.map((i) => (i.id === existing.id ? { ...i, text } : i)),
      );
    } else {
      setOthersValues([
        ...othersValues,
        { id: crypto.randomUUID(), text, category: "wer", clusterId },
      ]);
    }
  }

  function addValue(clusterId: string, text: string) {
    pin(clusterId);
    const trimmed = text.trim();
    if (!trimmed || valuesOf(clusterId).length >= MAX_PER_CLUSTER) return;
    setOthersValues([
      ...othersValues,
      { id: crypto.randomUUID(), text: trimmed, clusterId },
    ]);
  }

  function removeEntry(id: string) {
    setOthersValues(othersValues.filter((i) => i.id !== id));
  }

  /** Toggle the persisted deliberate skip of a cluster. */
  function toggleSkip(clusterId: string) {
    pin(clusterId);
    const existing = othersValues.find(
      (i) => i.clusterId === clusterId && i.category === "skip",
    );
    if (existing) {
      setOthersValues(othersValues.filter((i) => i.id !== existing.id));
    } else {
      setOthersValues([
        ...othersValues,
        { id: crypto.randomUUID(), text: "", category: "skip", clusterId },
      ]);
    }
  }

  if (sorted.length === 0) {
    return (
      <div>
        <div className="rounded-xl border border-subtle bg-surface-2 p-5">
          <p className="text-sm text-foreground">
            Für diesen Schritt fehlen deine Cluster aus Phase 1. Geh kurz zurück
            und bilde dort deine Cluster.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => nav.goToPhase(1)}
          >
            Zurück zu Phase 1
          </Button>
        </div>
      </div>
    );
  }

  const active =
    sorted.find((c) => c.id === selectedId) ??
    sorted.find((c) => !isDone(c.id) && !isSkipped(c.id)) ??
    sorted[0];
  const activeIndex = sorted.findIndex((c) => c.id === active.id);
  const activeName = clusterName(active, activeIndex);
  const activeValues = valuesOf(active.id);
  const activeFull = activeValues.length >= MAX_PER_CLUSTER;
  const handled = sorted.filter((c) => isDone(c.id) || isSkipped(c.id)).length;
  const canNext = handled === sorted.length;

  return (
    <div className="space-y-6">
      <p className="text-muted">{INTRO_2}</p>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-accent">
          <ChevronDown
            className="size-3.5 motion-safe:transition-transform group-open:rotate-180"
            aria-hidden
          />
          Woher deine Klassifikation kommt
        </summary>
        <p className="mt-1.5 text-sm text-muted">{INTRO_1}</p>
      </details>

      <p className="rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-sm text-muted">
        Wenn du ein „Ich“-Cluster hast, kannst du es hier weglassen — deine
        Werte hast du bereits identifiziert.
      </p>

      {/* Zwei Hilfe-Callouts (VIS-2) — Beispiele aufklappbar. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoCallout
          icon={<HelpCircle className="size-4" />}
          title="Es bleibt hypothetisch"
          tone="neutral"
        >
          Dieser Schritt ist naturgemäß hypothetisch und fehleranfällig — du
          kannst nur beschreiben, was du im Alltag wahrnimmst: was deine
          Mitspieler in Verhalten und Entscheidungen wichtig nehmen.
        </InfoCallout>
        <InfoCallout
          icon={<Boxes className="size-4" />}
          title="Abstrakte Cluster"
          tone="neutral"
          detail={
            <p>
              Stecken Personen darin (z. B. „Arbeit“ → deine Chefin)? Geh in
              deren Perspektive. Ist das Cluster in Gänze abstrakt (z. B.
              „Prozesse“), frag dich, was diesem Cluster wichtig ist — was ist
              einem gut funktionierenden Prozess wichtig, und wie gut passt das
              zu deinem Wert „Flexibilität“? Ein Blick in deine Ist-Analyse aus
              Phase 1 hilft.
            </p>
          }
          detailLabel="Beispiele ansehen"
        >
          Stecken Personen darin? Geh in deren Perspektive — sonst frag, was dem
          Cluster selbst wichtig ist.
        </InfoCallout>
      </div>

      {/* Cluster-Navigation */}
      <div
        role="group"
        aria-label="Cluster auswählen"
        className="flex flex-wrap gap-2"
      >
        {sorted.map((cluster, index) => {
          const done = isDone(cluster.id);
          const skipped = isSkipped(cluster.id);
          const isActive = cluster.id === active.id;
          return (
            <button
              key={cluster.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSelectedId(cluster.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isActive
                  ? "border-accent bg-accent text-white"
                  : "border-subtle bg-surface text-muted hover:text-foreground",
              )}
            >
              {done ? (
                <Check className="size-3.5" aria-hidden />
              ) : skipped ? (
                <SkipForward className="size-3.5" aria-hidden />
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    "size-2 rounded-full border",
                    isActive ? "border-white/70" : "border-faint",
                  )}
                />
              )}
              <span>{clusterName(cluster, index)}</span>
              {cluster.isCore ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[0.65rem] font-medium uppercase tracking-wide",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-accent/10 text-accent",
                  )}
                >
                  Kernthema
                </span>
              ) : null}
              <span className="sr-only">
                {done
                  ? " — bearbeitet"
                  : skipped
                    ? " — übersprungen"
                    : " — offen"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-faint">
        {handled} von {sorted.length} Clustern bearbeitet oder übersprungen.
      </p>

      {/* Aktives Cluster */}
      <div className="space-y-4 rounded-xl border border-subtle bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {activeName}
            {werOf(active.id)?.text.trim() ? (
              <span className="ml-1.5 text-xs font-normal text-muted">
                · {werOf(active.id)?.text.trim()}
              </span>
            ) : null}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={isSkipped(active.id)}
            onClick={() => toggleSkip(active.id)}
          >
            <SkipForward />
            {isSkipped(active.id)
              ? "Übersprungen — zurückholen"
              : "Überspringen"}
          </Button>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="others-wer"
            className="block text-sm font-medium text-foreground"
          >
            Wer? — Personen oder Gruppen in diesem Cluster
          </label>
          <input
            id="others-wer"
            type="text"
            value={werOf(active.id)?.text ?? ""}
            onChange={(event) => setWer(active.id, event.target.value)}
            placeholder="z. B. Mitarbeitende, meine Chefin"
            className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <NoPersonalDataHint example="meine Chefin" />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">
            Was nehmen sie wichtig? (max. {MAX_PER_CLUSTER} Werte)
          </p>
          <ul className="space-y-1.5">
            {activeValues.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-subtle bg-background px-2.5 py-1.5"
              >
                <span className="min-w-0 truncate text-sm text-foreground">
                  {item.text}
                </span>
                <button
                  type="button"
                  onClick={() => removeEntry(item.id)}
                  aria-label={`„${item.text}“ entfernen`}
                  title="Entfernen"
                  className="flex size-7 shrink-0 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draft}
              disabled={activeFull}
              aria-label={`Wert für ${activeName} ergänzen`}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addValue(active.id, draft);
                  setDraft("");
                }
              }}
              placeholder={activeFull ? "Maximal 3 Werte." : "Wert …"}
              className={cn(
                "min-w-0 flex-1 rounded-lg border border-subtle bg-background px-2.5 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                activeFull && "cursor-not-allowed opacity-45",
              )}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={activeFull}
              onClick={() => {
                addValue(active.id, draft);
                setDraft("");
              }}
            >
              <Plus />
              Hinzufügen
            </Button>
          </div>
        </div>

        <WertelisteReferenz
          onPick={(value) => addValue(active.id, value)}
          disabled={activeFull}
          summaryLabel="Werteliste als Anregung"
        />
      </div>

      {/* Abgleich */}
      <div className="space-y-3 rounded-xl border border-subtle bg-surface-2 p-4">
        <p className="text-sm text-foreground">
          Wenn du fertig bist, gleiche deine Werte mit denen der anderen ab.
          Welche Erkenntnisse gewinnst du dabei? Notiere sie bitte.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-faint">
              Meine Werte
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {myValues
                .filter((i) => i.text.trim())
                .map((i) => (
                  <span
                    key={i.id}
                    className="rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs text-foreground"
                  >
                    {i.text}
                  </span>
                ))}
              {myValues.filter((i) => i.text.trim()).length === 0 ? (
                <span className="text-xs text-faint">
                  Noch keine — siehe Schritt 3.4.
                </span>
              ) : null}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-faint">
              Werte der Anderen
            </p>
            <div className="mt-1.5 space-y-1.5">
              {sorted.map((cluster, index) => {
                const entries = valuesOf(cluster.id);
                if (entries.length === 0) return null;
                return (
                  <div key={cluster.id} className="text-xs text-muted">
                    <span className="font-medium text-foreground">
                      {clusterName(cluster, index)}:
                    </span>{" "}
                    <span className="mt-0.5 inline-flex flex-wrap gap-1 align-middle">
                      {entries.map((i) => (
                        <span
                          key={i.id}
                          className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-900"
                        >
                          {i.text}
                        </span>
                      ))}
                    </span>
                  </div>
                );
              })}
              {legacy.some((i) => i.text.trim()) ? (
                <div className="text-xs text-muted">
                  <span className="font-medium text-foreground">Weitere:</span>{" "}
                  <span className="mt-0.5 inline-flex flex-wrap gap-1 align-middle">
                    {legacy
                      .filter((i) => i.text.trim())
                      .map((i) => (
                        <span
                          key={i.id}
                          className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-900"
                        >
                          {i.text}
                        </span>
                      ))}
                  </span>
                </div>
              ) : null}
              {!sorted.some((c) => valuesOf(c.id).length > 0) &&
              !legacy.some((i) => i.text.trim()) ? (
                <span className="text-xs text-faint">Noch keine.</span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="others-insight"
            className="block text-sm font-medium text-foreground"
          >
            Deine Erkenntnisse aus dem Abgleich
          </label>
          <textarea
            id="others-insight"
            value={insight}
            rows={3}
            onChange={(event) => setInsight(event.target.value)}
            placeholder="Was fällt dir auf, wenn du deine Werte neben die der anderen legst?"
            className="w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
      </div>

      {/* Legacy entries (pre-MP3 flat list) — editable, nothing thrown away. */}
      {legacy.length > 0 ? (
        <div className="space-y-2 border-t border-subtle pt-5">
          <p className="text-sm font-medium text-foreground">
            Weitere Einträge (ohne Cluster-Bezug)
          </p>
          <p className="text-xs text-muted">
            Diese Einträge stammen aus einer früheren Bearbeitung. Du kannst sie
            weiter bearbeiten, oben einem Cluster neu zuordnen oder löschen.
          </p>
          <ResourceListEditor
            items={legacy}
            onItemsChange={setLegacy}
            addLabel="Eintrag"
            itemLabel="Eintrag"
          />
        </div>
      ) : null}

      {!canNext ? (
        <p className="text-xs text-faint">
          „Weiter“ öffnet sich, wenn du jedes Cluster bearbeitet oder bewusst
          übersprungen hast.
        </p>
      ) : null}

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext={canNext}
      />
    </div>
  );
}
