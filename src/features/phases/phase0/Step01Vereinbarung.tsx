import { Feather, Lock, SlidersHorizontal, Sprout } from "lucide-react";

import { StepNav } from "@/features/phases/StepNav";
import type { PhaseNavigation } from "@/features/phases/usePhaseNavigation";
import { useSessionStore } from "@/features/session/sessionStore";

/** The four values this coaching builds on (compact). */
const VALUES = [
  {
    icon: Lock,
    title: "Vertraulichkeit",
    text: "Was hier entsteht, bleibt bei dir; alles wird nur lokal gespeichert.",
  },
  {
    icon: Feather,
    title: "Freiheit",
    text: "Du entscheidest, woran du arbeitest und wie weit du gehst. Nichts wird dir vorgeschrieben.",
  },
  {
    icon: Sprout,
    title: "Ressourcenverfügbarkeit",
    text: "Du bringst alles mit, was du brauchst. Das Coaching macht deine Ressourcen zugänglich.",
  },
  {
    icon: SlidersHorizontal,
    title: "Selbststeuerung",
    text: "Du steuerst den Prozess. Die App begleitet mit Struktur und Fragen.",
  },
];

const PROCESS_OVERVIEW =
  "Ziel ist, von deiner heutigen Situation (IST) über ein selbstgewähltes, attraktives Ziel zu konkreten eigenen Handlungen zu kommen. Dafür gehen wir folgende Phasen: Vereinbarung, IST verstehen, Ziel finden, Ressourcen erkennen, Handlungsplan, Nachhaltigkeit.";

/**
 * Phase 0, Step 0.1 — Vereinbarung. A compact, scannable agreement screen that
 * condenses the former three steps (Ankommen, Werte, Steuerung): a short intro,
 * the four values, who-steers-what and the process overview — gated by the
 * active "Ich verstehe …" confirmation → valuesAck.
 */
export function Step01Vereinbarung({ nav }: { nav: PhaseNavigation }) {
  const valuesAck = useSessionStore(
    (s) => s.session?.phase0.valuesAck ?? false,
  );
  const patch = useSessionStore((s) => s.patch);

  function setValuesAck(value: boolean) {
    patch((s) => ({ ...s, phase0: { ...s.phase0, valuesAck: value } }));
  }

  return (
    <div>
      <div className="space-y-5">
        <p className="text-muted">
          In den nächsten Phasen schaust du strukturiert auf ein eigenes Thema —
          von deiner heutigen Situation über ein selbstgewähltes Ziel zu
          konkreten Schritten. Du bestimmst Tempo und Inhalt.
        </p>

        {/* Die vier Werte */}
        <div className="grid gap-3 sm:grid-cols-2">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-lg border border-subtle bg-surface p-4"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <value.icon className="size-4" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">
                {value.title}
              </p>
              <p className="mt-1 text-sm text-muted">{value.text}</p>
            </div>
          ))}
        </div>

        {/* Wer steuert was */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-subtle bg-surface p-4">
            <p className="text-sm font-medium text-foreground">
              Du steuerst und entscheidest
            </p>
            <p className="mt-1 text-sm text-muted">
              Du wählst dein Thema und deine Ziele und triffst die
              Entscheidungen — du trägst die Ergebnisverantwortung.
            </p>
          </div>
          <div className="rounded-lg border border-subtle bg-surface p-4">
            <p className="text-sm font-medium text-foreground">
              Die App hält die Struktur
            </p>
            <p className="mt-1 text-sm text-muted">
              Sie führt durch die Phasen und stellt Fragen — sie trägt die
              Prozessverantwortung und gibt keine Ratschläge.
            </p>
          </div>
        </div>

        {/* Prozess-Übersicht */}
        <div className="rounded-lg bg-surface-2 p-4">
          <p className="text-sm font-medium text-foreground">
            So verläuft der Weg
          </p>
          <p className="mt-1 text-sm text-muted">{PROCESS_OVERVIEW}</p>
        </div>

        {/* Bestätigung → valuesAck */}
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-subtle bg-surface p-3 transition-colors hover:bg-surface-2">
          <input
            type="checkbox"
            checked={valuesAck}
            onChange={(event) => setValuesAck(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-accent"
          />
          <span className="text-sm text-foreground">
            Ich verstehe das Coachingverständnis und stimme zu.
          </span>
        </label>
      </div>

      <StepNav
        onBack={nav.goPrevStep}
        canBack={nav.canGoBack}
        onNext={nav.advance}
        canNext={valuesAck}
      />
    </div>
  );
}
