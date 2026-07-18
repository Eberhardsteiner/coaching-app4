import { Textarea } from "@/components/ui/textarea";
import { NoPersonalDataHint } from "@/features/phases/NoPersonalDataHint";
import type { PhaseCheck as PhaseCheckValue } from "@/features/session/types";

/** The four reflective prompts that close every phase. */
const FIELDS: {
  key: keyof PhaseCheckValue;
  label: string;
  question: string;
}[] = [
  {
    key: "result",
    label: "Ergebnis",
    question: "Was ist für dich das Ergebnis dieser Phase?",
  },
  {
    key: "process",
    label: "Prozess",
    question: "Wie ist es dir beim Bearbeiten ergangen?",
  },
  {
    key: "insight",
    label: "Erkenntnis",
    question: "Welche Erkenntnis nimmst du mit?",
  },
  {
    key: "transfer",
    label: "Transfer",
    question: "Was davon möchtest du behalten oder mitnehmen?",
  },
];

type PhaseCheckProps = {
  value: PhaseCheckValue;
  onChange: (next: PhaseCheckValue) => void;
  readOnly?: boolean;
};

/**
 * Reusable four-part phase check (result / process / insight / transfer) — the
 * unified close of every phase. Props-driven: reads/writes a `PhaseCheck`. All
 * fields are optional (no hard block). Reused across phases 1–5.
 */
export function PhaseCheck({ value, onChange, readOnly }: PhaseCheckProps) {
  return (
    <div className="space-y-5">
      {FIELDS.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <label
            htmlFor={`phase-check-${field.key}`}
            className="block text-sm font-medium text-foreground"
          >
            {field.label}
          </label>
          <p id={`phase-check-${field.key}-q`} className="text-sm text-muted">
            {field.question}
          </p>
          <Textarea
            id={`phase-check-${field.key}`}
            aria-describedby={`phase-check-${field.key}-q`}
            value={value[field.key]}
            readOnly={readOnly}
            rows={2}
            onChange={(event) =>
              onChange({ ...value, [field.key]: event.target.value })
            }
          />
        </div>
      ))}
      <NoPersonalDataHint />
    </div>
  );
}
