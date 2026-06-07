import { useLayoutEffect, useState, type RefObject } from "react";

/** Small side gutter (px) kept between the full-width board and the stage edges. */
const FULL_BLEED_GUTTER = 24;

type BleedStyle = { width: number; marginLeft: number; marginRight: number };

/**
 * Lets the large board break out of the centred max-width content column so it
 * fills the **full width of the scrolling `<main>` stage area** (minus small
 * gutters), while its readable text siblings stay in their column.
 *
 * Given a ref to the board's outer wrapper, it measures `<main>` and the
 * wrapper's own in-flow parent (a stable element that never receives the bleed,
 * so there is no measurement feedback loop) on mount and on every resize.
 * Because the app shell is asymmetric — the right rail, the optional coach
 * console and an open drawer all sit to the right of `<main>` — a naive `100vw`
 * full-bleed would overshoot; measuring `<main>` directly keeps the board inside
 * the real content area. The ref's `.current` is only read inside the effect.
 *
 * Returns the inline style to apply, or `null` until measured (and whenever there
 * is no `<main>` ancestor, e.g. the presenter window) — then the caller keeps the
 * board at `w-full`.
 */
export function useFullWidthBoard<T extends HTMLElement>(
  targetRef: RefObject<T | null>,
): BleedStyle | null {
  const [style, setStyle] = useState<BleedStyle | null>(null);

  useLayoutEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    const host = el.parentElement;
    const main = el.closest("main");
    if (!host || !main) return;

    const measure = () => {
      const mainBox = main.getBoundingClientRect();
      const hostBox = host.getBoundingClientRect();
      // clientWidth excludes a vertical scrollbar; getBoundingClientRect().left
      // is the (scrollbar-free) left edge in LTR — so the board fits exactly.
      const usable = main.clientWidth - FULL_BLEED_GUTTER * 2;
      const marginLeft = mainBox.left + FULL_BLEED_GUTTER - hostBox.left;
      const marginRight =
        hostBox.right - (mainBox.left + main.clientWidth - FULL_BLEED_GUTTER);
      setStyle({ width: usable, marginLeft, marginRight });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(main);
    observer.observe(host);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [targetRef]);

  return style;
}
