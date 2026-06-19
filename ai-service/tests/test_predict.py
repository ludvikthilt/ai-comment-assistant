import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_predict_comment():
    response = client.post("/predict/comment", json={"text": "J'adore ce produit, c'est génial !"})
    assert response.status_code == 200
    data = response.json()
    assert "sentiment" in data
    assert "sentiment_confidence" in data
    assert "is_question" in data
    assert "question_confidence" in data

def test_predict_empty_text():
    response = client.post("/predict/comment", json={"text": ""})
    assert response.status_code == 400

def test_predict_question():
    response = client.post("/predict/comment", json={"text": "Quel est le prix ?"})
    assert response.status_code == 200
    data = response.json()
    assert data["is_question"] == True
