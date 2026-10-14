from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# API routers
from app.api import (
    upload,
    analyze,
    compare,
    health,
    image_compare_upload,
    study,
    specimen,
    day,
)

from app.core.logger import get_logger
from app.core.config import UPLOAD_DIR

logger = get_logger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title="BioVision Backend",
        description="Backend for longitudinal biological image analysis",
        version="1.0.0",
    )

    # --------------------------------------------------
    # CORS (Frontend-safe)
    # --------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --------------------------------------------------
    # 🔑 STATIC FILES — MUST EXIST BEFORE REQUESTS
    # --------------------------------------------------
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    app.mount(
        "/uploads",
        StaticFiles(directory=UPLOAD_DIR),
        name="uploads",
    )

    # --------------------------------------------------
    # API ROUTES
    # --------------------------------------------------
    app.include_router(health.router)
    app.include_router(study.router)
    app.include_router(specimen.router)
    app.include_router(day.router)

    app.include_router(upload.router)
    app.include_router(analyze.router)
    app.include_router(compare.router)
    app.include_router(image_compare_upload.router)

    logger.info("BioVision backend initialized")

    return app


app = create_app()
