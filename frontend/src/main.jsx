import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

/**
 * main.jsx
 * --------
 * Application entry point.
 *
 * Responsibilities:
 * - Mount BrowserRouter ONCE
 * - Render App (providers + routes)
 */
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
);
