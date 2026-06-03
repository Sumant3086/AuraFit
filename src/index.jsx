import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AppLoader from "./components/common/AppLoader";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Unregister any stale service workers immediately.
// The old SW (from when devOptions.enabled was true) stays cached in the browser
// and intercepts requests on first load, causing a blank page.
// This runs synchronously before React mounts so the page loads clean every time.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => {
      // In dev: always unregister (SW should not run in dev)
      // In prod: only unregister if it's a stale/broken registration
      if (import.meta.env.DEV) {
        reg.unregister();
      }
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppLoader>
        <App />
      </AppLoader>
    </BrowserRouter>
  </React.StrictMode>
);
