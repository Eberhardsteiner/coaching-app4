import { modellZeile, type SmcModell } from "@/features/content/smcModelle";
import {
  SORTABLE_RESOURCE_LABEL,
  collectSortableResources,
  isRatedField,
  ratingOf,
} from "@/features/phases/phase3/resourceFields";
import type { Card, Cluster, Phase3 } from "@/features/session/types";

export interface ModellPromptInput {
  istWord: string;
  clusters: Cluster[];
  cards: Card[];
  goalText: string;
  vision: string;
  phase3: Phase3 | undefined;
  /** Die Modelle aus den `prompt_bereiche` des Katalogs. */
  modelle: SmcModell[];
}

/**
 * Ist-Situation: Ausgangsgefühl, Cluster mit Wert und Karten, dazu Karten
 * ohne (vorhandenes) Cluster, wie sie auch „Ist-Situation anzeigen“ zeigt.
 */
function istBlock({ istWord, clusters, cards }: ModellPromptInput): string {
  const zeilen = [
    `Ausgangsgefühl: «${istWord.trim() || "noch nicht benannt"}»`,
  ];
  const sortiert = [...clusters].sort(
    (a, b) =>
      Number(b.isCore ?? false) - Number(a.isCore ?? false) ||
      (b.weight ?? 0) - (a.weight ?? 0),
  );
  if (sortiert.length === 0) {
    zeilen.push("Cluster: noch keine gebildet");
  } else {
    zeilen.push(
      "Cluster, bewertet von 1 bis 10 (10 = hier drückt der Schuh am meisten, das höchstbewertete Cluster ist mein Kernthema):",
    );
    sortiert.forEach((cluster, index) => {
      const name = cluster.name.trim() || `Cluster ${index + 1}`;
      const wert = [
        cluster.weight != null ? `Wert ${cluster.weight}` : "ohne Wert",
        cluster.isCore ? "Kernthema" : "",
      ]
        .filter(Boolean)
        .join(", ");
      const karten = cards
        .filter((c) => c.clusterId === cluster.id)
        .map((c) => c.text.trim())
        .filter(Boolean);
      zeilen.push(
        `- ${name} (${wert})${karten.length > 0 ? `: ${karten.join(", ")}` : ""}`,
      );
    });
  }
  const clusterIds = new Set(clusters.map((c) => c.id));
  const ohneCluster = cards
    .filter((c) => !c.clusterId || !clusterIds.has(c.clusterId))
    .map((c) => c.text.trim())
    .filter(Boolean);
  if (ohneCluster.length > 0) {
    zeilen.push(`- Karten ohne Cluster: ${ohneCluster.join(", ")}`);
  }
  return zeilen.join("\n");
}

function wertung(helpful: boolean, hindering: boolean): string {
  if (helpful && hindering) return " (hilfreich und hinderlich)";
  if (helpful) return " (hilfreich)";
  if (hindering) return " (hinderlich)";
  return "";
}

/**
 * Bisher gewählte Ressourcen aus Phase 3, je Bereich eine Zeile mit Wertung.
 * Die Einträge dieses Schritts (hypotheses) gehören nicht dazu.
 */
function ressourcenBlock(phase3: Phase3 | undefined): string {
  if (!phase3) return "noch keine";
  const gruppen = new Map<string, string[]>();
  for (const { field, item } of collectSortableResources(phase3)) {
    if (field === "hypotheses") continue;
    const text = item.text.trim();
    if (!text) continue;
    const r = isRatedField(field)
      ? ratingOf(item)
      : { helpful: false, hindering: false };
    const label = SORTABLE_RESOURCE_LABEL[field];
    gruppen.set(label, [
      ...(gruppen.get(label) ?? []),
      `${text}${wertung(r.helpful, r.hindering)}`,
    ]);
  }
  if (gruppen.size === 0) return "noch keine";
  return [...gruppen]
    .map(([label, eintraege]) => `- ${label}: ${eintraege.join(", ")}`)
    .join("\n");
}

/**
 * Der kopierbare Prompt für 3.6 „Ressourcen aus Modellen“. Die App ruft keine
 * KI auf, der Nutzer kopiert den Text selbst. Die KI darf ausschließlich die
 * Modelle aus dem Katalog verwenden (Bereiche aus `prompt_bereiche`), höchstens
 * fünf. Das Antwortformat passt zu den Eingabefeldern der Erfassungsliste:
 * „Modell“ → Feld „Modellname“, „Ressource“ → Feld „Erkenntnis / Ressource“.
 */
export function buildModellPrompt(input: ModellPromptInput): string {
  const goal = input.goalText.trim() || "noch offen";
  const vision = input.vision.trim();
  const modellListe = input.modelle
    .map((m) => `- ${modellZeile(m)}`)
    .join("\n");

  return [
    "Ich arbeite in einem Selbstcoaching an einem persönlichen Ziel und suche wissenschaftliche Modelle als neue Perspektive auf meine Ressourcen.",
    "",
    "MEINE IST-SITUATION",
    istBlock(input),
    "",
    "MEIN ZIEL",
    `Zielsatz: «${goal}»`,
    ...(vision ? [`Vorstellung des Zielzustands: «${vision}»`] : []),
    "",
    "MEINE BISHER GEWÄHLTEN RESSOURCEN",
    ressourcenBlock(input.phase3),
    "",
    "MODELLLISTE (je Zeile ein Modell: zuerst der Name, danach in Klammern seine Elemente)",
    modellListe,
    "",
    "REGELN",
    "- Verwende ausschließlich Modelle aus der Modellliste. Schlage kein Modell vor, das nicht in der Liste steht, auch kein ähnliches oder allgemein bekanntes.",
    "- Nenne jedes Modell genau mit dem Namen aus der Liste.",
    "- Wähle höchstens fünf Modelle, die zu meiner Situation und zu meinem Ziel passen.",
    "- Gib zu jedem gewählten Modell an: welches Element oder welche Elemente aus der Liste betroffen sind, einen Impuls in zwei bis drei Sätzen, eine Frage an mich und eine mögliche Ressource, die sich aus dem Modell ergibt.",
    "- Wenn kein Modell aus der Liste passt, sage das ausdrücklich.",
    "- Deute meine Person nicht und gib mir keine Ratschläge.",
    "- Antworte auf Deutsch und sprich mich mit „du“ an.",
    "",
    "ANTWORTFORMAT",
    "Schreib je gewähltem Modell einen Block genau in diesem Aufbau. Die Zeilen „Modell“ und „Ressource“ übertrage ich in die Felder meiner App.",
    "Modell: (Name genau wie in der Modellliste)",
    "Elemente: (betroffene Elemente aus der Liste)",
    "Impuls: (zwei bis drei Sätze)",
    "Frage: (eine Frage an mich)",
    "Ressource: (eine mögliche Ressource in wenigen Worten)",
  ].join("\n");
}
