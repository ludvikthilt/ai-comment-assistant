import os
import pickle
import logging
from concurrent.futures import ThreadPoolExecutor
import numpy as np

logger = logging.getLogger(__name__)
MODELS = {}

def load_models():
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
            logger.info(f"Modèle chargé: {filename}")
    logger.info("Tous les modèles sont chargés en mémoire")

def preprocess_text(text: str) -> str:
    import re
    text = text.lower().strip()
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'[^a-zA-ZÀ-ÿ0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def predict_sentiment(text: str) -> tuple[str, float]:
    model = MODELS["sentiment_model"]
    encoder = MODELS["sentiment_encoder"]
    processed = preprocess_text(text)
    prediction = model.predict([processed])[0]
    probabilities = model.predict_proba([processed])[0]
    label = encoder.inverse_transform([prediction])[0]
    confidence = float(np.max(probabilities))
    return label, confidence

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

def predict_comment(text: str) -> dict:
    with ThreadPoolExecutor(max_workers=2) as executor:
        sentiment_future = executor.submit(predict_sentiment, text)
        question_future = executor.submit(predict_question, text)
        sentiment, sentiment_conf = sentiment_future.result()
        is_question, question_conf = question_future.result()
    return {
        "sentiment": sentiment,
        "sentiment_confidence": round(sentiment_conf, 4),
        "is_question": is_question,
        "question_confidence": round(question_conf, 4),
    }
