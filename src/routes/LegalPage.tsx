import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import {
  DisclaimerText,
  ImpressumContent,
  PrivacyText,
} from "@/features/legal/legalContent";
import { SafetyNotice } from "@/features/safety/SafetyNotice";

export type LegalKind = "rechtliches" | "datenschutz" | "impressum";

const TITLES: Record<LegalKind, string> = {
  rechtliches: "Rechtliches & Sicherheit",
  datenschutz: "Datenschutz",
  impressum: "Impressum",
};

/**
 * Shared, shell-less layout for the legal routes. Content comes entirely from
 * the central legalContent module + SafetyNotice, so the same texts can be
 * reused in modals/drawers elsewhere.
 *
 * Why routes (not modals): the legal pages — the Impressum in particular —
 * need stable, deep-linkable, shareable URLs (Impressumspflicht); routes are
 * inherently bookmarkable and accessible. The content module keeps reuse open.
 */
export function LegalPage({ kind }: { kind: LegalKind }) {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Start
        </Link>

        <h1 className="mt-6 font-serif text-3xl text-foreground">
          {TITLES[kind]}
        </h1>

        <div className="mt-8 space-y-6">
          {kind === "rechtliches" ? (
            <>
              <DisclaimerText />
              <SafetyNotice />
            </>
          ) : null}
          {kind === "datenschutz" ? <PrivacyText /> : null}
          {kind === "impressum" ? <ImpressumContent /> : null}
        </div>
      </main>
    </div>
  );
}
