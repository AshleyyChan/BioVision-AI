"""
config.py
---------
Central configuration for the BioVision backend.
"""

from pathlib import Path
import os

# ------------------------------------------------------------------
# BASE PATHS (STABLE)
# ------------------------------------------------------------------

# backend/app/core/config.py → backend/
BASE_DIR = Path(__file__).resolve()
while BASE_DIR.name != "backend":
    BASE_DIR = BASE_DIR.parent

APP_DIR = BASE_DIR / "app"

# ------------------------------------------------------------------
# ENVIRONMENT
# ------------------------------------------------------------------

ENV = os.getenv("ENV", "development")
DEBUG = ENV == "development"

# ------------------------------------------------------------------
# SERVER CONFIG
# ------------------------------------------------------------------

APP_NAME = "BioVision Backend"
API_PREFIX = "/api"

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# ------------------------------------------------------------------
# STORAGE PATHS (CANONICAL)
# ------------------------------------------------------------------
# 🔑 Storage lives OUTSIDE application code

STORAGE_ROOT = BASE_DIR / "storage"

UPLOAD_DIR = STORAGE_ROOT / "uploads"
RESULTS_DIR = STORAGE_ROOT / "results"
STUDIES_DIR = STORAGE_ROOT / "studies"

# ✅ Guaranteed creation at import time
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
STUDIES_DIR.mkdir(parents=True, exist_ok=True)

# ------------------------------------------------------------------
# IMAGE PROCESSING
# ------------------------------------------------------------------

IMAGE_SIZE = (512, 512)

ALLOWED_IMAGE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".tif",
    ".tiff",
}

# ------------------------------------------------------------------
# ML MODEL PATHS
# ------------------------------------------------------------------

MODELS_DIR = APP_DIR / "ml" / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

SEGMENTATION_MODEL_PATH = MODELS_DIR / "segmentation_model.pth"
TREND_MODEL_PATH = MODELS_DIR / "trend_model.pkl"

# ------------------------------------------------------------------
# ANALYSIS PARAMETERS
# ------------------------------------------------------------------

PIXEL_TO_MM_RATIO = 0.01  # 100 pixels = 1mm
AREA_CHANGE_THRESHOLD = 0.20
INTENSITY_VARIATION_THRESHOLD = 0.25
SHAPE_IRREGULARITY_THRESHOLD = 0.30

# ------------------------------------------------------------------
# LOGGING
# ------------------------------------------------------------------

LOG_LEVEL = "DEBUG" if DEBUG else "INFO"

# ------------------------------------------------------------------
# EXPORTS
# ------------------------------------------------------------------

__all__ = [
    "APP_NAME",
    "API_PREFIX",
    "HOST",
    "PORT",
    "DEBUG",

    # storage
    "STORAGE_ROOT",
    "UPLOAD_DIR",
    "RESULTS_DIR",
    "STUDIES_DIR",

    # imaging
    "IMAGE_SIZE",
    "ALLOWED_IMAGE_EXTENSIONS",

    # ML
    "MODELS_DIR",
    "SEGMENTATION_MODEL_PATH",
    "TREND_MODEL_PATH",

    # thresholds
    "PIXEL_TO_MM_RATIO",
    "AREA_CHANGE_THRESHOLD",
    "INTENSITY_VARIATION_THRESHOLD",
    "SHAPE_IRREGULARITY_THRESHOLD",

    # logging
    "LOG_LEVEL",
]
