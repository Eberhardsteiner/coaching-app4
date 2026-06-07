import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";
import {
  DisclaimerText,
  PrivacyNoticeText,
} from "@/features/legal/legalContent";
import { SafetyNotice } from "@/features/safety/SafetyNotice";
import { useSessionStore } from "@/features/session/sessionStore";

/** The four active confirmations. None pre-checked. */
const CONSENT_ITEMS = [
  {
    id: "noTherapy",
    text: "Mir ist bewusst, dass dies kein Ersatz für ärztliche/psychotherapeutische Hilfe ist.",
  },
  {
    id: "ownResponsibility",
    text: "Ich treffe meine Entscheidungen eigenverantwortlich.",
  },
  {
    id: "noPersonalData",
    text: "Ich gebe keine personenbezogenen Daten (Klarnamen, identifizierende Details) ein.",
  },
  {
    id: "privacyUnderstood",
    text: "Ich habe den Datenschutz-Hinweis verstanden (meine Daten bleiben lokal).",
  },
] as const;

/**
 * Consent / safety gate. Rendered by SessionRoute INSTEAD of the AppShell while
 * the active session has phase0.consentAck === false — so there is no access to
 * the shell, drawers or export before agreeing. On confirm it sets consentAck +
 * dataPrivacyAck via the store (autosaved); SessionRoute then shows the shell.
 *
 * valuesAck and the coachability questions are intentionally NOT set here — they
 * belong to Phase 0 (WP3).
 */
export function ConsentGate() {
  const session = useSessionStore((s) => s.session);
  const patch = useSessionStore((s) => s.patch);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the heading when the gate appears (screen-reader context).
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (!session) return null; // SessionRoute guarantees a ready session.

  const isSelf = session.meta.branch === "self";
  const allChecked = CONSENT_ITEMS.every((item) => checked[item.id]);

  function confirm() {
    patch((s) => ({
      ...s,
      phase0: { ...s.phase0, consentAck: true, dataPrivacyAck: true },
    }));
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Minimal head: wordmark + a quiet way back. */}
      <header className="border-b border-subtle">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <span className="font-serif text-lg tracking-wide text-foreground">
            {BRANDING.appName}
          </span>
          <Link
            to="/start"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Zurück zur Auswahl
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-serif text-3xl text-foreground focus:outline-none"
        >
          Bevor du startest
        </h1>
        <p className="mt-3 text-muted">
          Kurz zur Einordnung — dann kann es losgehen.
        </p>

        <div className="mt-8 space-y-6">
          <DisclaimerText />

          <div className="rounded-xl border border-subtle bg-surface-2 p-4">
            <PrivacyNoticeText />
          </div>

          {isSelf ? <SafetyNotice /> : null}

          <fieldset className="space-y-3">
            <legend className="sr-only">Bestätigungen</legend>
            {CONSENT_ITEMS.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-subtle bg-surface p-3 transition-colors hover:bg-surface-2"
              >
                <input
                  type="checkbox"
                  checked={Boolean(checked[item.id])}
                  onChange={(event) =>
                    setChecked((prev) => ({
                      ...prev,
                      [item.id]: event.target.checked,
                    }))
                  }
                  className="mt-0.5 size-4 shrink-0 accent-accent"
                />
                <span className="text-sm text-foreground">{item.text}</span>
              </label>
            ))}
          </fieldset>

          <div>
            <Button size="lg" disabled={!allChecked} onClick={confirm}>
              Beginnen
            </Button>
            {!allChecked ? (
              <p className="mt-2 text-xs text-faint">
                Bitte bestätige alle Punkte, um zu beginnen.
              </p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
