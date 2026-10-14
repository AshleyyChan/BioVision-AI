from fastapi import APIRouter, HTTPException
from typing import Dict, List

from app.services import specimen_service

router = APIRouter(
    prefix="/api/studies/{study_id}/specimens",
    tags=["Specimens"],
)

# --------------------------------------------------
# List specimens
# --------------------------------------------------
@router.get("", response_model=List[Dict])
def list_specimens(study_id: str):
    return specimen_service.list_specimens(study_id)


# --------------------------------------------------
# Create specimen
# --------------------------------------------------
@router.post("", response_model=Dict)
def create_specimen(study_id: str, payload: Dict):
    return specimen_service.create_specimen(study_id, payload)


# --------------------------------------------------
# Update specimen  ✅ REQUIRED
# --------------------------------------------------
@router.put("/{specimen_id}", response_model=Dict)
def update_specimen(
    study_id: str,
    specimen_id: str,
    payload: Dict,
):
    if not payload:
        raise HTTPException(
            status_code=400,
            detail="Update payload is empty",
        )

    return specimen_service.update_specimen(
        study_id,
        specimen_id,
        payload,
    )


# --------------------------------------------------
# Delete specimen  ✅ REQUIRED
# --------------------------------------------------
@router.delete("/{specimen_id}")
def delete_specimen(
    study_id: str,
    specimen_id: str,
):
    specimen_service.delete_specimen(
        study_id,
        specimen_id,
    )
    return {"status": "deleted"}
