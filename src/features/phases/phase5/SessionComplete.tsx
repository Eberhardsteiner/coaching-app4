import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Calm session-complete view shown once Phase 5 is finished (the whole 5+1
 * process). Strengthening, no dependency: the path belongs to the user and is
 * repeatable. A summary/PDF is hinted at (built in the next prompt). The session
 * stays intact; "Phase 5 noch einmal ansehen" reopens the steps.
 */
export function SessionComplete({ onReview }: { onReview: () => void }) {
  return (
    <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center py-10 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent"
        aria-hidden
      >
        <Check className="size-7" />
      </div>

      <h2 className="mt-5 font-serif text-2xl text-foreground sm:text-3xl">
        Geschafft — du hast den ganzen Prozess durchlaufen.
      </h2>

      <p className="mt-3 text-muted">
        Dieser Weg gehört dir; du kannst ihn jederzeit wiederholen. Dieser
        Prozess ist erlernbar und wiederholbar — du kannst ihn jederzeit selbst
        wieder gehen.
      </p>

      <p className="mt-6 rounded-lg border border-dashed border-subtle bg-surface p-4 text-sm text-muted">
        Eine Zusammenfassung deiner Sitzung (als PDF) folgt im nächsten Paket.
      </p>

      <Button variant="ghost" size="sm" className="mt-6" onClick={onReview}>
        Phase 5 noch einmal ansehen
      </Button>
    </div>
  );
}
