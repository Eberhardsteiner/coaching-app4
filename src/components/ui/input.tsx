import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/**
 * The single text-input primitive of the app (K3). Guarantees a readable,
 * consistent field everywhere: explicit `text-foreground` on `bg-surface`
 * (no more inline fields that forget the text colour — the root cause of the
 * "text ≈ background" bug), a visible placeholder, calm borders and a
 * keyboard-friendly focus ring. Size/spacing stay overridable via `className`
 * (tailwind-merge lets callers swap padding, background, width, …).
 */
export const Input = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<"input">
>(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-foreground placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      {...props}
    />
  );
});
