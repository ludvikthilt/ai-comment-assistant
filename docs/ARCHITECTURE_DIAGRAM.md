# Diagramme d'Architecture - Facebook Comment AI SaaS

```mermaid
graph TB
    subgraph "Facebook"
        FB[Publication]
        C[Commentaire]
        L[Like Auto]
        R[Réponse Publiée]
    end

    subgraph "Supabase Edge Functions"
        W1[receive-facebook-comment]
        W2[analyze-comment]
        W3[auto-like-comment]
        W4[generate-template-response]
        W5[notify-admin-whatsapp]
        W6[receive-whatsapp-reply]
        W7[publish-facebook-reply]
    end

    subgraph "FastAPI AI Service"
        API["/predict/comment"]
        M1[best_model_sentiment.pkl]
        M2[best_model_questions.pkl]
        E1[label_encoder_sentiment.pkl]
        E2[label_encoder_questions.pkl]
    end

    subgraph "Supabase PostgreSQL"
        T1[(users)]
        T2[(facebook_pages)]
        T3[(posts)]
        T4[(comments)]
        T5[(response_templates)]
        T6[(generated_responses)]
        T7[(whatsapp_notifications)]
        T8[(admin_replies)]
        T9[(facebook_replies)]
        T10[(activity_logs)]
    end

    subgraph "React 19 Frontend"
        D[Dashboard]
        CM[Commentaires]
        TP[Templates]
        ST[Paramètres]
        HS[Historique]
    end

    subgraph "WhatsApp Business"
        WA[Notification Admin]
        WR[Réponse Admin]
    end

    FB --> C
    C --> W1
    W1 --> T4
    W1 --> W2
    W2 --> API
    API --> M1
    API --> M2
    M1 --> E1
    M2 --> E2
    API --> T4
    T4 --> W3
    W3 --> L
    T4 --> W4
    W4 --> T5
    W4 --> T6
    W4 --> W5
    W5 --> WA
    WA --> WR
    WR --> W6
    W6 --> T7
    W6 --> T8
    W6 --> W7
    W7 --> T9
    W7 --> R

    D --> T4
    D --> T10
    CM --> T4
    TP --> T5
    ST --> T1
    HS --> T4
    HS --> T6
    HS --> T9
```

## Flux de Données

1. **Webhook Facebook** reçoit le commentaire
2. **Edge Function** l'enregistre et déclenche l'analyse
3. **FastAPI** charge les modèles .pkl et prédit sentiment + question
4. **Résultats** sauvegardés dans PostgreSQL
5. **Auto-like** si sentiment positif (seuil configurable)
6. **Moteur de templates** si question détectée
7. **WhatsApp** notifie l'admin avec la réponse proposée
8. **Admin** valide/modifie via réponse WhatsApp
9. **Publication** automatique sur Facebook
10. **Dashboard** temps réel via Supabase Realtime
