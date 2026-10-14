"""
study_service.py
----------------
Filesystem-backed Study management service.

Storage layout:
backend/storage/studies/{study_id}/study.json
"""

from pathlib import Path
from typing import List, Dict
from uuid import uuid4
import json
import shutil

from app.core.config import STUDIES_DIR
from app.services.metadata_service import utc_now


class StudyService:
    def __init__(self):
        # Ensure base directory exists exactly once
        self.studies_dir: Path = STUDIES_DIR
        self.studies_dir.mkdir(parents=True, exist_ok=True)

    # ==================================================
    # CREATE
    # ==================================================

    def create_study(
        self,
        title: str,
        researcher_name: str,
        date: str,
        time: str,
    ) -> Dict:
        study_id = f"study_{uuid4().hex}"
        study_dir = self.studies_dir / study_id

        if study_dir.exists():
            raise ValueError("Study ID collision. Please retry.")

        study_dir.mkdir(parents=True, exist_ok=False)

        now = utc_now()  # SINGLE source of time

        study_data = {
            "study_id": study_id,
            "title": title.strip(),
            "researcherName": researcher_name.strip(),  # frontend contract
            "date": date,
            "time": time,
            "created_at": now,
            "updated_at": now,
        }

        self._write_json(study_dir / "study.json", study_data)
        return study_data

    # ==================================================
    # READ
    # ==================================================

    def list_studies(self) -> List[Dict]:
        studies: List[Dict] = []

        if not self.studies_dir.exists():
            return studies

        for study_dir in sorted(self.studies_dir.iterdir()):
            if not study_dir.is_dir():
                continue

            study_file = study_dir / "study.json"
            if study_file.exists():
                studies.append(self._read_json(study_file))

        return studies

    def get_study(self, study_id: str) -> Dict:
        study_file = self.studies_dir / study_id / "study.json"

        if not study_file.exists():
            raise FileNotFoundError(f"Study not found: {study_id}")

        return self._read_json(study_file)

    # ==================================================
    # UPDATE
    # ==================================================

    def update_study(self, study_id: str, updates: Dict) -> Dict:
        study_dir = self.studies_dir / study_id
        study_file = study_dir / "study.json"

        if not study_file.exists():
            raise FileNotFoundError(f"Study not found: {study_id}")

        study = self._read_json(study_file)

        allowed_fields = {
            "title",
            "researcherName",
            "date",
            "time",
        }

        updated = False

        for key, value in updates.items():
            if key in allowed_fields and value is not None:
                study[key] = value
                updated = True

        # 🔒 IMPORTANT: created_at MUST NEVER change
        if updated:
            study["updated_at"] = utc_now()

        self._write_json(study_file, study)
        return study

    # ==================================================
    # DELETE
    # ==================================================

    def delete_study(self, study_id: str) -> None:
        study_dir = self.studies_dir / study_id

        if not study_dir.exists():
            raise FileNotFoundError(f"Study not found: {study_id}")

        # 🔥 This is the ONLY correct delete for filesystem-backed studies
        shutil.rmtree(study_dir)

    # ==================================================
    # INTERNAL HELPERS
    # ==================================================

    def _write_json(self, path: Path, data: Dict) -> None:
        tmp_path = path.with_suffix(".tmp")

        # Atomic write to prevent partial corruption
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        tmp_path.replace(path)

    def _read_json(self, path: Path) -> Dict:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
