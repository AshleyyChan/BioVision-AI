from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
import shutil

from app.core.config import UPLOAD_DIR
from app.utils.validators import validate_image_file

router = APIRouter(
    prefix="/api/image-compare/upload",
    tags=["Image Compare"]
)


@router.post("")
@router.post("/")
async def upload_compare_images(
    imageA: UploadFile = File(...),
    imageB: UploadFile = File(...),
):
    """
    Upload TWO images for Image Compare tool.
    NO study / specimen / day.
    """

    # -----------------------------
    # Validation
    # -----------------------------
    for image in (imageA, imageB):
        if not image.filename:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file has no filename"
            )
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Only image files allowed"
        )
        try:
            validate_image_file(image.filename)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=str(e)
        )


    # -----------------------------
    # Storage directory
    # -----------------------------
    upload_dir = UPLOAD_DIR / "image_compare"
    upload_dir.mkdir(parents=True, exist_ok=True)

    def _save_image(image: UploadFile) -> Path:
        ext = Path(image.filename).suffix.lower()
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = upload_dir / filename

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
        except Exception as e:
            raise RuntimeError(f"Failed to save file: {image.filename}") from e
        finally:
            image.file.close()

        return file_path.resolve()

    try:
        path_a = _save_image(imageA)
        path_b = _save_image(imageB)
    except Exception as e:
        print("Upload error:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to save uploaded image"
        )

    return {
        "imageAPath": str(path_a),
        "imageBPath": str(path_b),
    }
