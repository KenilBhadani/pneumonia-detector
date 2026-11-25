import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings
from app.db import models  # noqa: F401  (needed so the tables are registered)
from app.db.database import Base, engine
from app.ml import predictor
from app.services import storage_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)  # creates the MySQL table if it does not exist
    predictor.load_model()            # load the model once at startup
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

if not storage_service.USE_CLOUDINARY:  # dev only: serve locally saved images
    os.makedirs(storage_service.LOCAL_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=storage_service.LOCAL_DIR), name="uploads")
