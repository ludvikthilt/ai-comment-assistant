-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: users (geree par Supabase Auth, extended via trigger)
-- ============================================================
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'moderator', 'viewer')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: facebook_pages
-- ============================================================
CREATE TABLE public.facebook_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    page_id TEXT NOT NULL,
    page_name TEXT NOT NULL,
    page_access_token TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, page_id)
);

-- ============================================================
-- TABLE: posts
-- ============================================================
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.facebook_pages(id) ON DELETE CASCADE,
    facebook_post_id TEXT NOT NULL UNIQUE,
    content TEXT,
    published_at TIMESTAMPTZ,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: comments
-- ============================================================
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    facebook_comment_id TEXT NOT NULL UNIQUE,
    author_name TEXT NOT NULL,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    sentiment_confidence DECIMAL(5,4),
    is_question BOOLEAN,
    question_confidence DECIMAL(5,4),
    auto_liked BOOLEAN DEFAULT FALSE,
    liked_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'responded', 'published', 'ignored')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: response_templates
-- ============================================================
CREATE TABLE public.response_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    template_text TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: generated_responses
-- ============================================================
CREATE TABLE public.generated_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.response_templates(id),
    proposed_response TEXT NOT NULL,
    score DECIMAL(5,4),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'modified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: whatsapp_notifications
-- ============================================================
CREATE TABLE public.whatsapp_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_response_id UUID NOT NULL REFERENCES public.generated_responses(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    message_id TEXT,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'replied')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ
);

-- ============================================================
-- TABLE: admin_replies
-- ============================================================
CREATE TABLE public.admin_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES public.whatsapp_notifications(id) ON DELETE CASCADE,
    original_response TEXT NOT NULL,
    modified_response TEXT NOT NULL,
    replied_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: facebook_replies
-- ============================================================
CREATE TABLE public.facebook_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    admin_reply_id UUID REFERENCES public.admin_replies(id),
    facebook_reply_id TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: webhook_events
-- ============================================================
CREATE TABLE public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL CHECK (source IN ('facebook', 'whatsapp')),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: activity_logs
-- ============================================================
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_status ON public.comments(status);
CREATE INDEX idx_comments_sentiment ON public.comments(sentiment);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX idx_comments_is_question ON public.comments(is_question) WHERE is_question = TRUE;
CREATE INDEX idx_generated_responses_comment_id ON public.generated_responses(comment_id);
CREATE INDEX idx_generated_responses_status ON public.generated_responses(status);
CREATE INDEX idx_webhook_events_source ON public.webhook_events(source);
CREATE INDEX idx_webhook_events_processed ON public.webhook_events(processed);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_facebook_pages_updated_at BEFORE UPDATE ON public.facebook_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_response_templates_updated_at BEFORE UPDATE ON public.response_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_generated_responses_updated_at BEFORE UPDATE ON public.generated_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FONCTIONS RPC POUR LE DASHBOARD
-- ============================================================

CREATE OR REPLACE FUNCTION get_dashboard_kpis()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_comments', COUNT(*),
        'positive_comments', COUNT(*) FILTER (WHERE sentiment = 'positive'),
        'negative_comments', COUNT(*) FILTER (WHERE sentiment = 'negative'),
        'neutral_comments', COUNT(*) FILTER (WHERE sentiment = 'neutral'),
        'questions', COUNT(*) FILTER (WHERE is_question = TRUE),
        'likes_sent', COUNT(*) FILTER (WHERE auto_liked = TRUE),
        'responses_published', COUNT(*) FILTER (WHERE status = 'published'),
        'avg_response_time_minutes', COALESCE(
            AVG(EXTRACT(EPOCH FROM (fr.published_at - c.created_at)) / 60), 0
        )
    ) INTO result
    FROM public.comments c
    LEFT JOIN public.facebook_replies fr ON fr.comment_id = c.id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_sentiment_distribution()
RETURNS TABLE(sentiment TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT c.sentiment, COUNT(*)::BIGINT
    FROM public.comments c
    WHERE c.sentiment IS NOT NULL
    GROUP BY c.sentiment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_daily_activity(p_days INTEGER DEFAULT 30)
RETURNS TABLE(date TEXT, comments BIGINT, questions BIGINT, responses BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(DATE(c.created_at), 'YYYY-MM-DD') AS date,
        COUNT(*)::BIGINT AS comments,
        COUNT(*) FILTER (WHERE c.is_question = TRUE)::BIGINT AS questions,
        COUNT(*) FILTER (WHERE c.status = 'published')::BIGINT AS responses
    FROM public.comments c
    WHERE c.created_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY DATE(c.created_at)
    ORDER BY DATE(c.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users: chacun voit son profil, admin voit tout
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Facebook pages: admin/moderator CRUD, viewer read
CREATE POLICY "Pages accessible to authenticated" ON public.facebook_pages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Pages manageable by admin moderator" ON public.facebook_pages
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    ));

-- Comments: tous les authentifies peuvent lire
CREATE POLICY "Comments readable by all" ON public.comments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Comments manageable by admin moderator" ON public.comments
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    ));

-- Templates: admin/moderator CRUD, viewer read
CREATE POLICY "Templates readable by all" ON public.response_templates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Templates manageable by admin moderator" ON public.response_templates
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    ));

-- Generated responses: admin/moderator only
CREATE POLICY "Generated responses admin moderator" ON public.generated_responses
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    ));

-- Activity logs: admin only
CREATE POLICY "Activity logs admin only" ON public.activity_logs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Trigger pour creer le profil utilisateur apres inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
