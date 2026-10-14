"""
logger.py
---------
Centralized logging configuration for BioVision backend.

Design goals:
- Clean console output for development
- File-based logs for experiments & analysis
- No duplicated log handlers
- Easy to import anywhere
"""

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

from app.core.config import BASE_DIR, LOG_LEVEL, DEBUG

# ------------------------------------------------------------------
# LOG DIRECTORY
# ------------------------------------------------------------------

LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "biovision.log"

# ------------------------------------------------------------------
# LOG FORMATTERS
# ------------------------------------------------------------------

CONSOLE_FORMAT = logging.Formatter(
    "[%(levelname)s] %(message)s"
)

FILE_FORMAT = logging.Formatter(
    "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# ------------------------------------------------------------------
# LOGGER FACTORY
# ------------------------------------------------------------------

def get_logger(name: str) -> logging.Logger:
    """
    Create or retrieve a configured logger.

    Usage:
        logger = get_logger(__name__)
        logger.info("Message")
    """

    logger = logging.getLogger(name)

    # Prevent duplicate handlers
    if logger.handlers:
        return logger

    logger.setLevel(LOG_LEVEL)

    # -------------------------
    # Console handler
    # -------------------------
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(CONSOLE_FORMAT)

    if DEBUG:
        console_handler.setLevel(logging.DEBUG)
    else:
        console_handler.setLevel(logging.INFO)

    # -------------------------
    # File handler (rotating)
    # -------------------------
    file_handler = RotatingFileHandler(
        LOG_FILE,
        maxBytes=5 * 1024 * 1024,   # 5 MB
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setFormatter(FILE_FORMAT)
    file_handler.setLevel(logging.INFO)

    # -------------------------
    # Attach handlers
    # -------------------------
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    logger.propagate = False

    return logger
