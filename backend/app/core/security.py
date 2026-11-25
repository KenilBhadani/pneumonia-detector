"""Checks the Clerk login token that the frontend sends with every request."""
import jwt
from fastapi import Header, HTTPException
from jwt import PyJWKClient

from app.core.config import settings

_jwks_client = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        if not settings.clerk_issuer:
            raise HTTPException(500, "CLERK_ISSUER is not set on the server")
        _jwks_client = PyJWKClient(settings.clerk_jwks_url)
    return _jwks_client


def current_user_id(authorization: str = Header(default=None)) -> str:
    """Dependency: returns the Clerk user id (e.g. 'user_2abc...') or raises 401."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing login token")
    token = authorization.split(" ", 1)[1]

    try:
        key = _get_jwks_client().get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=settings.clerk_issuer.rstrip("/"),
            options={"verify_aud": False},
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Invalid or expired login token")

    # 'azp' = the website that asked for the token. Only accept our own frontend(s).
    azp = claims.get("azp")
    if azp and azp.rstrip("/") not in settings.origins:
        raise HTTPException(401, "Token was issued for a different site")

    return claims["sub"]
