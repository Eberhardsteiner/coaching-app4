import type { PhaseId } from "@/features/session/types";

/** A single step within a phase. */
export interface PhaseStepDef {
  /** Stable id (e.g. "0.1") — for debug/analytics, not shown raw. */
  id: string;
  title: string;
  /** Short anmoderation shown in the step header. */
  intro?: string;
  /**
   * G2: Kurz-Hilfe für die Hilfe-Schublade („Hilfe zu diesem Schritt“):
   * was hier zu tun ist und wie es bedient wird.
   */
  help?: string;
}

/** One phase of the 5+1 process. */
export interface PhaseDef {
  id: PhaseId;
  title: string;
  short: string;
  steps: PhaseStepDef[];
}

/**
 * Central phase configuration — all phases are fully built: Phase 0
 * (Vereinbarung, 2 steps), Phase 1 (IST, 5 steps), Phase 2 (Ziel, 5 steps),
 * Phase 3 (Ressourcen, 10 steps — MP3), Phase 4 (Handlungsplan, 4 steps —
 * MP4) and Phase 5 (Nachhaltigkeit, 3 steps). Completing Phase 5 finishes the
 * process.
 * Old sessions saved mid-phase before a step-count change are clamped in
 * usePhaseNavigation (stepIndex never exceeds the current step count).
 */
export const PHASES: PhaseDef[] = [
  {
    id: 0,
    title: "Vereinbarung",
    short: "Werte, Rollen und dein Thema klären.",
    steps: [
      {
        id: "0.1",
        title: "Vereinbarung",
        intro: "Werte, Rollen und der grobe Weg — kurz bestätigt.",
        help: "Lies, wie das Coaching gedacht ist und welche Werte es trägt. Setz dann den Haken bei „Ich verstehe das Coachingverständnis und stimme zu“, erst danach geht es weiter.",
      },
      {
        id: "0.2",
        title: "Dein Thema",
        intro: "Skizziere dein Thema kurz — ein paar Fakten genügen.",
        help: "Beschreib dein Thema in ein paar Sätzen, die Fragen im Kasten helfen dir dabei. Details kommen erst in den nächsten Phasen.",
      },
    ],
  },
  {
    id: 1,
    title: "IST verstehen",
    short: "Die heutige Situation sichtbar machen.",
    steps: [
      {
        id: "1.1",
        title: "Gefühl benennen",
        intro: "Ein einziges Wort für deinen IST-Zustand.",
        help: "Schreib dein Gefühl in das Feld „Was ist dein Gefühl?“. Fällt dir kein Wort ein, klapp die Liste auf und tippe ein oder zwei Gefühle an. Darunter schätzt du ein, wie sehr dich die Situation gerade belastet.",
      },
      {
        id: "1.2",
        title: "Zusammenhänge sammeln",
        intro: "Was hängt alles mit deinem IST-Zustand zusammen?",
        help: "Leg für alles, was mit deinem Gefühl zusammenhängt, eine eigene Karte an. Die Kartenfarbe zeigt die Bedeutung, die Legende erklärt sie. Über „Schritt für Schritt“ gehst du die Leitfragen einzeln durch.",
      },
      {
        id: "1.3",
        title: "Perspektive wechseln",
        intro: "Den Blick mit einem Modell weiten.",
        help: "Wähle eines der vier Modelle und geh seine Begriffe durch. Passt ein Begriff zu deiner Situation, legst du ihn mit „Übernehmen“ als Karte auf dein Board. Du kannst auch ohne Modell weitergehen.",
      },
      {
        id: "1.4",
        title: "Clustern & gewichten",
        intro:
          "Verwandte Karten bündeln, gewichten und das Kernthema bestimmen.",
        help: "Leg bis zu fünf Cluster an und ordne ihnen deine Karten zu, per Ziehen oder über die Auswahl an der Karte. Passt eine Karte in zwei Cluster, kopierst du sie mit dem Kopier-Symbol. Zum Schluss bewertest du die Cluster auf der Skala, der Wert 10 markiert dein Kernthema.",
      },
      {
        id: "1.5",
        title: "Abschluss & Check",
        intro: "Kurz festhalten, was du aus dieser Phase mitnimmst.",
        help: "Halte in den vier Feldern fest, was du aus Phase 1 mitnimmst. Alle Felder sind freiwillig. Mit „Phase abschließen“ geht es zu Phase 2.",
      },
    ],
  },
  {
    id: 2,
    title: "Ziel finden",
    short: "Ein attraktives, selbstgewähltes Ziel.",
    steps: [
      {
        id: "2.1",
        title: "Was strebe ich an?",
        intro:
          "Stell dir vor, es geht dir richtig gut — beschreibe den Zustand, nicht den Weg.",
        help: "Stell dir vor, dein Ziel ist erreicht, und schreib frei auf, wie es dir dann geht. Danach suchst du die Gefühlswörter in deinem Text und benennst das Gefühl, das du fühlen willst. Die Liste zum Aufklappen hilft, wenn dir kein Wort einfällt.",
      },
      {
        id: "2.2",
        title: "Mein Zielsatz",
        intro: "Dein Ziel als ein Satz — wie ein Mantra, im Futur II.",
        help: "Setz deinen Zielsatz aus den Bausteinen zusammen: Satzanfang, Datum, Rolle, Gefühl und worauf sich dein Ziel bezieht. Den fertigen Satz kannst du darunter frei ändern. Beim ersten „Weiter“ fragt die App, ob sich dein Ziel auf dein am höchsten bewertetes Cluster bezieht.",
      },
      {
        id: "2.3",
        title: "Zielprüfung",
        intro: "Sechs Qualitätskriterien — und der 10/10-Check.",
        help: "Prüfe deinen Zielsatz an sechs Kriterien. Die ersten beiden bewertest du auf einer Skala von 1 bis 10, die übrigen hakst du ab, wenn sie erfüllt sind. „Worauf achten?“ erklärt jedes Kriterium.",
      },
      {
        id: "2.4",
        title: "Folgen meines Ziels",
        intro: "Rückenwind oder Gegenwind? Geh durch alle deine Cluster.",
        help: "Geh deine Cluster nacheinander durch. Beschreib je Cluster eine Handlung, an der es erkennt, dass du dein Ziel erreicht hast, und bewerte, wie es das findet. Passt dein Ziel danach nicht mehr, änderst du es über „Ziel anpassen“.",
      },
      {
        id: "2.5",
        title: "Abschluss & Check",
        intro: "Kurz festhalten, was du aus dieser Phase mitnimmst.",
        help: "Halte in den vier Feldern fest, was du aus Phase 2 mitnimmst. Alle Felder sind freiwillig, „Phase abschließen“ führt dich zu Phase 3.",
      },
    ],
  },
  {
    id: 3,
    title: "Ressourcen erkennen",
    short: "Was du schon mitbringst.",
    steps: [
      {
        id: "3.1",
        title: "Orientierung: Ressourcen & Cockpit",
        intro:
          "Das Kompetenzmodell als Landkarte — und dein Cockpit, das sich füllt.",
        help: "Das Kompetenzmodell zeigt dir, wo deine Ressourcen liegen. Tippe eine Schicht an, um ihre Beschreibung zu lesen. Dein Ressourcen-Cockpit füllt sich in den nächsten Schritten, du öffnest es über „Cockpit ansehen“.",
      },
      {
        id: "3.2",
        title: "Meine Intelligenzen",
        intro: "Deine Begabungen — und ob sie dir Richtung Ziel helfen.",
        help: "Lies die Beschreibungen der Intelligenzen und übernimm, was auf dich zutrifft. Mit den Schaltern hilfreich und hinderlich bewertest du jeden Eintrag, auch beide zugleich sind möglich. Im Notizfeld hältst du kurz fest, warum.",
      },
      {
        id: "3.3",
        title: "Motive & Persönlichkeitseigenschaften",
        intro: "Was dich antreibt und ausmacht — gewertet am Ziel.",
        help: "Nimm deine EPP-Ergebnisse zur Hand, falls du den Test gemacht hast. Übernimm deine starken Motive und Persönlichkeitseigenschaften und bewerte sie wie in 3.2. Eigene Begriffe ergänzt du unter der jeweiligen Liste.",
      },
      {
        id: "3.4",
        title: "Meine Werte",
        intro: "Als Mensch, in deiner Funktion, für dein Ziel — je max. fünf.",
        help: "Trag deine Werte in die Spalten ein, höchstens fünf je Spalte. Über „Wichtig als“ ordnest du einen Wert weiteren Spalten zu. Werte für dein Ziel sind als zielförderlich vorbelegt, beide Schalter bleiben frei wählbar.",
      },
      {
        id: "3.5",
        title: "Werte der Anderen",
        intro: "Was deine systemischen Mitspieler wichtig nehmen — je Cluster.",
        help: "Geh deine Cluster durch und überlege, welche Personen dort vorkommen und was ihnen wichtig ist. Passt ein Cluster nicht, etwa ein Ich-Cluster, tippst du „Überspringen“. Unten vergleichst du deine Werte mit denen der anderen.",
      },
      {
        id: "3.6",
        title: "Ressourcen aus Modellen",
        intro: "Die Vogelperspektive: wissenschaftliche Modelle als Impuls.",
        help: "Tippe die Modelle an, um sie kennenzulernen, und prüfe sie mit den vier Leitfragen. Im Selbstcoaching kopierst du den Prompt in ein KI-Tool deiner Wahl, er nennt nur die Modelle dieser Liste. Deine Erkenntnisse trägst du unten ein und bewertest sie.",
      },
      {
        id: "3.7",
        title: "Biografie & Umfeld",
        intro: "Gemeisterte Situationen und äußere Ressourcen sammeln.",
        help: "Sammle Situationen, die du gemeistert hast, und frag dich, was dir dabei von innen und von außen geholfen hat. Im dritten Feld hältst du fest, was du daraus ableitest. Äußere Ressourcen wie Menschen oder Rahmenbedingungen trägst du darunter ein.",
      },
      {
        id: "3.8",
        title: "Körpersignale",
        intro: "Deine bekannten Signalgeber — Wahrnehmung, keine Symptome.",
        help: "Tippe die Körperstellen an, die du als Signalgeber kennst, oder trag eigene ein. Eine Bewertung gibt es hier nicht, die Signale stehen dir in Phase 4 und 5 wieder zur Verfügung.",
      },
      {
        id: "3.9",
        title: "Bisheriges Muster — Don’t!",
        intro: "Welche Ressourcenkombination dich immer wieder hineinführt.",
        help: "Zu Beginn öffnet sich deine Ist-Situation, du schließt das Fenster selbst. Wähle dann einen Einstieg und füll die Kette deines bisherigen Musters aus. Deine hinderlichen Ressourcen übernimmst du mit einem Tipp auf die Chips darunter.",
      },
      {
        id: "3.10",
        title: "Abschluss & Check",
        intro: "Dein Cockpit im Überblick — kurz festhalten, was du mitnimmst.",
        help: "Hier siehst du dein Ressourcen-Cockpit im Überblick. Halte danach in den vier Feldern fest, was du aus Phase 3 mitnimmst, „Phase abschließen“ führt dich zu Phase 4.",
      },
    ],
  },
  {
    id: 4,
    title: "Handlungsplan",
    short: "Konkrete eigene Schritte.",
    steps: [
      {
        id: "4.1",
        title: "Maßnahmen je Cluster",
        intro:
          "Aus deinen förderlichen Ressourcen konkrete Ich-Sätze — Cluster für Cluster.",
        help: "Geh deine Cluster nacheinander durch. Das hellblaue Kästchen zeigt, woran du erkennst, dass dein Ziel erreicht ist. Wähle darunter passende Ressourcen und formuliere Maßnahmen als ganze Ich-Sätze, empfohlen sind bis zu drei je Cluster.",
      },
      {
        id: "4.2",
        title: "Qualitätsprüfung",
        intro:
          "Vier Kriterien für wirksame Maßnahmen, einmal je Cluster geprüft.",
        help: "Prüfe je Cluster, ob deine Maßnahmen die vier Kriterien erfüllen. Die Maßnahmen kannst du hier direkt nachschärfen. Ein „nein“ ist erlaubt und zeigt dir, wo du nacharbeiten kannst.",
      },
      {
        id: "4.3",
        title: "Maßnahmenplan",
        intro: "Deine Maßnahmen als Tabelle — mit Terminen und Plan B.",
        help: "Trag zu jeder Maßnahme ein, bis wann du sie umsetzen willst, etwa „31.12.2026“ oder „Q4 2026“. Notiere mögliche Hindernisse und einen Plan B aus deinen Ressourcen.",
      },
      {
        id: "4.4",
        title: "Abschluss & Check",
        intro: "Kurz festhalten, was du aus dieser Phase mitnimmst.",
        help: "Hier siehst du deinen Handlungsplan im Überblick. Halte in den vier Feldern fest, was du aus Phase 4 mitnimmst, „Phase abschließen“ führt dich zu Phase 5.",
      },
    ],
  },
  {
    id: 5,
    title: "Nachhaltigkeit",
    short: "Dranbleiben und absichern.",
    steps: [
      {
        id: "5.1",
        title: "Dranbleiben",
        intro: "Pro Ressource eine konkrete Strategie, um dranzubleiben.",
        help: "Tippe eine Anregung an, die zu dir passt, oder leg über „+ Strategie“ eine eigene Zeile an. Trag je Zeile eine Ressource ein und eine konkrete Strategie, mit der du dranbleibst.",
      },
      {
        id: "5.2",
        title: "Erkenntnisse",
        intro: "Festhalten, was du aus dem ganzen Prozess mitnimmst.",
        help: "Halte fest, was du aus dem ganzen Prozess mitnimmst. Einträge aus deinem Erkenntnisboard übernimmst du mit „In die Erkenntnisse übernehmen“.",
      },
      {
        id: "5.3",
        title: "Abschluss & Check",
        intro: "Kurz festhalten — und die Sitzung abschließen.",
        help: "Halte in den vier Feldern fest, was du aus Phase 5 mitnimmst. Mit „Sitzung abschließen“ beendest du den Prozess, danach kannst du die Zusammenfassung als PDF speichern.",
      },
    ],
  },
];

/** Phase definition by id (PHASES is ordered 0…5). */
export function getPhaseDef(id: PhaseId): PhaseDef {
  return PHASES[id];
}
