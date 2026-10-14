"""
model_loader.py
---------------
Safe, optional ML model loader for BioVision.

Design:
- Classical CV works without ANY ML dependencies
- Deep learning models are OPTIONAL
- Missing libraries must NEVER crash the backend
"""

from pathlib import Path
from typing import Optional, Any

from app.core.config import (
    SEGMENTATION_MODEL_PATH,
    TREND_MODEL_PATH,
)
from app.core.logger import get_logger

logger = get_logger(__name__)


class ModelLoader:
    """
    Lazy and optional loader for ML/DL models.
    """

    _segmentation_model: Optional[Any] = None
    _trend_model: Optional[Any] = None

    # --------------------------------------------------
    # Segmentation model (U-Net / CNN)
    # --------------------------------------------------

    @classmethod
    def load_segmentation_model(cls):
        if cls._segmentation_model is not None:
            return cls._segmentation_model

        if not Path(SEGMENTATION_MODEL_PATH).exists():
            logger.info(
                "Segmentation model file not found. "
                "Using classical CV segmentation."
            )
            return None

        try:
            try:
                import torch
            except ModuleNotFoundError:
                logger.warning(
                    "PyTorch not installed. "
                    "Skipping DL segmentation model."
                )
                return None

            cls._segmentation_model = torch.load(
                SEGMENTATION_MODEL_PATH,
                map_location="cpu"
            )
            cls._segmentation_model.eval()

            logger.info("Segmentation model loaded successfully")
            return cls._segmentation_model

        except Exception as e:
            logger.error(f"Segmentation model load failed: {e}")
            return None

    # --------------------------------------------------
    # Trend / stress prediction model
    # --------------------------------------------------

    @classmethod
    def load_trend_model(cls):
        if cls._trend_model is not None:
            return cls._trend_model

        if not Path(TREND_MODEL_PATH).exists():
            logger.info(
                "Trend model file not found. "
                "Using rule-based trend analysis."
            )
            return None

        try:
            try:
                import joblib
            except ModuleNotFoundError:
                logger.warning(
                    "joblib not installed. "
                    "Skipping ML trend model."
                )
                return None

            cls._trend_model = joblib.load(TREND_MODEL_PATH)

            logger.info("Trend model loaded successfully")
            return cls._trend_model

        except Exception as e:
            logger.error(f"Trend model load failed: {e}")
            return None
