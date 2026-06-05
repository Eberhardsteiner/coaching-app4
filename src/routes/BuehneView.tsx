import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { CardBoard } from "@/features/cards/CardBoard";
import { stageVisibleCards } from "@/features/cards/visibility";
import { PHASES } from "@/features/phases/phaseConfig";
import { subscribeToSession } from "@/features/presenter/presenterChannel";
import { peekSession } from "@/features/session/sessionRepository";
import type { Session } from "@/features/session/types";
import { SessionSummary } from "@/features/summary/SessionSummary";

type LoadState = "loading" | "ready" | "notfound";

const noop = () => {};

/**
 * Presenter stage window (/buehne?id=…). Shell-free, persona "Ruhig", strictly
 * read-only and shared-only. Loads the session from Dexie (peekSession — never
 * writes) and re-reads it whenever the coach view broadcasts a save, so it
 * mirrors the live, persisted state. coach_only cards / coachNotes never appear.
 * The session lives in local state — the stage never touches the store.
 */
export function BuehneView() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [session, setSession] = useState<Session | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    if (!id) return;
    const sid = id; // narrowed string, captured by the closures below
    let active = true;

    async function load() {
      const loaded = await peekSession(sid);
      if (!active) return;
      if (loaded) {
        setSession(loaded);
        setLoadState("ready");
      } else {
        setLoadState("notfound");
      }
    }

    void load();
    // Live mirror: re-read on every matching save ping. Cleanup closes the channel.
    const unsubscribe = subscribeToSession(sid, () => void load());
    return () => {
      active = false;
      unsubscribe();
    };
  }, [id]);

  // No id, missing session, or still loading → a calm waiting view.
  if (!id || loadState === "notfound" || (loadState === "ready" && !session)) {
    return <Waiting />;
  }
  if (loadState === "loading" || !session) {
    return <Waiting />;
  }

  return <Stage session={session} />;
}

/** Calm placeholder shown until a session is available. */
function Waiting() {
  return (
    <div
      data-persona="ruhig"
      className="flex min-h-dvh items-center justify-center bg-background px-6 text-center"
    >
      <p className="text-muted">Warte auf eine Sitzung …</p>
    </div>
  );
}

/** The live stage content: head + the current phase's shared work surface. */
function Stage({ session }: { session: Session }) {
  const phase = session.progress.phase;
  const phaseDef = PHASES[phase];
  const stepDef = phaseDef.steps[session.progress.step] ?? phaseDef.steps[0];
  const hasClusters = session.phase1.clusters.length > 0;

  return (
    <div
      data-persona="ruhig"
      className="min-h-dvh bg-background text-foreground"
    >
      <main className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">
            {phaseDef.title}
          </p>
          <h1 className="mt-1 font-serif text-2xl text-foreground sm:text-3xl">
            {stepDef.title}
          </h1>
          <p className="mt-1 text-xs text-muted">
            Schritt {session.progress.step + 1} von {phaseDef.steps.length}
          </p>
          {stepDef.intro ? (
            <p className="mt-3 text-muted">{stepDef.intro}</p>
          ) : null}
        </header>

        {phase === 1 ? (
          // Phase 1: the live shared card board (read-only, shared cards only).
          // CardBoard is used directly (not CoachCardBoard, which is store-bound)
          // because the stage holds the session in local state.
          <CardBoard
            cards={stageVisibleCards(session.phase1.cards)}
            onCardsChange={noop}
            clusters={hasClusters ? session.phase1.clusters : undefined}
            onClustersChange={hasClusters ? noop : undefined}
            anchorCard={{ text: session.phase1.istWord }}
            readOnly
          />
        ) : (
          // Other phases: the read-only, shared SessionSummary (it already
          // renders all phase content read-only and never reads coach_only data).
          <SessionSummary session={session} />
        )}
      </main>
    </div>
  );
}
