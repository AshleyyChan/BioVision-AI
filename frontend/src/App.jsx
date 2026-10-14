import React from "react";

import AppRoutes from "./routes/AppRoutes";

import { AppProvider } from "./context/AppContext";
import { StudyProvider } from "./context/StudyContext";
import { SpecimenProvider } from "./context/SpecimenContext";

/**
 * App
 * ---
 * Root application component.
 *
 * NOTE:
 * - BrowserRouter is mounted in main.jsx
 * - App only composes providers + routes
 */
const App = () => {
  return (
    <AppProvider>
      <StudyProvider>
        <SpecimenProvider>
          <AppRoutes />
        </SpecimenProvider>
      </StudyProvider>
    </AppProvider>
  );
};

export default App;
