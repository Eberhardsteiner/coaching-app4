import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Clock,
  Compass,
  Heart,
  HeartHandshake,
  PenLine,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";
import { INTRO_SEEN_KEY } from "@/config/constants";
import { METHOD_LABELS } from "@/config/method";
import { setKvFlag } from "@/features/session/sessionRepository";

/** Intro, condensed to two sentences (MP1-REV). */
const INTRO = `Unsere ${METHOD_LABELS.standardShort}-Coaching-App macht dir dein Selbstcoaching so leicht und erfolgreich wie möglich. Ein paar Dinge braucht es dennoch von dir — so bereitest du dich am besten vor:`;

/**
 * A preparation tip: keyword label + one core sentence visible; further
 * detail collapsible (MP1-REV — nothing lost, just off the surface).
 */
type Tip = { icon: LucideIcon; label: string; core: string; details?: string };

/** The six preparation tips, condensed (meaning complete). */
const TIPS: Tip[] = [
  {
    icon: Compass,
    label: "Veränderungswille",
    core: "Willst du dich wirklich verändern — und bezieht dein Wunsch dich selbst mit ein?",
    details:
      "Nur wer sich selbst ändert, kann an der eigenen Situation etwas verändern.",
  },
  {
    icon: Clock,
    label: "Ruhe & Zeit",
    core: "Sorge für Ruhe, ungestörtes Arbeiten und nimm dir Zeit.",
  },
  {
    icon: PenLine,
    label: "Aufschreiben",
    core: "Die Methode lebt vom Aufschreiben — was du nicht aufschreibst, kannst du nicht bearbeiten.",
    details:
      "Kümmere dich nicht um Rechtschreibung oder den perfekten Ausdruck — du musst nur selbst verstehen, was du aufschreibst.",
  },
  {
    icon: Heart,
    label: "Ehrlichkeit",
    core: "Sei ehrlich zu dir selbst — was du dir nicht eingestehst, kannst du nicht reflektieren.",
  },
  {
    icon: ShieldCheck,
    label: "Vertraue dem Prozess",
    core: "Die Vorgehensweise ist tausendfach erprobt — halte den Prozess ein.",
    details:
      "Sie steht für qualitativ hochwertige Ergebnisse, die nur eintreten können, wenn der Prozess eingehalten wird.",
  },
  {
    icon: HeartHandshake,
    label: "Hilfe annehmen",
    core: "Kommst du nicht weiter, lass dich von einem menschlichen Coach unterstützen.",
    details: `Wir arbeiten mit einem Netzwerk aus nach ${METHOD_LABELS.standardShort}-Standard ausgebildeten Coaches zusammen, die dir analog oder digital weiterhelfen. Einen Coach deiner Wahl gibt es sicher auch in deiner Nähe.`,
  },
];

/**
 * /anforderungen — shell-free, persona "Ruhig". Third orientation page (after the
 * values page): what a successful self-coaching asks of you — preparation tips.
 * Self-coaching specific; the coached branch never reaches it. This is the END of
 * the three-page intro chain (/einfuehrung → /grundwerte → /anforderungen →
 * session), so "Los geht's" marks the chain seen (introSeen) and starts the
 * session; "Zurück" goes back to /grundwerte. No pink (no IST reference here).
 */
export function AnforderungenView() {
  const navigate = useNavigate();

  /** Finish the intro chain → mark seen + go to the session. */
  function start() {
    void setKvFlag(INTRO_SEEN_KEY, true);
    navigate("/session");
  }

  return (
    <div
      data-persona="ruhig"
      className="min-h-dvh bg-background text-foreground"
    >
      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-faint">
            {BRANDING.methodLabel}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">
            Was erfordert ein erfolgreiches Selbstcoaching von mir?
          </h1>
          <p className="mt-4 max-w-2xl text-muted">{INTRO}</p>
        </header>

        <ul className="mt-10 grid gap-4 lg:grid-cols-2">
          {TIPS.map((tip) => (
            <li
              key={tip.label}
              className="rounded-xl border border-subtle bg-surface p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <tip.icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground">
                    {tip.label}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {tip.core}
                  </p>
                  {tip.details ? (
                    <details className="group mt-1.5">
                      <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-accent">
                        <ChevronDown
                          className="size-3.5 motion-safe:transition-transform group-open:rotate-180"
                          aria-hidden
                        />
                        Mehr dazu
                      </summary>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {tip.details}
                      </p>
                    </details>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-subtle pt-6">
          <Button variant="ghost" onClick={() => navigate("/grundwerte")}>
            <ArrowLeft />
            Zurück
          </Button>
          <Button onClick={start} aria-label="Los geht's — zur Sitzung">
            Los geht’s
            <ArrowRight />
          </Button>
        </footer>
      </main>
    </div>
  );
}
