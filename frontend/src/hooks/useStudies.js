import { useAppContext } from "../context/AppContext";
import { useStudyContext } from "../context/StudyContext";
import studyApi from "../api/study.api";

/**
 * useStudies
 * ----------
 * Backend-driven Study manager.
 *
 * 🔒 Single source of truth: backend filesystem
 */
const useStudies = () => {
  const { startLoading, stopLoading, setError } = useAppContext();
  const { setStudies, selectStudy, activeStudy } = useStudyContext();

  /* -------------------------------------------------- */
  /* Fetch all studies                                  */
  /* -------------------------------------------------- */
  const fetchStudies = async () => {
    try {
      startLoading();

      const response = await studyApi.getStudies();
      const studies = Array.isArray(response.data)
        ? response.data
        : [];

      setStudies(studies);
      return studies;
    } catch (err) {
      console.error("Fetch studies failed:", err);
      setError("Failed to load studies.");
      return [];
    } finally {
      stopLoading();
    }
  };

  /* -------------------------------------------------- */
  /* Create new study                                   */
  /* -------------------------------------------------- */
  const createStudy = async (data) => {
    try {
      startLoading();

      const response = await studyApi.createStudy(data);
      const newStudy = response.data;

      // 🔄 authoritative refresh
      await fetchStudies();

      return newStudy;
    } catch (err) {
      console.error("Create study failed:", err);
      setError("Failed to create study.");
      return null;
    } finally {
      stopLoading();
    }
  };

  /* -------------------------------------------------- */
  /* Update study  ✅ FIXED                              */
  /* -------------------------------------------------- */
  const updateStudy = async (study) => {
    if (!study?.study_id) return null;

    try {
      startLoading();

      const response = await studyApi.updateStudy(
        study.study_id,
        {
          title: study.title,
          researcherName: study.researcherName,
          date: study.date,
          time: study.time,
        }
      );

      const updated = response.data;

      await fetchStudies();

      // 🔄 Re-activate if currently open
      if (activeStudy === updated.study_id) {
        selectStudy(updated);
      }

      return updated;
    } catch (err) {
      console.error("Update study failed:", err);
      setError("Failed to update study.");
      return null;
    } finally {
      stopLoading();
    }
  };

  /* -------------------------------------------------- */
  /* Delete study                                       */
  /* -------------------------------------------------- */
  const deleteStudy = async (studyId) => {
    if (!studyId) return false;

    try {
      startLoading();

      await studyApi.deleteStudy(studyId);

      await fetchStudies();

      if (activeStudy === studyId) {
        selectStudy(null);
      }

      return true;
    } catch (err) {
      console.error("Delete study failed:", err);
      setError("Failed to delete study.");
      return false;
    } finally {
      stopLoading();
    }
  };

  /* -------------------------------------------------- */
  /* Activate study                                     */
  /* -------------------------------------------------- */
  const activateStudy = (study) => {
    if (!study?.study_id) return;
    selectStudy(study);
  };

  return {
    fetchStudies,
    createStudy,
    updateStudy,    // ✅ now works
    deleteStudy,
    selectStudy: activateStudy,
  };
};

export default useStudies;
