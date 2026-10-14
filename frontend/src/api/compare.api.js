import apiClient from "./apiClient";

/**
 * compare.api.js
 * --------------
 * STANDALONE IMAGE COMPARISON API
 *
 * IMPORTANT:
 * - This is NOT specimen comparison
 * - This is NOT study/day comparison
 * - This works ONLY with raw image paths
 *
 * Backend:
 * POST /api/compare
 *
 * Payload:
 * { imagePathA, imagePathB }
 */

/**
 * Run standalone image-to-image comparison
 *
 * @param {string} imagePathA - backend-accessible path to image A
 * @param {string} imagePathB - backend-accessible path to image B
 * @returns {Promise<Object>} flat comparison metrics
 */
const runImageComparison = async (imagePathA, imagePathB) => {
  if (!imagePathA || !imagePathB) {
    throw new Error("Both image paths are required for comparison");
  }

  // NOTE:
  // apiClient.baseURL === "/api"
  // → final request = POST /api/compare
  const { data } = await apiClient.post("/compare", {
    imagePathA,
    imagePathB,
  });

  return data;
};

export default {
  runImageComparison,
};
