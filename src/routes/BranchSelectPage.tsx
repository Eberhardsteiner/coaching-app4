import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Compass,
  MessagesSquare,
  Shield,
} from "lucide-react";
import { Link } from "react-router";

import { BRANDING } from "@/config/branding";
import {
  BRANCH_DESCRIPTIONS,
  BRANCH_LABELS,
  COACHING_BRANCHES,
  type CoachingBranch,
} from "@/config/constants";
import { cn } from "@/lib/utils";

const BRANCH_ICONS: Record<CoachingBranch, typeof Compass> = {
  coached: MessagesSquare,
  self: Compass,
};

/**
 * Branch selection. Two equal cards (coached / self) with descriptions, an
 * accessible "Was ist der Unterschied?" disclosure and an always-visible link
 * to the legal & safety content. Selecting a card creates the session as before
 * (/session?branch=…). No app shell.
 */
export function BranchSelectPage() {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Start
        </Link>

        <p className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-muted">
          {BRANDING.methodLabel}
        </p>
        <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
          Wie möchtest du arbeiten?
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Beide Wege führen durch denselben Prozess. Die Wahl lässt sich später
          ändern.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {COACHING_BRANCHES.map((branch) => {
            const Icon = BRANCH_ICONS[branch];
            return (
              <Link
                key={branch}
                to={`/session?branch=${branch}`}
                className={cn(
                  "group flex flex-col rounded-xl border border-subtle bg-surface p-6 transition-colors",
                  "hover:border-accent/40 hover:bg-surface-2",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {BRANCH_LABELS[branch]}
                </h2>
                <p className="mt-2 flex-1 text-sm text-muted">
                  {BRANCH_DESCRIPTIONS[branch]}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Auswählen
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Accessible disclosure: what's the difference? */}
        <details className="group mt-8 rounded-xl border border-subtle bg-surface">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
            Was ist der Unterschied?
            <ChevronDown
              className="size-4 shrink-0 text-muted motion-safe:transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="border-t border-subtle px-5 py-4 text-sm leading-relaxed text-muted">
            <p>
              Beim begleiteten Coaching hält ein Mensch den Prozess: Eine
              ausgebildete Person ist per Videogespräch dabei, stellt Fragen und
              sorgt für Sicherheit — du entscheidest über Inhalte und Tempo.
              Beim Selbstcoaching führt die App dich allein durch dieselben
              Phasen, ergänzt um Erklärtexte, kurze Videos und KI-Impulse an
              passenden Stellen. Selbstcoaching eignet sich für klar umrissene
              Anliegen; bei belastenden oder gesundheitlich relevanten Themen
              ist die menschliche Begleitung der bessere Weg.
            </p>
          </div>
        </details>

        {/* Always-visible pointer to legal & safety content */}
        <div className="mt-8">
          <Link
            to="/rechtliches"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <Shield className="size-4" aria-hidden />
            Rechtliches &amp; Sicherheit
          </Link>
        </div>
      </main>
    </div>
  );
}
