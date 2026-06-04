import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type StepNavProps = {
  onBack: () => void;
  canBack: boolean;
  onNext: () => void;
  canNext: boolean;
  nextLabel?: string;
};

/** Shared Zurück / Weiter navigation bar for a phase step. */
export function StepNav({
  onBack,
  canBack,
  onNext,
  canNext,
  nextLabel = "Weiter",
}: StepNavProps) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t border-subtle pt-5">
      <Button variant="ghost" onClick={onBack} disabled={!canBack}>
        <ArrowLeft />
        Zurück
      </Button>
      <Button onClick={onNext} disabled={!canNext}>
        {nextLabel}
        <ArrowRight />
      </Button>
    </div>
  );
}
