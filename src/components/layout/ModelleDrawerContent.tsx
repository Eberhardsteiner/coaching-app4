import { useRessourcenModelle } from "@/features/content/ressourcenModelle";
import { RessourcenModellListe } from "@/features/phases/phase3/RessourcenModellListe";

/**
 * Schublade „Modelle“ (E3): dieselbe Modellliste wie in 3.6, aus
 * public/content/ressourcen-modelle.json.
 */
export function ModelleDrawerContent() {
  const loaded = useRessourcenModelle();
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Die Modelle aus Schritt 3.6 „Ressourcen aus Modellen“ mit ihren
        Ressourcen.
      </p>
      <RessourcenModellListe loaded={loaded} />
    </div>
  );
}
