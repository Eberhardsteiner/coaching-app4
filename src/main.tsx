import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Self-hosted fonts (no runtime CDN). The bare imports pull in the @font-face
// CSS and bundle the woff2 files through Vite.
import "@fontsource-variable/source-sans-3";
import "@fontsource-variable/source-serif-4";

import "./styles/global.css";

import { App } from "./app/App";
import { Providers } from "./app/providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
