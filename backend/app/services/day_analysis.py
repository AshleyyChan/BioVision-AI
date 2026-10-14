"""
day_analysis.py
---------------
Runs SINGLE-DAY prostate gland analysis.

Pipeline:
image →
    preprocessing →
    segmentation →
    feature extraction →
    biological interpretation →
    structured results
"""

from pathlib import Path
from typing import Union, Dict

from app.ml.preprocessing import ImagePreprocessor
from app.ml.segmentation import ProstateSegmenter
from app.ml.feature_extraction import FeatureExtractor


class DayAnalysisService:
    """
    Orchestrates per-day prostate gland analysis.
    """

    def __init__(self):
        self.preprocessor = ImagePreprocessor()
        self.segmenter = ProstateSegmenter()
        self.extractor = FeatureExtractor()

    # --------------------------------------------------
    # Public API
    # --------------------------------------------------

    def analyze(self, image_path: Union[str, Path]) -> Dict:
        """
        Run complete analysis for a single day.
        """

        image_path = Path(image_path)

        if not image_path.exists():
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        # ---------------- Preprocessing ----------------
        print(f"DayAnalysisService: Preprocessing {image_path}...")
        image_rgb = self.preprocessor.preprocess(image_path)
        
        # Convert to grayscale for segmentation & feature extraction
        import cv2
        gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)

        # ---------------- Segmentation -----------------
        print("DayAnalysisService: Segmenting...")
        mask = None

        from app.ml.model_loader import ModelLoader
        dl_model = ModelLoader.load_segmentation_model()
        if dl_model is not None:
            try:
                import torch
                # (1, 3, H, W) float tensor normalized to [0, 1]
                tensor_img = (
                    torch.tensor(image_rgb, dtype=torch.float32)
                    .permute(2, 0, 1)
                    .unsqueeze(0)
                    / 255.0
                )
                with torch.no_grad():
                    pred_logits = dl_model(tensor_img)
                    pred_bin = (
                        (torch.sigmoid(pred_logits) > 0.5)
                        .squeeze()
                        .cpu()
                        .numpy()
                        .astype(np.uint8)
                        * 255
                    )
                    if pred_bin.sum() > 0:
                        mask = pred_bin
                        print("DayAnalysisService: Used Deep Learning U-Net segmentation.")
            except Exception as e:
                print(f"DL segmentation fallback to classical CV: {e}")

        if mask is None:
            mask = self.segmenter.segment(gray)

        if mask is None or mask.sum() == 0:
            raise ValueError("Segmentation failed: empty mask")

        # ---------------- Feature extraction -----------
        print("DayAnalysisService: Extracting features...")
        features = self.extractor.extract(
            gray_image=gray,
            mask=mask
        )

        if not features or not isinstance(features, dict):
            raise ValueError("Feature extraction failed")

        # ---------------- Canonical output --------------
        print("DayAnalysisService: Done.")
        return {
            # Primary geometry
            "length": features.get("length"),
            "breadth": features.get("breadth"),
            "area": features.get("area"),

            # Intensity metrics
            "mean_intensity": features.get("mean_intensity"),
            "intensity_std": features.get("intensity_std"),

            # Shape metrics
            "shape_irregularity": features.get("shape_irregularity"),
            "circularity": features.get("circularity"),
            "solidity": features.get("solidity"),
        }
