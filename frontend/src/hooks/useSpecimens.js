import { useCallback } from "react";

import { useAppContext } from "../context/AppContext";
import { useStudyContext } from "../context/StudyContext";
import { useSpecimenContext } from "../context/SpecimenContext";
import specimenApi from "../api/specimen.api";

/**
 * useSpecimens
 * ------------
 * Backend-driven specimen manager.
 *
 * SINGLE source of truth:
 * - backend filesystem
 */
const useSpecimens = () => {
  const { startLoading, stopLoading, setError } = useAppContext();
  const { activeStudy } = useStudyContext();
  const { setActiveSpecimen } = useSpecimenContext();

  /* -------------------------------------------------- */
  /* Fetch specimens (STABLE)                            */
  /* -------------------------------------------------- */
  const fetchSpecimens = useCallback(async () => {
    if (!activeStudy) return [];

    try {
      startLoading();
      const response = await specimenApi.getSpecimens(
        activeStudy
      );
      return Array.isArray(response?.data)
        ? response.data
        : [];
    } catch (err) {
      console.error(err);
      setError("Failed to load specimens.");
      return [];
    } finally {
      stopLoading();
    }
  }, [activeStudy]); // 🔑 ONLY stable dependency

  /* -------------------------------------------------- */
  /* Create specimen                                    */
  /* -------------------------------------------------- */
  const createSpecimen = useCallback(
    async (data) => {
      if (!activeStudy) {
        setError("No study selected.");
        return null;
      }

      try {
        const response =
          await specimenApi.createSpecimen(
            activeStudy,
            data
          );

        const specimen = response?.data ?? null;

        if (specimen?.specimen_id) {
          setActiveSpecimen(
            specimen.specimen_id,
            specimen
          );
        }

        return specimen;
      } catch (err) {
        console.error(err);
        setError("Failed to create specimen.");
        return null;
      }
    },
    [activeStudy, setActiveSpecimen]
  );

  /* -------------------------------------------------- */
  /* Update specimen                                    */
  /* -------------------------------------------------- */
  const updateSpecimen = useCallback(
    async (specimenId, data) => {
      if (!activeStudy || !specimenId) {
        setError("Invalid study or specimen.");
        return null;
      }

      try {
        const response =
          await specimenApi.updateSpecimen(
            activeStudy,
            specimenId,
            data
          );

        return response?.data ?? null;
      } catch (err) {
        console.error(err);
        setError("Failed to update specimen.");
        return null;
      }
    },
    [activeStudy]
  );

  /* -------------------------------------------------- */
  /* Delete specimen                                    */
  /* -------------------------------------------------- */
  const deleteSpecimen = useCallback(
    async (specimenId) => {
      if (!activeStudy || !specimenId) {
        setError("Invalid study or specimen.");
        return false;
      }

      try {
        await specimenApi.deleteSpecimen(
          activeStudy,
          specimenId
        );
        return true;
      } catch (err) {
        console.error(err);
        setError("Failed to delete specimen.");
        return false;
      }
    },
    [activeStudy]
  );

  /* -------------------------------------------------- */
  /* Select specimen                                    */
  /* -------------------------------------------------- */
  const selectSpecimen = useCallback(
    (specimenOrId) => {
      const id =
        typeof specimenOrId === "string"
          ? specimenOrId
          : specimenOrId?.specimen_id;

      if (!id) return;
      setActiveSpecimen(id);
    },
    [setActiveSpecimen]
  );

  return {
    fetchSpecimens,
    createSpecimen,
    updateSpecimen,
    deleteSpecimen,
    selectSpecimen,
  };
};

export default useSpecimens;
