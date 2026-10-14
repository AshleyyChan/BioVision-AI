"""
storage_service.py
------------------
Low-level filesystem utilities.

Responsibilities:
- Directory creation
- Safe, atomic JSON read/write

❌ No domain logic
❌ No study/specimen/day knowledge
❌ No ML
"""

import json
import os
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional

from app.core.config import STORAGE_ROOT


# ------------------------------------------------------------------
# Directory helpers
# ------------------------------------------------------------------

def ensure_dir(path: str | os.PathLike) -> None:
    """
    Ensure a directory exists.
    """
    os.makedirs(path, exist_ok=True)


# ------------------------------------------------------------------
# JSON helpers
# ------------------------------------------------------------------

def read_json(path: str | Path) -> Optional[Dict[str, Any]]:
    """
    Safely read a JSON file.

    Returns:
    - dict if successful
    - None if file does not exist

    Raises:
    - ValueError if JSON is malformed
    """
    path = Path(path)

    if not path.exists():
        return None

    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Invalid JSON in file: {path}"
        ) from e


def write_json(path: str | Path, data: Dict[str, Any]) -> None:
    """
    Safely write a JSON file using an atomic write.

    Guarantees:
    - File is never left half-written
    - Data is flushed to disk before replace
    """
    path = Path(path)
    ensure_dir(path.parent)

    # Write to a temp file in the same directory
    with tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        dir=path.parent,
        delete=False
    ) as tmp:
        json.dump(data, tmp, indent=2)
        tmp.flush()
        os.fsync(tmp.fileno())
        temp_name = tmp.name

    # Atomic replace
    os.replace(temp_name, path)
