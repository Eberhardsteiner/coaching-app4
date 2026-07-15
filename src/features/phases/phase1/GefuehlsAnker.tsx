import { CloudSymbol } from "@/components/icons/PhaseSymbols";
import { useSessionStore } from "@/features/session/sessionStore";

/**
 * Compact anchor chip for the chosen starting feeling (MP1-REV, Paket E):
 * keeps the "one word" from 1.1 visibly present through steps 1.2–1.4 —
 * storm-cloud symbol + the word in the rosa IST accent. Renders nothing
 * until a feeling exists. Read-only (the word is edited in 1.1 / on the
 * board's anchor card).
 */
export function GefuehlsAnker() {
  const istWord = useSessionStore((s) => s.session?.phase1.istWord ?? "");
  const word = istWord.trim();
  if (!word) return null;

  return (
    <p className="inline-flex items-center gap-1.5 rounded-full border border-ist/30 bg-ist/5 py-1 pl-2 pr-3 text-sm font-medium text-ist">
      <CloudSymbol className="size-4" />
      {/* aria-label ist auf role=paragraph unzulässig — sr-only-Prefix statt-
          dessen, damit Screenreader das Wort nicht kontextlos vorlesen. */}
      <span className="sr-only">Dein Ausgangsgefühl: </span>
      {word}
    </p>
  );
}
