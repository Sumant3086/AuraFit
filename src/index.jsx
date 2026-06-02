import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AppLoader from "./components/common/AppLoader";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

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
