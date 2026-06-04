import { LifeBuoy } from "lucide-react";

import { DEFAULT_REGION, getHelpResources } from "@/config/helpResources";
import type { HelpRegion } from "@/config/helpResources";
import { MedicalNoticeText } from "@/features/legal/legalContent";
import { cn } from "@/lib/utils";

type SafetyNoticeProps = {
  region?: HelpRegion;
  className?: string;
};

/**
 * Reusable "Hilfe & Sicherheit" element: the medical/psychotherapy notice plus
 * configurable emergency references. Built to be embedded on the legal page,
 * and later in the help drawer and the consent gate (Prompt 2).
 */
export function SafetyNotice({
  region = DEFAULT_REGION,
  className,
}: SafetyNoticeProps) {
  const help = getHelpResources(region);

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

          <div className="rounded-lg bg-surface-2 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-faint">
              Im Notfall
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              <li>
                <span className="font-medium text-foreground">
                  {help.emergency.label}:
                </span>{" "}
                {help.emergency.href ? (
                  <a
                    className="text-accent underline-offset-4 hover:underline"
                    href={help.emergency.href}
                  >
                    {help.emergency.value}
                  </a>
                ) : (
                  help.emergency.value
                )}
              </li>
              {help.crisisLines.map((line) => (
                <li key={line.value}>
                  <span className="font-medium text-foreground">
                    {line.label}:
                  </span>{" "}
                  {line.href ? (
                    <a
                      className="text-accent underline-offset-4 hover:underline"
                      href={line.href}
                    >
                      {line.value}
                    </a>
                  ) : (
                    line.value
                  )}
                  {line.note ? (
                    <span className="text-faint"> — {line.note}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
