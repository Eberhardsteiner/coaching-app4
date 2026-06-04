/**
 * Emergency / crisis help resources, configurable per region.
 *
 * // TODO: vor Launch je Region final verifizieren (Nummern, Verfügbarkeit,
 * // Bezeichnungen). Keine Personen-/Markennamen.
 */

export type HelpRegion = "DE" | "AT";

export interface HelpResource {
  /** Neutral label, e.g. "Notruf" or "Telefonseelsorge". */
  label: string;
  /** Human-readable number / contact. */
  value: string;
  /** Optional tel: link target. */
  href?: string;
  /** Optional neutral note (e.g. availability). */
  note?: string;
}

export interface RegionHelp {
  emergency: HelpResource;
  crisisLines: HelpResource[];
}

/** Default region when none is specified. */
export const DEFAULT_REGION: HelpRegion = "DE";

const RESOURCES: Record<HelpRegion, RegionHelp> = {
  DE: {
    emergency: { label: "Notruf", value: "112", href: "tel:112" },
    crisisLines: [
      {
        label: "Telefonseelsorge",
        value: "0800 111 0 111",
        href: "tel:08001110111",
        note: "kostenfrei, rund um die Uhr",
      },
      {
        label: "Telefonseelsorge",
        value: "0800 111 0 222",
        href: "tel:08001110222",
        note: "kostenfrei, rund um die Uhr",
      },
    ],
  },
  AT: {
    emergency: { label: "Notruf", value: "112", href: "tel:112" },
    crisisLines: [
      {
        label: "Telefonseelsorge",
        value: "142",
        href: "tel:142",
        note: "kostenfrei, rund um die Uhr",
      },
    ],
  },
};

/** Help resources for a region (defaults to DE). */
export function getHelpResources(
  region: HelpRegion = DEFAULT_REGION,
): RegionHelp {
  return RESOURCES[region];
}
