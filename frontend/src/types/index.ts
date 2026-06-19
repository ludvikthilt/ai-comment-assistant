export interface User {
  id: string;
  email: string;
  role: 'admin' | 'moderator' | 'viewer';
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface FacebookPage {
  id: string;
  user_id: string;
  page_id: string;
  page_name: string;
  page_access_token: string;
  is_active: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  page_id: string;
  facebook_post_id: string;
  content: string;
  published_at: string;
  comment_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  facebook_comment_id: string;
  author_name: string;
  author_id: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  sentiment_confidence: number | null;
  is_question: boolean | null;
  question_confidence: number | null;
  auto_liked: boolean;
  liked_at: string | null;
  status: 'pending' | 'analyzed' | 'responded' | 'published' | 'ignored';
  created_at: string;
  updated_at: string;
}

export interface ResponseTemplate {
  id: string;
  category: string;
  keywords: string[];
  template_text: string;
  priority: number;
  usage_count: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedResponse {
  id: string;
  comment_id: string;
  template_id: string;
  proposed_response: string;
  score: number;
  status: 'pending' | 'approved' | 'modified' | 'rejected';
  created_at: string;
}

export interface WhatsAppNotification {
  id: string;
  generated_response_id: string;
  phone_number: string;
  message_id: string;
  status: 'sent' | 'delivered' | 'read' | 'replied';
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
}

export interface AdminReply {
  id: string;
  notification_id: string;
  original_response: string;
  modified_response: string;
  replied_at: string;
}

export interface FacebookReply {
  id: string;
  comment_id: string;
  admin_reply_id: string;
  facebook_reply_id: string;
  content: string;
  published_at: string;
}

export interface WebhookEvent {
  id: string;
  source: 'facebook' | 'whatsapp';
  event_type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface DashboardKPI {
  total_comments: number;
  positive_comments: number;
  negative_comments: number;
  neutral_comments: number;
  questions: number;
  likes_sent: number;
  responses_published: number;
  avg_response_time_minutes: number;
}

export interface SentimentDistribution {
  name: string;
  value: number;
  color: string;
}

export interface DailyActivity {
  date: string;
  comments: number;
  questions: number;
  responses: number;
}

export interface CommentAnalysis {
  sentiment: string;
  sentiment_confidence: number;
  is_question: boolean;
  question_confidence: number;
}
