#!/bin/bash
# Script de déploiement VPS Ubuntu

set -e

echo "🚀 Déploiement Facebook Comment AI SaaS"

# Mise à jour système
sudo apt-get update && sudo apt-get upgrade -y

# Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

# Docker Compose
sudo apt-get install -y docker-compose-plugin

# Clone du projet
git clone https://github.com/your-org/facebook-comment-ai.git /opt/facebook-comment-ai
cd /opt/facebook-comment-ai

# Variables d'environnement
cp ai-service/.env.example ai-service/.env
cp frontend/.env.example frontend/.env

echo "⚠️  Veuillez configurer les fichiers .env avant de continuer"
echo "   - ai-service/.env"
echo "   - frontend/.env"

# Lancement
sudo docker compose up -d --build

echo "✅ Déploiement terminé!"
echo "   Frontend: http://$(curl -s ifconfig.me):3000"
echo "   API AI: http://$(curl -s ifconfig.me):8000"
