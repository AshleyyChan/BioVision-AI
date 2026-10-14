import apiClient from "./apiClient";

/* ------------------------------------------------------------------ */
/* Simple in-flight request guard (per study)                          */
/* ------------------------------------------------------------------ */

const inflight = new Map();

const specimenApi = {
  /* -------------------------------------------------- */
  /* Fetch specimens                                    */
  /* -------------------------------------------------- */
  getSpecimens(studyId) {
    if (!studyId) {
      return Promise.reject(
        new Error("specimenApi.getSpecimens: active study is not set")
      );
    }

    // Deduplicate concurrent requests
    if (inflight.has(studyId)) {
      return inflight.get(studyId);
    }

    const request = apiClient
      .get(`/studies/${studyId}/specimens`)
      .finally(() => inflight.delete(studyId));

    inflight.set(studyId, request);
    return request;
  },

  /* -------------------------------------------------- */
  /* Create specimen                                    */
  /* -------------------------------------------------- */
  createSpecimen(studyId, data) {
    if (!studyId) {
      return Promise.reject(
        new Error("specimenApi.createSpecimen: active study is not set")
      );
    }

    if (!data?.name) {
      return Promise.reject(
        new Error("specimenApi.createSpecimen: specimen name is required")
      );
    }

    // Clear cached list after mutation to ensure fresh data
    inflight.delete(studyId);

    return apiClient
      .post(`/studies/${studyId}/specimens`, data)
      .catch((error) => {
        console.error("Error creating specimen:", error);
        throw new Error("Failed to create specimen.");
      });
  },

  /* -------------------------------------------------- */
  /* Update specimen                                    */
  /* -------------------------------------------------- */
  updateSpecimen(studyId, specimenId, data) {
    if (!studyId || !specimenId) {
      return Promise.reject(
        new Error("specimenApi.updateSpecimen: studyId and specimenId are required")
      );
    }

    if (!data || Object.keys(data).length === 0) {
      return Promise.reject(
        new Error("specimenApi.updateSpecimen: update data is required")
      );
    }

    // Clear cached list after mutation to ensure fresh data
    inflight.delete(studyId);

    return apiClient
      .put(`/studies/${studyId}/specimens/${specimenId}`, data)
      .catch((error) => {
        console.error("Error updating specimen:", error);
        throw new Error("Failed to update specimen.");
      });
  },

  /* -------------------------------------------------- */
  /* Delete specimen                                    */
  /* -------------------------------------------------- */
  deleteSpecimen(studyId, specimenId) {
    if (!studyId || !specimenId) {
      return Promise.reject(
        new Error("specimenApi.deleteSpecimen: studyId and specimenId are required")
      );
    }

    // Clear cached list after mutation to ensure fresh data
    inflight.delete(studyId);

    return apiClient
      .delete(`/studies/${studyId}/specimens/${specimenId}`)
      .catch((error) => {
        console.error("Error deleting specimen:", error);
        throw new Error("Failed to delete specimen.");
      });
  },
};

export default specimenApi;
