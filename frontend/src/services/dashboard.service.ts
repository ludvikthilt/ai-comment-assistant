import { supabase } from './supabase';
import type { DashboardKPI, SentimentDistribution, DailyActivity } from '@/types';

export const dashboardService = {
  async getKPIs(): Promise<DashboardKPI> {
    const { data, error } = await supabase
      .rpc('get_dashboard_kpis');
    if (error) throw error;
    return data;
  },

  async getSentimentDistribution(): Promise<SentimentDistribution[]> {
    const { data, error } = await supabase
      .rpc('get_sentiment_distribution');
    if (error) throw error;
    return data.map((d: any) => ({
      name: d.sentiment,
      value: d.count,
      color: d.sentiment === 'positive' ? '#4caf50' : d.sentiment === 'negative' ? '#f44336' : '#9e9e9e',
    }));
  },

  async getDailyActivity(days: number = 30): Promise<DailyActivity[]> {
    const { data, error } = await supabase
      .rpc('get_daily_activity', { p_days: days });
    if (error) throw error;
    return data;
  },

  async getQuestionStats() {
    const { data, error } = await supabase
      .rpc('get_question_stats');
    if (error) throw error;
    return data;
  },

  async getResponseTimeStats() {
    const { data, error } = await supabase
      .rpc('get_response_time_stats');
    if (error) throw error;
    return data;
  },

  async getRecentActivity(limit: number = 10) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, users(full_name)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },
};
