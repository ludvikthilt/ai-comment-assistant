# Documentation API - Facebook Comment AI

## Base URL

- **Production** : `https://your-domain.com/api/ai`
- **Local** : `http://localhost:8000`

## Endpoints

### Health Check

```http
GET /health
```

**Response :**
```json
{
  "status": "healthy",
  "models_loaded": true
}
```

### Prédiction Commentaire

```http
POST /predict/comment
Content-Type: application/json
```

**Body :**
```json
{
  "text": "Quel est le prix de ce produit ?"
}
```

**Response :**
```json
{
  "sentiment": "neutral",
  "sentiment_confidence": 0.8234,
  "is_question": true,
  "question_confidence": 0.9567
}
```

**Codes d'erreur :**

| Code | Description |
|------|-------------|
| 400 | Texte vide ou invalide |
| 500 | Erreur interne du modèle |

## Modèles

Les modèles sont chargés une seule fois au démarrage du service :

| Modèle | Fichier | Labels |
|--------|---------|--------|
| Sentiment | `best_model_sentiment.pkl` | positive, negative, neutral |
| Question | `best_model_questions.pkl` | question, statement |
| Encoder Sentiment | `label_encoder_sentiment.pkl` | - |
| Encoder Question | `label_encoder_questions.pkl` | - |

## Prétraitement

1. Conversion en minuscules
2. Suppression des URLs
3. Suppression des mentions @
4. Suppression des caractères spéciaux
5. Normalisation des espaces

## Performance

- Temps de réponse moyen : < 100ms
- Prédictions parallèles (sentiment + question)
- Pas de rechargement des modèles entre les requêtes
