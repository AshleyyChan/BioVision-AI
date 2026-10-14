import { useState } from "react";

import imageCompareUploadApi from "@/api/imageCompareUpload.api";
import compareApi from "@/api/compare.api";

const ImageComparePanel = () => {
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);

  const [previewA, setPreviewA] = useState(null);
  const [previewB, setPreviewB] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // -----------------------------
  // Handlers
  // -----------------------------

  const handleImageAChange = (file) => {
    setImageA(file);
    setPreviewA(URL.createObjectURL(file));
    setResults(null);
  };

  const handleImageBChange = (file) => {
    setImageB(file);
    setPreviewB(URL.createObjectURL(file));
    setResults(null);
  };

  const handleCompare = async () => {
    if (!imageA || !imageB) {
      setError("Please select both images before comparing.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResults(null);

      // 1️⃣ Upload images
      const { imageAPath, imageBPath } =
        await imageCompareUploadApi.uploadCompareImages(imageA, imageB);

      // 2️⃣ Trigger comparison
      const comparisonResult = await compareApi.runImageComparison(
        imageAPath,
        imageBPath
      );

      setResults(comparisonResult);
    } catch (err) {
      setError(err.message || "Failed to compare images");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>Image Comparison</h2>

      {/* Image Inputs */}
      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        <div>
          <label>Image A</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageAChange(e.target.files[0])}
          />
          {previewA && (
            <img
              src={previewA}
              alt="Preview A"
              style={{ width: 250, marginTop: 8 }}
            />
          )}
        </div>

        <div>
          <label>Image B</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageBChange(e.target.files[0])}
          />
          {previewB && (
            <img
              src={previewB}
              alt="Preview B"
              style={{ width: 250, marginTop: 8 }}
            />
          )}
        </div>
      </div>

      {/* Action */}
      <button onClick={handleCompare} disabled={loading}>
        {loading ? "Comparing..." : "Compare Images"}
      </button>

      {/* Error */}
      {error && (
        <div style={{ color: "red", marginTop: 16 }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* 1️⃣ Image A Container */}
          {results.image_a_metrics && (
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <h3 style={{ marginTop: 0, color: "#a5b4fc" }}>Image A Analysis</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <p><strong>Length:</strong> {results.image_a_metrics.length?.toFixed(2)}</p>
                <p><strong>Breadth:</strong> {results.image_a_metrics.breadth?.toFixed(2)}</p>
                <p><strong>Area:</strong> {results.image_a_metrics.area?.toFixed(2)}</p>
                <p><strong>Mean Intensity:</strong> {results.image_a_metrics.mean_intensity?.toFixed(2)}</p>
                <p><strong>Shape Irregularity:</strong> {results.image_a_metrics.shape_irregularity?.toFixed(3)}</p>
                <p><strong>Circularity:</strong> {results.image_a_metrics.circularity?.toFixed(3)}</p>
                <p><strong>Solidity:</strong> {results.image_a_metrics.solidity?.toFixed(3)}</p>
                <p><strong>Inflammation:</strong> {results.image_a_metrics.inflammation_detected ? "Yes" : "No"}</p>
                <p><strong>Morphology:</strong> {results.image_a_metrics.morphology_classification || "N/A"}</p>
              </div>
            </div>
          )}

          {/* 2️⃣ Image B Container */}
          {results.image_b_metrics && (
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <h3 style={{ marginTop: 0, color: "#fca5a5" }}>Image B Analysis</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <p><strong>Length:</strong> {results.image_b_metrics.length?.toFixed(2)}</p>
                <p><strong>Breadth:</strong> {results.image_b_metrics.breadth?.toFixed(2)}</p>
                <p><strong>Area:</strong> {results.image_b_metrics.area?.toFixed(2)}</p>
                <p><strong>Mean Intensity:</strong> {results.image_b_metrics.mean_intensity?.toFixed(2)}</p>
                <p><strong>Shape Irregularity:</strong> {results.image_b_metrics.shape_irregularity?.toFixed(3)}</p>
                <p><strong>Circularity:</strong> {results.image_b_metrics.circularity?.toFixed(3)}</p>
                <p><strong>Solidity:</strong> {results.image_b_metrics.solidity?.toFixed(3)}</p>
                <p><strong>Inflammation:</strong> {results.image_b_metrics.inflammation_detected ? "Yes" : "No"}</p>
                <p><strong>Morphology:</strong> {results.image_b_metrics.morphology_classification || "N/A"}</p>
              </div>
            </div>
          )}

          {/* 3️⃣ Overall Comparison Results */}
          <div style={{
            background: "rgba(0, 0, 0, 0.2)",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "10px" }}>Overall Comparison</h3>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "8px" }}>Length Change</td>
                  <td style={{ padding: "8px" }}>{results.length_change_percent.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>Width Change</td>
                  <td style={{ padding: "8px" }}>{results.width_change_percent.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>Intensity Change</td>
                  <td style={{ padding: "8px" }}>{results.intensity_change_percent.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>Color Change Score</td>
                  <td style={{ padding: "8px" }}>{results.color_change_score.toFixed(2)}</td>
                </tr>
                <tr style={{ fontSize: "1.1em", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <td style={{ padding: "12px 8px" }}><strong>Biological Status</strong></td>
                  <td style={{ padding: "12px 8px", color: "#4ade80" }}><strong>{results.overall_status}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};

export default ImageComparePanel;
