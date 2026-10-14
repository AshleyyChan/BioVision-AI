from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
import shutil
import uuid

from app.core.config import UPLOAD_DIR
from app.utils.validators import validate_image_file
from app.services.day_service import update_day

router = APIRouter(prefix="/api/upload", tags=["Specimen Upload"])


@router.post("")
@router.post("/")
async def upload_specimen_image(
    study_id: str = Form(...),
    specimen_id: str = Form(...),
    day_id: str = Form(...),
    image: UploadFile = File(...),
):
    # --------------------------------------------------
    # Validate filename & content type
    # --------------------------------------------------
    if not image.filename:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file has no filename",
        )

    validate_image_file(image.filename)

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed",
        )

    # --------------------------------------------------
    # Build storage path
    # --------------------------------------------------
    upload_dir = (
        UPLOAD_DIR
        / "studies"
        / study_id
        / "specimens"
        / specimen_id
        / "days"
        / day_id
    )

    upload_dir.mkdir(parents=True, exist_ok=True)

    # --------------------------------------------------
    # Generate safe filename
    # --------------------------------------------------
    ext = Path(image.filename).suffix.lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = upload_dir / filename

    # --------------------------------------------------
    # Save image (CRITICAL FIX)
    # --------------------------------------------------
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    finally:
        image.file.close()  # 🔑 prevents content-length mismatch

    # --------------------------------------------------
    # Public path (USED BY FRONTEND)
    # --------------------------------------------------
    public_image_path = f"/uploads/studies/{study_id}/specimens/{specimen_id}/days/{day_id}/{filename}"

    # --------------------------------------------------
    # Persist image_path into day.json (CANONICAL)
    # --------------------------------------------------
    try:
        update_day(
            study_id=study_id,
            specimen_id=specimen_id,
            day_id=day_id,
            data={"image_path": public_image_path},
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=400,
            detail="Associated day not found for image upload",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    # --------------------------------------------------
    # Response
    # --------------------------------------------------
    return {
        "status": "ok",
        "imagePath": public_image_path,
    }
