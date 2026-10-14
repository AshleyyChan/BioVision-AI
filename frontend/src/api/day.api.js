/**
 * day.api.js
 * ----------
 * Backend contract for DAY lifecycle.
 */

import apiClient from "./apiClient";

/* ------------------------------------------------------------------ */
/* Payload Normalizers                                                 */
/* ------------------------------------------------------------------ */

/**
 * CREATE payload (label REQUIRED)
 * Must match backend CreateDayRequest
 */
const normalizeCreatePayload = (data = {}) => ({
  label: data.label,

  // Concentration method (e.g. H2O2 / PBS)
  concentration: data.concentration ?? null,

  // Unit: mM | µM
  unit: data.unit ?? "mM",

  temperature: data.temperature ?? null,

  // Backend expects snake_case
  treatmentType: data.treatmentType ?? data.treatment_type ?? null,
});

/**
 * UPDATE payload
 * Sends ONLY defined fields supported by backend
 */
const normalizeUpdatePayload = (data = {}) => {
  const payload = {};

  if (data.label !== undefined) {
    payload.label = data.label;
  }

  if (data.concentration !== undefined) {
    payload.concentration = data.concentration ?? null;
  }

  if (data.unit !== undefined) {
    payload.unit = data.unit;
  }

  if (data.temperature !== undefined) {
    payload.temperature = data.temperature ?? null;
  }

  if (data.treatmentType !== undefined || data.treatment_type !== undefined) {
    payload.treatmentType =
      data.treatmentType ?? data.treatment_type ?? null;
  }

  if (data.image_path !== undefined) {
    payload.image_path = data.image_path;
  }

  if (data.analysis !== undefined) {
    payload.analysis = data.analysis;
  }

  return payload;
};

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

const dayApi = {
  /* -------------------------------------------------- */
  /* GET DAYS                                           */
  /* -------------------------------------------------- */
  getDays({ study_id, specimen_id }) {
    if (!study_id || !specimen_id) {
      throw new Error("study_id and specimen_id are required");
    }

    return apiClient.get(
      `/studies/${study_id}/specimens/${specimen_id}/days`
    );
  },

  /* -------------------------------------------------- */
  /* CREATE DAY                                         */
  /* -------------------------------------------------- */
  createDay({ study_id, specimen_id, data }) {
    if (!study_id || !specimen_id) {
      throw new Error("study_id and specimen_id are required");
    }

    if (!data?.label) {
      throw new Error("Day label is required");
    }

    return apiClient.post(
      `/studies/${study_id}/specimens/${specimen_id}/days`,
      normalizeCreatePayload(data)
    );
  },

  /* -------------------------------------------------- */
  /* UPDATE DAY                                         */
  /* -------------------------------------------------- */
  updateDay({ study_id, specimen_id, day_id, data }) {
    if (!study_id || !specimen_id || !day_id) {
      throw new Error(
        "study_id, specimen_id, and day_id are required"
      );
    }

    const payload = normalizeUpdatePayload(data);

    // Do not send empty updates
    if (Object.keys(payload).length === 0) {
      return Promise.resolve({ data: null });
    }

    return apiClient.put(
      `/studies/${study_id}/specimens/${specimen_id}/days/${day_id}`,
      payload
    );
  },

  /* -------------------------------------------------- */
  /* DELETE DAY                                         */
  /* -------------------------------------------------- */
  deleteDay({ study_id, specimen_id, day_id }) {
    if (!study_id || !specimen_id || !day_id) {
      throw new Error(
        "study_id, specimen_id, and day_id are required"
      );
    }

    return apiClient.delete(
      `/studies/${study_id}/specimens/${specimen_id}/days/${day_id}`
    );
  },
};

export default dayApi;
