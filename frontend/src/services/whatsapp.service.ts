import { supabase } from './supabase';

export const whatsappService = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    let query = supabase
      .from('whatsapp_notifications')
      .select('*, generated_responses(*, comments(*))', { count: 'exact' })
      .order('sent_at', { ascending: false });

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    const from = ((params?.page || 1) - 1) * (params?.limit || 20);
    const to = from + (params?.limit || 20) - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getNotificationById(id: string) {
    const { data, error } = await supabase
      .from('whatsapp_notifications')
      .select('*, generated_responses(*, comments(*)), admin_replies(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
};
