// src/main-public.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import PublicApp from "./PublicApp"; // <-- Changed
import { Provider } from "./provider.tsx";
// AuthProvider is not needed for public pages
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <PublicApp />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
