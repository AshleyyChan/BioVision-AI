import apiClient from "./apiClient";

/**
 * upload.api.js
 * -------------
 * Handles SPECIMEN microscopy image uploads.
 *
 * Backend:
 * POST /api/upload
 * (apiClient already prefixes /api)
 */
const uploadApi = {
  /**
   * Upload specimen image for a specific day
   */
  uploadSpecimenImage: async (
    file,
    studyId,
    specimenId,
    dayId
  ) => {
    if (!(file instanceof File)) {
      throw new Error("Invalid file for upload");
    }

    if (
      !studyId ||
      !specimenId ||
      !dayId ||
      typeof studyId !== "string" ||
      typeof specimenId !== "string" ||
      typeof dayId !== "string"
    ) {
      throw new Error("Invalid upload identifiers");
    }

    const formData = new FormData();

    // 🔑 FIELD NAME MUST MATCH BACKEND
    formData.append("image", file);
    formData.append("study_id", studyId);
    formData.append("specimen_id", specimenId);
    formData.append("day_id", dayId);

    // 🔑 DO NOT set Content-Type manually
    // Axios will auto-set multipart boundary
    return apiClient.post("/upload", formData, {
      headers: {
        "Accept": "application/json",
      },
    });
  },
};

export default uploadApi;
