import { supabase } from './supabase';
import type { Comment, CommentAnalysis } from '@/types';
import axios from 'axios';

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

export const commentsService = {
  async getComments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sentiment?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let query = supabase
      .from('comments')
      .select('*, posts(facebook_post_id, content), facebook_replies(*)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.sentiment) {
      query = query.eq('sentiment', params.sentiment);
    }
    if (params?.search) {
      query = query.ilike('content', `%${params.search}%`);
    }
    if (params?.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params?.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    const from = ((params?.page || 1) - 1) * (params?.limit || 20);
    const to = from + (params?.limit || 20) - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data as Comment[], count };
  },

  async getCommentById(id: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, posts(*), generated_responses(*, response_templates(*)), facebook_replies(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Comment;
  },

  async analyzeComment(commentId: string, content: string): Promise<CommentAnalysis> {
    const { data } = await axios.post(`${AI_API_URL}/predict/comment`, {
      text: content,
    });
    return data;
  },

  async updateCommentStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('comments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async ignoreComment(id: string) {
    return this.updateCommentStatus(id, 'ignored');
  },

  subscribeToNewComments(callback: (payload: any) => void) {
    return supabase
      .channel('new-comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        callback
      )
      .subscribe();
  },

  subscribeToCommentUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('comment-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'comments' },
        callback
      )
      .subscribe();
  },
};
