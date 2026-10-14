/**
 * study.api.js
 * ------------
 * Backend contract for Study lifecycle.
 *
 * Uses centralized apiClient.
 * No hardcoded URLs.
 */

import apiClient from "./apiClient";

/* ------------------------------------------------------------------ */
/* In-flight request deduplication                                     */
/* ------------------------------------------------------------------ */

let inflightGetStudies = null;

const studyApi = {
  /**
   * GET /api/studies
   */
  getStudies() {
    // 🛑 Deduplicate concurrent calls
    if (inflightGetStudies) {
      return inflightGetStudies;
    }

    inflightGetStudies = apiClient
      .get("/studies/")
      .finally(() => {
        inflightGetStudies = null;
      });

    return inflightGetStudies;
  },

  /**
   * GET /api/studies/:study_id
   */
  getStudy(study_id) {
    if (!study_id) {
      return Promise.reject(
        new Error("studyApi.getStudy: study_id is required")
      );
    }

    return apiClient.get(`/studies/${study_id}`);
  },

  /**
   * POST /api/studies/
   */
  createStudy(data) {
    const title = data?.title || data?.name;
    if (!title) {
      return Promise.reject(
        new Error("studyApi.createStudy: study title is required")
      );
    }

    const payload = {
      title,
      researcherName: data?.researcherName || data?.researcher || "Anonymous",
      date: data?.date || new Date().toISOString().split("T")[0],
      time: data?.time || new Date().toTimeString().slice(0, 5),
    };

    return apiClient.post("/studies/", payload);
  },

  /**
   * PUT /api/studies/:study_id/
   */
  updateStudy(study_id, data) {
    if (!study_id) {
      return Promise.reject(
        new Error("studyApi.updateStudy: study_id is required")
      );
    }

    return apiClient.put(`/studies/${study_id}/`, data);
  },

  /**
   * DELETE /api/studies/:study_id
   */
  deleteStudy(study_id) {
    if (!study_id) {
      return Promise.reject(
        new Error("studyApi.deleteStudy: study_id is required")
      );
    }

    return apiClient.delete(`/studies/${study_id}/`);
  },
};

export default studyApi;
