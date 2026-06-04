/// <reference types="vite/client" />

/**
 * @fontsource variable packages ship their @font-face CSS through the package
 * root. Declaring them as side-effect-only modules lets the bare imports in
 * main.tsx type-check under `tsc` (Vite handles the actual CSS/asset bundling).
 */
declare module "@fontsource-variable/source-sans-3";
declare module "@fontsource-variable/source-serif-4";
