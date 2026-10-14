"""
specimen_service.py
-------------------
Service layer for Specimen lifecycle.

Responsibilities:
- Create specimens within a study
- List specimens for a study
- Update specimen metadata
- Delete specimens and ALL associated data

❌ No FastAPI code
❌ No ML
❌ No image logic
"""

import os
from typing import List, Dict

from app.core.config import STORAGE_ROOT
from app.services.storage_service import (
    ensure_dir,
    read_json,
    write_json,
)
from app.services.metadata_service import new_id, utc_now

# -------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------


def _study_path(study_id: str) -> str:
    return os.path.join(STORAGE_ROOT, "studies", study_id)


def _specimens_root(study_id: str) -> str:
    return os.path.join(_study_path(study_id), "specimens")


def _specimen_path(study_id: str, specimen_id: str) -> str:
    return os.path.join(_specimens_root(study_id), specimen_id)


def _specimen_metadata_path(study_id: str, specimen_id: str) -> str:
    return os.path.join(
        _specimen_path(study_id, specimen_id),
        "specimen.json",
    )


# -------------------------------------------------------------------
# Public API
# -------------------------------------------------------------------


def list_specimens(study_id: str) -> List[Dict]:
    """
    Return all specimens belonging to a study.
    """

    specimens_dir = _specimens_root(study_id)

    if not os.path.exists(specimens_dir):
        return []

    specimens: List[Dict] = []

    for specimen_id in os.listdir(specimens_dir):
        meta_path = _specimen_metadata_path(
            study_id, specimen_id
        )

        if not os.path.isfile(meta_path):
            continue

        metadata = read_json(meta_path)
        if metadata:
            specimens.append(metadata)

    # Stable ordering for UI
    specimens.sort(key=lambda s: s.get("created_at", ""))

    return specimens


def create_specimen(
    study_id: str,
    data: Dict,
) -> Dict:
    """
    Create a new specimen under a study.
    """

    study_dir = _study_path(study_id)
    if not os.path.exists(study_dir):
        raise FileNotFoundError(
            f"Study not found: {study_id}"
        )

    specimen_id = new_id()

    specimen_metadata = {
        "specimen_id": specimen_id,
        "study_id": study_id,
        "name": data.get("name", "Unnamed Specimen"),
        "description": data.get("description", ""),
        "created_at": utc_now(),
    }

    specimen_dir = _specimen_path(study_id, specimen_id)

    # Ensure specimen directory ONLY
    ensure_dir(specimen_dir)

    # Persist metadata
    write_json(
        _specimen_metadata_path(study_id, specimen_id),
        specimen_metadata,
    )

    return specimen_metadata


def update_specimen(
    study_id: str,
    specimen_id: str,
    data: Dict,
) -> Dict:
    """
    Update specimen metadata.
    Only allows safe, explicit fields.
    """

    meta_path = _specimen_metadata_path(
        study_id, specimen_id
    )

    if not os.path.isfile(meta_path):
        raise FileNotFoundError(
            f"Specimen not found: {specimen_id}"
        )

    metadata = read_json(meta_path)
    if not metadata:
        raise RuntimeError(
            f"Failed to load metadata for specimen {specimen_id}"
        )

    # Editable fields
    if "name" in data:
        metadata["name"] = data["name"]

    if "description" in data:
        metadata["description"] = data["description"]

    metadata["updated_at"] = utc_now()

    write_json(meta_path, metadata)

    return metadata


def delete_specimen(
    study_id: str,
    specimen_id: str,
):
    """
    Permanently delete a specimen and ALL associated data:
    - days
    - images
    - analysis
    """

    specimen_dir = _specimen_path(
        study_id, specimen_id
    )

    if not os.path.isdir(specimen_dir):
        raise FileNotFoundError(
            f"Specimen not found: {specimen_id}"
        )

    # Recursive filesystem delete
    for root, dirs, files in os.walk(specimen_dir, topdown=False):
        for f in files:
            os.remove(os.path.join(root, f))
        for d in dirs:
            os.rmdir(os.path.join(root, d))

    os.rmdir(specimen_dir)
