from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.predictor import predict_comment

router = APIRouter(prefix="/predict", tags=["Prediction"])

class CommentRequest(BaseModel):
    text: str

class CommentResponse(BaseModel):
    sentiment: str
    sentiment_confidence: float
    is_question: bool
    question_confidence: float

@router.post("/comment", response_model=CommentResponse)
async def predict_comment_endpoint(request: CommentRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Le texte ne peut pas être vide")
    return predict_comment(request.text)
