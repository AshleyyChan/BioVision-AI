import React, { createContext, useContext, useState } from "react";

/**
 * AppContext
 * ----------
 * Global application-level UI state.
 *
 * Responsibilities:
 * - Track global loading activity (API, analysis, uploads)
 * - Store global error messages
 *
 * ❌ No study/specimen/day data lives here
 */

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  /* ---------------------------------------------------------------------- */
  /* Loading state (reference-counted)                                       */
  /* ---------------------------------------------------------------------- */

  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = () =>
    setLoadingCount((count) => count + 1);

  const stopLoading = () =>
    setLoadingCount((count) => Math.max(0, count - 1));

  const isLoading = loadingCount > 0;

  /**
   * setIsLoading (BACKWARD COMPATIBILITY)
   *
   * Allows legacy hooks to call:
   * setIsLoading(true / false)
   */
  const setIsLoading = (value) => {
    if (value) startLoading();
    else stopLoading();
  };

  /* ---------------------------------------------------------------------- */
  /* Global error                                                            */
  /* ---------------------------------------------------------------------- */

  const [error, setError] = useState(null);
  const clearError = () => setError(null);

  return (
    <AppContext.Provider
      value={{
        /* Loading */
        isLoading,
        startLoading,
        stopLoading,
        setIsLoading, // ✅ REQUIRED by existing hooks

        /* Errors */
        error,
        setError,
        clearError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/**
 * useAppContext
 * -------------
 * Safe access hook.
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error(
      "useAppContext must be used within an AppProvider"
    );
  }
  return context;
};
