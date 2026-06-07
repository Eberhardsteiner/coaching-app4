import { X, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Modell-Schaubild als responsive Figur mit Klick-zum-Vergrößern-Overlay.
 * Quellenangabe ist in das Bild eingebrannt (keine separate Caption).
 * bg-white ist Absicht: die Schaubilder haben weißen Hintergrund.
 */
export function ModelImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <>
      <figure className="overflow-hidden rounded-xl border border-subtle bg-white">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`${alt} vergrößern`}
          className="group relative block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <img src={src} alt={alt} loading="lazy" className="block w-full" />
          <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/80 text-muted opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="size-4" aria-hidden />
          </span>
        </button>
      </figure>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          tabIndex={-1}
          onClick={() => setOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full rounded-lg bg-white"
            onClick={(event) => event.stopPropagation()}
          />
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Schließen"
            className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/90 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </>
  );
}
