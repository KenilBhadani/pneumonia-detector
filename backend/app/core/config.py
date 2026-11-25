"""All settings live here. Values come from environment variables or the .env file."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Pneumonia Detector API"

    # MySQL, format: mysql+pymysql://USER:PASSWORD@HOST:3306/DB_NAME
    database_url: str = "mysql+pymysql://root:password@localhost:3306/pneumonia_db"
    db_ssl: bool = False  # set true for cloud MySQL that requires SSL (TiDB, Aiven)

    # Clerk "Frontend API URL", e.g. https://your-name-12.clerk.accounts.dev
    clerk_issuer: str = ""

    # Websites allowed to call this API, comma separated
    allowed_origins: str = "http://localhost:5173"

    # Leave empty to save images in a local folder (dev only)
    cloudinary_url: str = ""

    # Trained model + prediction settings
    ml_model_path: str = "ml_model/pneumonia_model.keras"
    threshold: float = 0.5
    max_upload_mb: int = 10

    @property
    def origins(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def clerk_jwks_url(self) -> str:
        return f"{self.clerk_issuer.rstrip('/')}/.well-known/jwks.json"


settings = Settings()
