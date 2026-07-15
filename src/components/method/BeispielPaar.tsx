import { ArrowRight, Check, X } from "lucide-react";

/**
 * Visual-Baukasten (VIS-2): das ✗/✓-Beispielmuster für Formulierungs-
 * Coachings — „so nicht" → Pfeil → „so ja", je mit kurzer Begründung
 * (verallgemeinert aus dem 1.4-Vorher/Nachher-Paar). Rot/Grün kommen aus den
 * Token-Ramps; mobil stapeln die Karten, der Pfeil dreht sich mit.
 */
export function BeispielPaar({
  bad,
  badWhy,
  good,
  goodWhy,
}: {
  /** The "not like this" example (quoted text). */
  bad: string;
  /** Short reason why it fails (a few words). */
  badWhy: string;
  /** The "like this" example (quoted text). */
  good: string;
  /** Short reason why it works (a few words). */
  goodWhy: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex-1 rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="flex items-start gap-1.5 text-sm font-medium text-red-700">
          <X className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="min-w-0">{bad}</span>
        </p>
        <p className="mt-0.5 pl-5 text-xs text-red-700/80">{badWhy}</p>
      </div>
      <ArrowRight
        className="mx-auto size-4 shrink-0 rotate-90 text-faint sm:rotate-0"
        aria-hidden
      />
      <div className="flex-1 rounded-lg border border-green-200 bg-green-50 p-3">
        <p className="flex items-start gap-1.5 text-sm font-medium text-green-800">
          <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="min-w-0">{good}</span>
        </p>
        <p className="mt-0.5 pl-5 text-xs text-green-800/80">{goodWhy}</p>
      </div>
    </div>
  );
}
