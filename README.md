# Facebook Comment AI SaaS

Plateforme SaaS complète d'automatisation de la gestion des commentaires Facebook.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React 19  │────▶│  Supabase   │◄────│  FastAPI    │
│  Dashboard  │     │  (Auth/DB)  │     │  AI Service │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                      │
                    ┌──────▼──────┐      ┌──────▼──────┐
                    │Edge Functions│     │ Models .pkl │
                    │  (Webhooks)  │      │  sklearn    │
                    └──────┬──────┘      └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         Facebook      WhatsApp     Dashboard
```

## Prérequis

- Node.js 20+
- Python 3.12
- Docker & Docker Compose
- Compte Supabase
- Compte Facebook Developer
- Compte WhatsApp Business

## Installation Rapide

### 1. Cloner et configurer

```bash
git clone https://github.com/your-org/facebook-comment-ai.git
cd facebook-comment-ai
```

### 2. Placer les modèles

Copier vos fichiers `.pkl` dans `ai-service/models/` :
- `best_model_sentiment.pkl`
- `best_model_questions.pkl`
- `label_encoder_sentiment.pkl`
- `label_encoder_questions.pkl`

### 3. Configurer les variables d'environnement

```bash
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env
cp supabase/.env.example supabase/.env
```

Remplir toutes les clés requises.

### 4. Lancer avec Docker

```bash
docker compose up -d --build
```

### 5. Appliquer les migrations Supabase

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

### 6. Déployer les Edge Functions

```bash
supabase functions deploy receive-facebook-comment
supabase functions deploy analyze-comment
supabase functions deploy auto-like-comment
supabase functions deploy generate-template-response
supabase functions deploy notify-admin-whatsapp
supabase functions deploy receive-whatsapp-reply
supabase functions deploy publish-facebook-reply
```

### 7. Configurer les webhooks

**Facebook :**
- URL: `https://your-project.supabase.co/functions/v1/receive-facebook-comment`
- Vérifier le token configuré

**WhatsApp :**
- URL: `https://your-project.supabase.co/functions/v1/receive-whatsapp-reply`
- Vérifier le token configuré

## Développement Local

```bash
# Frontend
cd frontend
npm install
npm run dev

# AI Service
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Edge Functions
supabase functions serve
```

## Tests

```bash
# Tests FastAPI
cd ai-service
pytest tests/

# Tests frontend
cd frontend
npm test
```

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19, TypeScript, Vite, Material UI, Recharts |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| IA | Python 3.12, FastAPI, Scikit-Learn, Pickle |
| Déploiement | Vercel (frontend), Railway/Render/VPS (IA), Supabase (backend) |

## Workflow Complet

1. **Publication Facebook** → Utilisateur commente
2. **Webhook Facebook** → Edge Function `receive-facebook-comment`
3. **Enregistrement** → Table `comments` dans Supabase
4. **Analyse** → FastAPI charge les modèles `.pkl`
   - Sentiment (positive/negative/neutral)
   - Question (true/false)
5. **Auto-like** → Si sentiment positif + confiance > seuil
6. **Template** → Si question détectée, moteur de règles génère réponse
7. **WhatsApp** → Notification admin avec réponse proposée
8. **Validation** → Admin répond "OK" ou modifie
9. **Publication** → Réponse publiée sur Facebook
10. **Historique** → Toutes les actions loggées

## Rôles Utilisateurs

- **admin** : Accès complet, gestion utilisateurs, templates, paramètres
- **moderator** : Gestion commentaires, templates, validation réponses
- **viewer** : Lecture seule, dashboard et historique

## Licence

MIT
