# Documentation Base de Données - Facebook Comment AI

## Schéma

### Table : users

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire (liée à auth.users) |
| email | TEXT | Email utilisateur |
| full_name | TEXT | Nom complet |
| role | TEXT | admin / moderator / viewer |
| avatar_url | TEXT | URL avatar |
| created_at | TIMESTAMPTZ | Date de création |

### Table : facebook_pages

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| user_id | UUID | Référence users |
| page_id | TEXT | ID Facebook de la page |
| page_name | TEXT | Nom de la page |
| page_access_token | TEXT | Token d'accès |
| is_active | BOOLEAN | Page active |

### Table : posts

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| page_id | UUID | Référence facebook_pages |
| facebook_post_id | TEXT | ID Facebook du post |
| content | TEXT | Contenu du post |
| published_at | TIMESTAMPTZ | Date de publication |
| comment_count | INTEGER | Nombre de commentaires |

### Table : comments

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| post_id | UUID | Référence posts |
| facebook_comment_id | TEXT | ID Facebook du commentaire |
| author_name | TEXT | Nom de l'auteur |
| author_id | TEXT | ID Facebook de l'auteur |
| content | TEXT | Contenu du commentaire |
| sentiment | TEXT | positive / negative / neutral |
| sentiment_confidence | DECIMAL | Score de confiance |
| is_question | BOOLEAN | Est-ce une question |
| question_confidence | DECIMAL | Score de confiance |
| auto_liked | BOOLEAN | Like automatique envoyé |
| liked_at | TIMESTAMPTZ | Date du like |
| status | TEXT | pending / analyzed / responded / published / ignored |

### Table : response_templates

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| category | TEXT | Catégorie (Prix, Disponibilité, etc.) |
| keywords | TEXT[] | Mots-clés associés |
| template_text | TEXT | Texte du template |
| priority | INTEGER | Priorité 1-10 |
| usage_count | INTEGER | Nombre d'utilisations |
| is_active | BOOLEAN | Template actif |
| created_by | UUID | Référence users |

### Table : generated_responses

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| comment_id | UUID | Référence comments |
| template_id | UUID | Référence response_templates |
| proposed_response | TEXT | Réponse proposée |
| score | DECIMAL | Score de matching |
| status | TEXT | pending / approved / modified / rejected |

### Table : whatsapp_notifications

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| generated_response_id | UUID | Référence generated_responses |
| phone_number | TEXT | Numéro de téléphone |
| message_id | TEXT | ID du message WhatsApp |
| status | TEXT | sent / delivered / read / replied |
| sent_at | TIMESTAMPTZ | Date d'envoi |

### Table : admin_replies

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| notification_id | UUID | Référence whatsapp_notifications |
| original_response | TEXT | Réponse originale de l'admin |
| modified_response | TEXT | Réponse modifiée |
| replied_at | TIMESTAMPTZ | Date de réponse |

### Table : facebook_replies

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| comment_id | UUID | Référence comments |
| admin_reply_id | UUID | Référence admin_replies |
| facebook_reply_id | TEXT | ID Facebook de la réponse |
| content | TEXT | Contenu publié |
| published_at | TIMESTAMPTZ | Date de publication |

### Table : webhook_events

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| source | TEXT | facebook / whatsapp |
| event_type | TEXT | Type d'événement |
| payload | JSONB | Données brutes |
| processed | BOOLEAN | Traité ou non |

### Table : activity_logs

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| user_id | UUID | Référence users (nullable) |
| action | TEXT | Action réalisée |
| entity_type | TEXT | Type d'entité |
| entity_id | TEXT | ID de l'entité |
| details | JSONB | Détails supplémentaires |

## Fonctions RPC

### get_dashboard_kpis()

Retourne les KPIs du dashboard sous forme de JSON.

### get_sentiment_distribution()

Retourne la répartition des sentiments.

### get_daily_activity(p_days INTEGER)

Retourne l'activité journalière sur N jours.

## RLS Policies

Toutes les tables ont RLS activé :

- **users** : Lecture propre profil, admin voit tout
- **facebook_pages** : Authentifiés en lecture, admin/moderator en écriture
- **comments** : Authentifiés en lecture, admin/moderator en écriture
- **response_templates** : Authentifiés en lecture, admin/moderator en écriture
- **generated_responses** : Admin/moderator uniquement
- **activity_logs** : Admin uniquement
