import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const SpecimenContext = createContext(null);

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export const SpecimenProvider = ({ children }) => {
  /* ---------------- Specimen ---------------- */

  const [activeSpecimenId, setActiveSpecimenId] = useState(null);

  /**
   * 🔑 Canonical API
   * Specimen ONLY — study comes from StudyContext
   */
  const setActiveSpecimen = useCallback((specimenId) => {
    setActiveSpecimenId(specimenId ?? null);
  }, []);

  /* ---------------- Days ---------------- */

  const [days, setDays] = useState([]);
  const [activeDayId, setActiveDayId] = useState(null);
  const [loadingDays] = useState(false);

  const setActiveDay = useCallback((dayId) => {
    setActiveDayId(dayId ?? null);
  }, []);

  /* -------------------------------------------------- */
  /* Day mutations (UI sync only — NO FETCHING)          */
  /* -------------------------------------------------- */

  const replaceDays = useCallback((newDays = []) => {
    const normalized = Array.isArray(newDays)
      ? newDays
      : [];

    setDays(normalized);

    setActiveDayId((prev) => {
      if (prev && normalized.some(d => d.day_id === prev)) {
        return prev;
      }
      return normalized[0]?.day_id ?? null;
    });
  }, []);

  const addDay = useCallback((day) => {
    if (!day?.day_id) return;

    setDays((prev) => [...prev, day]);
    setActiveDayId(day.day_id);
  }, []);

  const removeDay = useCallback((dayId) => {
    if (!dayId) return;

    setDays((prev) => {
      const updated = prev.filter(d => d.day_id !== dayId);

      setActiveDayId((current) =>
        current === dayId
          ? updated[0]?.day_id ?? null
          : current
      );

      return updated;
    });
  }, []);

  const updateDayImage = useCallback((dayId, imagePath) => {
    setDays((prev) =>
      prev.map((d) =>
        d.day_id === dayId
          ? { ...d, image_path: imagePath }
          : d
      )
    );
  }, []);

  const updateDayAnalysis = useCallback((dayId, analysis) => {
    setDays((prev) =>
      prev.map((d) =>
        d.day_id === dayId
          ? { ...d, analysis }
          : d
      )
    );
  }, []);

  const updateDayMetadata = useCallback((dayId, updatedData) => {
    if (!dayId || !updatedData) return;

    setDays((prev) =>
      prev.map((d) =>
        d.day_id === dayId
          ? { ...d, ...updatedData }
          : d
      )
    );
  }, []);

  /* ---------------- Reset ---------------- */

  const resetSpecimenState = useCallback(() => {
    setActiveSpecimenId(null);
    setDays([]);
    setActiveDayId(null);
  }, []);

  /* ---------------- Memoized Context Value ---------------- */

  const value = useMemo(
    () => ({
      /* Specimen */
      activeSpecimen: activeSpecimenId,
      setActiveSpecimen,
      resetSpecimenState,

      /* Days */
      days,
      replaceDays,
      addDay,
      removeDay,
      activeDayId,
      setActiveDay,
      loadingDays,

      /* Mutations */
      updateDayImage,
      updateDayAnalysis,
      updateDayMetadata,
    }),
    [
      activeSpecimenId,
      days,
      activeDayId,
      setActiveSpecimen,
      replaceDays,
      addDay,
      removeDay,
      updateDayImage,
      updateDayAnalysis,
      updateDayMetadata,
    ]
  );

  return (
    <SpecimenContext.Provider value={value}>
      {children}
    </SpecimenContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export const useSpecimenContext = () => {
  const ctx = useContext(SpecimenContext);
  if (!ctx) {
    throw new Error(
      "useSpecimenContext must be used inside SpecimenProvider"
    );
  }
  return ctx;
};
