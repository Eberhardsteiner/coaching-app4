import { useEffect, useRef, useState } from "react";
import { Boxes, LifeBuoy, NotebookPen, Wrench, X } from "lucide-react";
import { Outlet } from "react-router";

import { HelpDrawerContent } from "@/components/layout/HelpDrawerContent";
import { ToolsDrawerContent } from "@/components/layout/ToolsDrawerContent";
import { TopBar } from "@/components/layout/TopBar";
import { ONBOARDING_TOUR_SEEN_KEY } from "@/config/constants";
import { Tour } from "@/features/onboarding/Tour";
import { getKvFlag, setKvFlag } from "@/features/session/sessionRepository";
import { cn } from "@/lib/utils";

type DrawerId = "tools" | "notebook" | "models" | "help";

type DrawerDef = {
  id: DrawerId;
  label: string;
  icon: typeof Wrench;
  /** Placeholder body for the simple drawers (the Hilfe drawer has rich content). */
  body?: string;
};

const DRAWERS: DrawerDef[] = [
  {
    id: "tools",
    label: "Werkzeuge",
    icon: Wrench,
    body: "Hier erscheinen später Werkzeuge für die aktuelle Phase.",
  },
  {
    id: "notebook",
    label: "Notizbuch",
    icon: NotebookPen,
    body: "Platz für persönliche Notizen — folgt in einem späteren Paket.",
  },
  {
    id: "models",
    label: "Modelle",
    icon: Boxes,
    body: "Kurze Erklärungen zu den verwendeten systemischen Modellen.",
  },
  { id: "help", label: "Hilfe", icon: LifeBuoy },
];

/**
 * AppShell — „Bühne mit Schubladen".
 *
 * Top bar + central stage (renders the <Outlet />) + a persistent right rail of
 * four collapsible drawers. Only one drawer is open at a time. Keyboard- and
 * screen-reader-friendly (aria-expanded / aria-controls, Esc to close, focus
 * returns to the triggering tab). On narrow viewports the open drawer becomes an
 * overlay (with a scrim). The rail is hidden in the "Frei" persona via CSS.
 *
 * Mounting the AppShell means the work view is first visible — so it also kicks
 * off the onboarding tour once (kv flag) and hosts the Hilfe drawer content.
 */
export function AppShell() {
  const [openId, setOpenId] = useState<DrawerId | null>(null);
  const [tourOpen, setTourOpen] = useState(false);
  const tabRefs = useRef<Partial<Record<DrawerId, HTMLButtonElement | null>>>(
    {},
  );
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Auto-start the tour the first time the work view is visible (once per kv flag).
  useEffect(() => {
    let active = true;
    void getKvFlag(ONBOARDING_TOUR_SEEN_KEY).then((seen) => {
      if (active && !seen) setTourOpen(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Esc closes the open drawer and returns focus to its tab.
  useEffect(() => {
    if (!openId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenId(null);
        tabRefs.current[openId]?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openId]);

  // Move focus into the panel (its close button) when it opens.
  useEffect(() => {
    if (openId) closeRef.current?.focus();
  }, [openId]);

  const openDrawer = openId
    ? DRAWERS.find((drawer) => drawer.id === openId)
    : undefined;

  function toggle(id: DrawerId) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function close() {
    if (openId) tabRefs.current[openId]?.focus();
    setOpenId(null);
  }

  function startTour() {
    setOpenId(null); // close any open drawer first
    setTourOpen(true);
  }

  function handleTourClose(dontShowAgain: boolean) {
    void setKvFlag(ONBOARDING_TOUR_SEEN_KEY, dontShowAgain);
    setTourOpen(false);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      {/* Main column: top bar + stage */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto h-full w-full max-w-[var(--stage-max-width)] p-[var(--stage-padding)]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Scrim — only on narrow viewports while a drawer is open. */}
      {openDrawer ? (
        <button
          type="button"
          aria-label="Schublade schließen"
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      {/* Drawer panel: overlay on narrow, fixed side column on lg+. */}
      {openDrawer ? (
        <section
          id={`drawer-panel-${openDrawer.id}`}
          role="region"
          aria-label={openDrawer.label}
          className={cn(
            "fixed inset-y-0 right-14 z-40 flex w-80 max-w-[80vw] flex-col border-l border-subtle bg-surface shadow-xl",
            "lg:static lg:right-auto lg:z-auto lg:w-72 lg:max-w-none lg:shadow-none",
            "motion-safe:animate-[drawer-in_180ms_ease-out]",
          )}
        >
          <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
            <h2 className="font-serif text-lg text-foreground">
              {openDrawer.label}
            </h2>
            <button
              ref={closeRef}
              type="button"
              aria-label="Schublade schließen"
              onClick={close}
              className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {openDrawer.id === "help" ? (
              <HelpDrawerContent onStartTour={startTour} />
            ) : openDrawer.id === "tools" ? (
              <ToolsDrawerContent />
            ) : (
              <p className="text-sm text-muted">{openDrawer.body}</p>
            )}
          </div>
        </section>
      ) : null}

      {/* Rail: persistent icon tabs (hidden in the Frei persona via CSS). */}
      <nav
        aria-label="Schubladen"
        className="app-rail z-50 flex w-14 shrink-0 flex-col items-center gap-1 border-l border-subtle bg-surface py-3"
      >
        {DRAWERS.map((drawer) => {
          const active = openId === drawer.id;
          return (
            <button
              key={drawer.id}
              ref={(el) => {
                tabRefs.current[drawer.id] = el;
              }}
              type="button"
              onClick={() => toggle(drawer.id)}
              aria-label={drawer.label}
              title={drawer.label}
              aria-expanded={active}
              aria-controls={`drawer-panel-${drawer.id}`}
              className={cn(
                "flex size-10 items-center justify-center rounded-lg transition-colors",
                active
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <drawer.icon className="size-5" />
            </button>
          );
        })}
      </nav>

      <Tour open={tourOpen} onClose={handleTourClose} />
    </div>
  );
}
