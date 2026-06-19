import { create } from 'zustand';
import type { ResponseTemplate } from '@/types';
import { templatesService } from '@/services';

interface TemplatesState {
  templates: ResponseTemplate[];
  totalCount: number;
  categories: string[];
  isLoading: boolean;
  error: string | null;
  selectedTemplate: ResponseTemplate | null;
  fetchTemplates: (params?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createTemplate: (template: any) => Promise<void>;
  updateTemplate: (id: string, template: any) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  selectTemplate: (template: ResponseTemplate | null) => void;
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  templates: [],
  totalCount: 0,
  categories: [],
  isLoading: false,
  error: null,
  selectedTemplate: null,

  fetchTemplates: async (params) => {
    set({ isLoading: true });
    try {
      const { data, count } = await templatesService.getTemplates(params);
      set({ templates: data, totalCount: count || 0, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await templatesService.getCategories();
      set({ categories });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createTemplate: async (template) => {
    set({ isLoading: true });
    try {
      await templatesService.createTemplate(template);
      await get().fetchTemplates();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTemplate: async (id, template) => {
    set({ isLoading: true });
    try {
      await templatesService.updateTemplate(id, template);
      await get().fetchTemplates();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true });
    try {
      await templatesService.deleteTemplate(id);
      await get().fetchTemplates();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  selectTemplate: (template) => set({ selectedTemplate: template }),
}));
