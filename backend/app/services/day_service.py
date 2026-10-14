import os
import uuid
from datetime import datetime
from typing import List, Dict

from app.core.config import STORAGE_ROOT
from app.services.storage_service import (
    ensure_dir,
    read_json,
    write_json,
)

# -------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------

def _specimen_path(study_id: str, specimen_id: str) -> str:
    return os.path.join(
        STORAGE_ROOT,
        "studies",
        study_id,
        "specimens",
        specimen_id,
    )


def _days_root(study_id: str, specimen_id: str) -> str:
    return os.path.join(
        _specimen_path(study_id, specimen_id),
        "days",
    )


def _day_path(study_id: str, specimen_id: str, day_id: str) -> str:
    return os.path.join(
        _days_root(study_id, specimen_id),
        day_id,
    )


def _day_metadata_path(
    study_id: str,
    specimen_id: str,
    day_id: str,
) -> str:
    return os.path.join(
        _day_path(study_id, specimen_id, day_id),
        "day.json",
    )


# -------------------------------------------------------------------
# Public API
# -------------------------------------------------------------------

def list_days(study_id: str, specimen_id: str) -> List[Dict]:
    days_dir = _days_root(study_id, specimen_id)
    if not os.path.exists(days_dir):
        return []

    days: List[Dict] = []

    for day_id in os.listdir(days_dir):
        meta_path = _day_metadata_path(study_id, specimen_id, day_id)
        if not os.path.isfile(meta_path):
            continue

        metadata = read_json(meta_path)
        if metadata:
            days.append(metadata)

    days.sort(key=lambda d: d.get("created_at", ""))
    return days


def create_day(study_id: str, specimen_id: str, data: Dict) -> Dict:
    specimen_dir = _specimen_path(study_id, specimen_id)
    if not os.path.exists(specimen_dir):
        raise FileNotFoundError(f"Specimen not found: {specimen_id}")

    day_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    day_metadata = {
        "day_id": day_id,
        "study_id": study_id,
        "specimen_id": specimen_id,
        "label": data.get("label"),
        "concentration": data.get("concentration"),
        "level": data.get("level"),
        "unit": data.get("unit") or "mM",
        "temperature": data.get("temperature"),
        "treatment_type": data.get("treatment_type"),
        "image_path": None,
        "analysis": None,
        "created_at": now,
        "updated_at": now,
    }

    ensure_dir(_days_root(study_id, specimen_id))
    ensure_dir(_day_path(study_id, specimen_id, day_id))

    write_json(
        _day_metadata_path(study_id, specimen_id, day_id),
        day_metadata,
    )

    return day_metadata


def update_day(
    study_id: str,
    specimen_id: str,
    day_id: str,
    data: Dict,
) -> Dict:
    meta_path = _day_metadata_path(study_id, specimen_id, day_id)

    if not os.path.isfile(meta_path):
        raise FileNotFoundError(f"Day not found: {day_id}")

    existing = read_json(meta_path)
    if not existing:
        raise FileNotFoundError(f"Day metadata missing: {day_id}")

    allowed_fields = {
        "label",
        "concentration",
        "level",
        "unit",
        "temperature",
        "treatment_type",
        "image_path",
        "analysis",
    }

    for key, value in data.items():
        if key in allowed_fields:
            existing[key] = value

    existing["updated_at"] = datetime.utcnow().isoformat()
    write_json(meta_path, existing)

    return existing


def delete_day(
    study_id: str,
    specimen_id: str,
    day_id: str,
) -> None:
    day_dir = _day_path(study_id, specimen_id, day_id)

    if not os.path.isdir(day_dir):
        raise FileNotFoundError(f"Day not found: {day_id}")

    # Remove all contents safely
    for root, _, files in os.walk(day_dir, topdown=False):
        for f in files:
            os.remove(os.path.join(root, f))
        os.rmdir(root)

    days_dir = _days_root(study_id, specimen_id)
    if os.path.exists(days_dir) and not os.listdir(days_dir):
        os.rmdir(days_dir)
