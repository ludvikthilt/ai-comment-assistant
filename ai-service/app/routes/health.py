from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/health", tags=["Health"])

class HealthResponse(BaseModel):
    status: str
    models_loaded: bool

@router.get("", response_model=HealthResponse)
async def health_check():
    from main import MODELS
    return HealthResponse(status="healthy", models_loaded=len(MODELS) == 4)
