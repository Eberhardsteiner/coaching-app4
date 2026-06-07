import { LifeBuoy } from "lucide-react";

import { MedicalNoticeText } from "@/features/legal/legalContent";
import { cn } from "@/lib/utils";

type SafetyNoticeProps = {
  className?: string;
};

/**
 * Reusable "Hilfe & Sicherheit" element: the medical/psychotherapy notice.
 * Embedded on the legal page, the help drawer and the consent gate. Concrete
 * emergency numbers are intentionally not shown here — the protective hint
 * (seek help in a crisis) lives in MedicalNoticeText.
 */
export function SafetyNotice({ className }: SafetyNoticeProps) {
  return (
    <section
      aria-labelledby="safety-notice-title"
      className={cn(
        "rounded-xl border border-subtle bg-surface p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <LifeBuoy className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <div className="space-y-3">
          <h3 id="safety-notice-title" className="font-medium text-foreground">
            Hilfe & Sicherheit
          </h3>

          <MedicalNoticeText />
        </div>
      </div>
    </section>
  );
}
