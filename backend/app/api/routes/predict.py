import io
import time

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import current_user_id
from app.db.database import get_db
from app.db.models import Prediction
from app.ml import predictor
from app.schemas.prediction import PredictionOut
from app.services import storage_service

router = APIRouter(tags=["predict"])


def shrink_for_storage(data: bytes, max_side: int = 1024) -> bytes:
    """Makes a smaller JPEG copy for storing, so big uploads do not slow down the Cloudinary upload.
    (The model still uses the original image.)"""
    img = Image.open(io.BytesIO(data)).convert("RGB")
    img.thumbnail((max_side, max_side))
    out = io.BytesIO()
    img.save(out, "JPEG", quality=85)
    return out.getvalue()


@router.post("/predict", response_model=PredictionOut)
def predict(
    file: UploadFile = File(...),
    user_id: str = Depends(current_user_id),
    db: Session = Depends(get_db),
):
    max_bytes = settings.max_upload_mb * 1024 * 1024
    data = file.file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(413, f"Image is larger than {settings.max_upload_mb} MB")

    try:  # make sure it is really an image
        Image.open(io.BytesIO(data)).verify()
    except Exception:
        raise HTTPException(400, "Please upload a valid image (JPG or PNG)")

    t0 = time.perf_counter()
    label, confidence, p = predictor.predict(data)
    t1 = time.perf_counter()
    url, image_id = storage_service.save_image(shrink_for_storage(data), user_id)
    t2 = time.perf_counter()

    row = Prediction(
        user_id=user_id,
        label=label,
        confidence=confidence,
        prob_pneumonia=p,
        image_url=url,
        image_id=image_id,
        filename=(file.filename or "")[:200],
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    t3 = time.perf_counter()

    # timing log: shows which step is slow (visible in the terminal / Render logs)
    print(f"[predict] size={len(data)/1024:.0f}KB model={t1-t0:.2f}s upload={t2-t1:.2f}s database={t3-t2:.2f}s")
    return row