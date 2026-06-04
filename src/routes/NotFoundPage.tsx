import { Link } from "react-router";

import { Button } from "@/components/ui/button";

/** 404 fallback for unknown routes. */
export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div>
        <p className="font-serif text-5xl text-foreground">404</p>
        <p className="mt-3 text-muted">Diese Seite gibt es nicht.</p>
      </div>
      <Button asChild>
        <Link to="/">Zur Startseite</Link>
      </Button>
    </div>
  );
}
