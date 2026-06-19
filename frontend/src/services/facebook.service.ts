import { supabase } from './supabase';

export const facebookService = {
  async getPages() {
    const { data, error } = await supabase
      .from('facebook_pages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createPage(page: {
    page_id: string;
    page_name: string;
    page_access_token: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('facebook_pages')
      .insert({
        ...page,
        user_id: user.user!.id,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePage(id: string, page: Partial<{ page_name: string; page_access_token: string; is_active: boolean }>) {
    const { data, error } = await supabase
      .from('facebook_pages')
      .update(page)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePage(id: string) {
    const { error } = await supabase
      .from('facebook_pages')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getPosts(pageId?: string) {
    let query = supabase
      .from('posts')
      .select('*, facebook_pages(page_name)')
      .order('published_at', { ascending: false });

    if (pageId) {
      query = query.eq('page_id', pageId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};
