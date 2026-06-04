import { ArrowRight, Compass, MessagesSquare } from "lucide-react";
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
 * Branch selection (placeholder). Two equal cards; selecting one navigates to
 * /session?branch=coached | self. Legal texts follow in WP2. No app shell here.
 */
export function BranchSelectPage() {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
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
                  <Icon className="size-5" />
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
      </main>
    </div>
  );
}
