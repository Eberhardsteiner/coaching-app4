import { DesignSystem } from "@/routes/DesignSystem";

/**
 * Application root.
 *
 * For WP0 it renders the Design-System demo directly. Routing (the guided /
 * self-coaching branches and the app shell) arrives in Prompt 2 and will
 * replace this default view.
 */
export function App() {
  return <DesignSystem />;
}
