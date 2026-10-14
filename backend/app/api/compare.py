"""
compare.py
----------
API routes for image-to-image comparison.

Used for:
- Visual comparison between two prostate gland images
- Quantitative difference analysis
- Stress-related morphological change detection

❌ No image processing logic here
✅ Delegates to service layer
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path

from app.services.image_compare import ImageCompareService

router = APIRouter(prefix="/api/compare", tags=["Image Comparison"])

compare_service = ImageCompareService()

# -------------------------------------------------------------------
# Request Models
# -------------------------------------------------------------------

class ImageCompareRequest(BaseModel):
    imagePathA: str
    imagePathB: str


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------

@router.post("")
@router.post("/")
def compare_images(payload: ImageCompareRequest):
    """
    Compare two prostate gland images using backend-accessible paths.
    """

    try:
        # Helper to resolve paths similar to analyze.py
        def resolve_path(raw_path: str):
            raw_path = raw_path.strip()
            print(f"compare_images received path: '{raw_path}'")
            
            # Handle full URLs
            if "://" in raw_path:
                try:
                    if "/uploads/" in raw_path:
                        _, rel_path = raw_path.split("/uploads/", 1)
                        from app.core.config import UPLOAD_DIR
                        return UPLOAD_DIR / rel_path
                except ValueError:
                    pass
            
            # Handle /uploads/ prefix
            if raw_path.startswith("/uploads/"):
                rel_path = raw_path[len("/uploads/"):]
                from app.core.config import UPLOAD_DIR
                return UPLOAD_DIR / rel_path
                
            return Path(raw_path).resolve()

        path_a = resolve_path(payload.imagePathA)
        path_b = resolve_path(payload.imagePathB)
        
        print(f"Resolving comparison paths:\n A: {path_a}\n B: {path_b}")

        # ✅ REQUIRED: explicit existence checks
        if not path_a.exists():
            print(f"Failed to find image A at {path_a}")
            raise FileNotFoundError(f"Image A not found: {path_a}")

        if not path_b.exists():
            print(f"Failed to find image B at {path_b}")
            raise FileNotFoundError(f"Image B not found: {path_b}")

        # ✅ REQUIRED: prevent meaningless self-comparison
        if path_a == path_b:
            raise ValueError("Cannot compare the same image with itself")

        # Delegate to service layer
        result = compare_service.compare(path_a, path_b)

        # Frontend expects a flat result object
        return result

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        # Internal logging
        import traceback
        traceback.print_exc()
        print("Image comparison error:", e)

        raise HTTPException(
            status_code=500,
            detail=f"Internal error during image comparison: {e}"
        )
