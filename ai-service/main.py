# ai-service/main.py
import os
import pickle
import logging
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Chargement des modèles au démarrage ─────────────────────────────────────
MODELS = {}

def load_models():
    """Charge les modèles .pkl une seule fois au démarrage."""
    model_path = os.getenv("MODEL_PATH", "models/")
    
    files = {
        "sentiment_model": "best_model_sentiment.pkl",
        "sentiment_encoder": "label_encoder_sentiment.pkl",
        "question_model": "best_model_questions.pkl",
        "question_encoder": "label_encoder_questions.pkl",
    }
    
    for key, filename in files.items():
        filepath = os.path.join(model_path, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Modèle requis manquant: {filepath}")
        with open(filepath, "rb") as f:
            MODELS[key] = pickle.load(f)
            logger.info(f"✅ Modèle chargé: {filename}")
    
    logger.info("🚀 Tous les modèles sont chargés en mémoire")

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    yield
    # Cleanup si nécessaire
    MODELS.clear()

app = FastAPI(
    title="Facebook Comment AI Service",
    description="Service d'analyse de sentiments et détection de questions",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schémas Pydantic ────────────────────────────────────────────────────────
class CommentRequest(BaseModel):
    text: str

class CommentResponse(BaseModel):
    sentiment: str
    sentiment_confidence: float
    is_question: bool
    question_confidence: float

class HealthResponse(BaseModel):
    status: str
    models_loaded: bool

# ─── Prétraitement ───────────────────────────────────────────────────────────
def preprocess_text(text: str) -> str:
    """Nettoyage basique du texte (doit correspondre au notebook d'entraînement)."""
    import re
    text = text.lower().strip()
    text = re.sub(r'http\S+|www\S+', '', text)  # Supprime URLs
    text = re.sub(r'@\w+', '', text)  # Supprime mentions
    text = re.sub(r'[^a-zA-ZÀ-ÿ0-9\s]', ' ', text)  # Garde alphanum + accents
    text = re.sub(r'\s+', ' ', text)  # Normalise espaces
    return text.strip()

# ─── Prédiction Sentiment ────────────────────────────────────────────────────
def predict_sentiment(text: str) -> tuple[str, float]:
    model = MODELS["sentiment_model"]
    encoder = MODELS["sentiment_encoder"]
    
    processed = preprocess_text(text)
    # Si le modèle attend un vecteur, adapter selon le pipeline du notebook
    prediction = model.predict([processed])[0]
    probabilities = model.predict_proba([processed])[0]
    
    label = encoder.inverse_transform([prediction])[0]
    confidence = float(np.max(probabilities))
    
    return label, confidence

# ─── Prédiction Question ───────────────────────────────────────────────────
def predict_question(text: str) -> tuple[bool, float]:
    model = MODELS["question_model"]
    encoder = MODELS["question_encoder"]
    
    processed = preprocess_text(text)
    prediction = model.predict([processed])[0]
    probabilities = model.predict_proba([processed])[0]
    
    label = encoder.inverse_transform([prediction])[0]
    confidence = float(np.max(probabilities))
    
    is_question = label.lower() in ("question", "oui", "yes", "1", "true")
    return is_question, confidence

# ─── Endpoints ───────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        models_loaded=len(MODELS) == 4
    )

@app.post("/predict/comment", response_model=CommentResponse)
async def predict_comment(request: CommentRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Le texte ne peut pas être vide")
    
    try:
        # Exécution parallèle des deux prédictions
        with ThreadPoolExecutor(max_workers=2) as executor:
            sentiment_future = executor.submit(predict_sentiment, request.text)
            question_future = executor.submit(predict_question, request.text)
            
            sentiment, sentiment_conf = sentiment_future.result()
            is_question, question_conf = question_future.result()
        
        logger.info(f"Analyse: sentiment={sentiment}({sentiment_conf:.2f}), question={is_question}({question_conf:.2f})")
        
        return CommentResponse(
            sentiment=sentiment,
            sentiment_confidence=round(sentiment_conf, 4),
            is_question=is_question,
            question_confidence=round(question_conf, 4),
        )
        
    except Exception as e:
        logger.error(f"Erreur prédiction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur d'analyse: {str(e)}")

@app.get("/")
async def root():
    return {
        "service": "Facebook Comment AI",
        "version": "1.0.0",
        "models_loaded": list(MODELS.keys()),
        "endpoints": ["/health", "/predict/comment"]
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)