import {
  forwardRef,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
} from "react";

import { cn } from "@/lib/utils";

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  /**
   * Grow with the content instead of scrolling inside a fixed box (K3, 4.3):
   * the field starts at its `rows` height and expands so nothing is clipped
   * and no placeholder is cut off. Manual resize is disabled while auto.
   */
  autoResize?: boolean;
};

/**
 * The single multi-line text primitive of the app (K3). Same readable defaults
 * as {@link Input} (explicit `text-foreground`, visible placeholder, calm
 * border + focus ring). With `autoResize`, the box tracks its content height.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { className, autoResize = false, onChange, value, ...props },
    ref,
  ) {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    function setRefs(node: HTMLTextAreaElement | null) {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }

    function fit() {
      const el = innerRef.current;
      if (!autoResize || !el) return;
      // Hidden (display:none — e.g. the responsive twin of a table/card
      // layout): scrollHeight is 0 and would freeze the box at height 0.
      // Clear the inline height instead so `rows` applies when it appears.
      if (el.offsetParent === null) {
        el.style.height = "";
        return;
      }
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }

    // Re-fit when the controlled value changes (external edits, resets) or the
    // mode toggles. Runs after layout so scrollHeight is accurate.
    useEffect(fit, [value, autoResize]);

    // Re-fit on size/visibility changes — a value-only effect would leave a
    // previously hidden responsive twin (display:none at mount) collapsed.
    // window.resize covers breakpoint crossings deterministically; the
    // ResizeObserver covers width changes without a window resize (drawers).
    // Converges: re-applying the same height does not notify again.
    useEffect(() => {
      const el = innerRef.current;
      if (!autoResize || !el) return;
      window.addEventListener("resize", fit);
      const observer =
        typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
      observer?.observe(el);
      return () => {
        window.removeEventListener("resize", fit);
        observer?.disconnect();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoResize]);

    return (
      <textarea
        ref={setRefs}
        value={value}
        onChange={(event) => {
          onChange?.(event);
          fit();
        }}
        className={cn(
          "w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-45",
          autoResize ? "resize-none overflow-hidden" : "resize-y",
          className,
        )}
        {...props}
      />
    );
  },
);
