import { supabase } from './supabase';
import type { ResponseTemplate } from '@/types';

export const templatesService = {
  async getTemplates(params?: {
    page?: number;
    limit?: number;
    category?: string;
    isActive?: boolean;
    search?: string;
  }) {
    let query = supabase
      .from('response_templates')
      .select('*', { count: 'exact' })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (params?.category) {
      query = query.eq('category', params.category);
    }
    if (params?.isActive !== undefined) {
      query = query.eq('is_active', params.isActive);
    }
    if (params?.search) {
      query = query.or(`category.ilike.%${params.search}%,template_text.ilike.%${params.search}%`);
    }

    const from = ((params?.page || 1) - 1) * (params?.limit || 20);
    const to = from + (params?.limit || 20) - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data as ResponseTemplate[], count };
  },

  async getTemplateById(id: string) {
    const { data, error } = await supabase
      .from('response_templates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as ResponseTemplate;
  },

  async createTemplate(template: Omit<ResponseTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) {
    const { data, error } = await supabase
      .from('response_templates')
      .insert({
        ...template,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTemplate(id: string, template: Partial<ResponseTemplate>) {
    const { data, error } = await supabase
      .from('response_templates')
      .update({
        ...template,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTemplate(id: string) {
    const { error } = await supabase
      .from('response_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async toggleActive(id: string, isActive: boolean) {
    return this.updateTemplate(id, { is_active: isActive });
  },

  async testTemplate(keywords: string[], commentText: string) {
    const { data, error } = await supabase
      .rpc('test_template_matching', {
        p_keywords: keywords,
        p_comment_text: commentText,
      });
    if (error) throw error;
    return data;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('response_templates')
      .select('category')
      .eq('is_active', true);
    if (error) throw error;
    return [...new Set(data.map((d) => d.category))];
  },
};
