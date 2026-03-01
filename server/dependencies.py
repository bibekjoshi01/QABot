from fastapi import Header, HTTPException

from server.config import get_settings

settings = get_settings()


async def api_key_auth(api_key: str = Header(..., alias=settings.api_auth_key_name)):
    """Raise 401 if API key is invalid"""
    if api_key != settings.api_auth_secret:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return True
