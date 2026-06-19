from pydantic import BaseModel

class CommentRequest(BaseModel):
    text: str

class CommentResponse(BaseModel):
    sentiment: str
    sentiment_confidence: float
    is_question: bool
    question_confidence: float
