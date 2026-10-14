import apiClient from "./apiClient";

const imageCompareUploadApi = {
  uploadCompareImages: async (imageA, imageB) => {
    if (!imageA || !imageB) {
      throw new Error("Two images are required for comparison upload");
    }

    const formData = new FormData();
    formData.append("imageA", imageA);
    formData.append("imageB", imageB);

    const { data } = await apiClient.post(
      "/image-compare/upload", // ✅ MUST match backend
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data;
  },
};

export default imageCompareUploadApi;
