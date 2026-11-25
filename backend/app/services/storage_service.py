"""Saves and deletes uploaded images (Cloudinary, or a local folder for development)."""
import io
import os
import uuid
from urllib.parse import urlparse

from app.core.config import settings

LOCAL_DIR = "uploads"
USE_CLOUDINARY = bool(settings.cloudinary_url)

if USE_CLOUDINARY:
    import cloudinary

    u = urlparse(settings.cloudinary_url)  # cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    cloudinary.config(cloud_name=u.hostname, api_key=u.username, api_secret=u.password, secure=True)


def save_image(data: bytes, user_id: str) -> tuple[str, str]:
    """Returns (public_url, image_id)."""
    if USE_CLOUDINARY:
        import cloudinary.uploader

        res = cloudinary.uploader.upload(io.BytesIO(data), folder=f"xray/{user_id}", resource_type="image")
        return res["secure_url"], res["public_id"]

    os.makedirs(LOCAL_DIR, exist_ok=True)
    name = f"{uuid.uuid4().hex}.jpg"
    with open(os.path.join(LOCAL_DIR, name), "wb") as f:
        f.write(data)
    return f"/uploads/{name}", name


def delete_image(image_id: str) -> None:
    try:
        if USE_CLOUDINARY:
            import cloudinary.uploader

            cloudinary.uploader.destroy(image_id)
        else:
            path = os.path.join(LOCAL_DIR, os.path.basename(image_id))
            if os.path.exists(path):
                os.remove(path)
    except Exception as e:  # a failed image delete should not block deleting the record
        print("Could not delete image:", e)
