import {
  ArrowLeft,
  ArrowRight,
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

/**
 * Intro paragraph (verbatim). The method label is bundled in METHOD_LABELS; the
 * app self-reference stays name-free ("…-Coaching-App" / "…-App" descriptors).
 */
const INTRO = `Unsere ${METHOD_LABELS.standardShort}-Coaching-App hat sich zur Aufgabe gemacht, dir dein Selbstcoaching so leicht und so erfolgreich wie nur möglich zu machen. Und dennoch: Ein erfolgreiches Selbstcoaching mit unserer ${METHOD_LABELS.standardShort}-App stellt an dich einige Anforderungen. Hier ein paar Hinweise und Tipps, wie du dich am besten darauf vorbereiten kannst:`;

/** A preparation tip: a scannable keyword label + the verbatim text. */
type Tip = { icon: LucideIcon; label: string; text: string };

/**
 * The six preparation tips. `text` is verbatim; `label` is a purely presentational
 * keyword (a scannable heading over the unchanged original text).
 */
const TIPS: Tip[] = [
  {
    icon: Compass,
    label: "Veränderungswille",
    text: "Beantworte dir ehrlich: Willst du dich wirklich verändern? Du hast einen Veränderungswunsch, aber bezieht er dich mit ein? Nur wer sich selbst ändert, kann an der eigenen Situation etwas verändern.",
  },
  {
    icon: Clock,
    label: "Ruhe & Zeit",
    text: "Sorge für Ruhe, ungestörtes Arbeiten und nimm dir Zeit.",
  },
  {
    icon: PenLine,
    label: "Aufschreiben",
    text: "Die Methode beruht darauf, dass du sehr viel aufschreibst. Bitte lass dich darauf ein, denn was du nicht aufschreibst, kannst du innerhalb der Methode nicht bearbeiten. Kümmere dich nicht um Rechtschreibung oder den perfekten Ausdruck — du musst verstehen, was du aufschreibst.",
  },
  {
    icon: Heart,
    label: "Ehrlichkeit",
    text: "Sei bitte ehrlich zu dir selbst. Was du dir nicht eingestehst, kannst du auch nicht reflektieren.",
  },
  {
    icon: ShieldCheck,
    label: "Vertraue dem Prozess",
    text: "Vertraue der Vorgehensweise. Sie ist tausendfach erprobt und steht für qualitativ hochwertige Ergebnisse, die nur eintreten können, wenn der Prozess eingehalten wird.",
  },
  {
    icon: HeartHandshake,
    label: "Hilfe annehmen",
    text: `Zögere nicht, dich von einem menschlichen Coach unterstützen zu lassen, wenn du merkst, du kommst nicht weiter. Wir arbeiten mit einem Netzwerk aus nach ${METHOD_LABELS.standardShort}-Standard ausgebildeten Coaches zusammen, die dir analog oder digital weiterhelfen können. Einen Coach deiner Wahl gibt es sicher auch in deiner Nähe.`,
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
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <tip.icon className="size-4" aria-hidden />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-foreground">
                {tip.label}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {tip.text}
              </p>
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
