/**
 * URL zu einem statischen Asset unter /public, das den Vite-base-Pfad
 * berücksichtigt — so funktioniert die App sowohl im Unterordner
 * (/coaching-app4/) als auch an der Domain-Wurzel. Pfad relativ zu /public
 * übergeben, z. B. publicAsset("content/models/index.json").
 */
export function publicAsset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\/+/, "");
}
