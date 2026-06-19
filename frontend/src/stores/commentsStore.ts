import { create } from 'zustand';
import type { Comment } from '@/types';
import { commentsService } from '@/services';

interface CommentsState {
  comments: Comment[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    sentiment?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  };
  page: number;
  limit: number;
  setFilters: (filters: Partial<CommentsState['filters']>) => void;
  setPage: (page: number) => void;
  fetchComments: () => Promise<void>;
  addComment: (comment: Comment) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  filters: {},
  page: 1,
  limit: 20,

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters }, page: 1 });
    get().fetchComments();
  },

  setPage: (page) => {
    set({ page });
    get().fetchComments();
  },

  fetchComments: async () => {
    set({ isLoading: true });
    try {
      const { page, limit, filters } = get();
      const { data, count } = await commentsService.getComments({
        page,
        limit,
        ...filters,
      });
      set({ comments: data, totalCount: count || 0, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addComment: (comment) => {
    set((state) => ({
      comments: [comment, ...state.comments].slice(0, state.limit),
      totalCount: state.totalCount + 1,
    }));
  },

  updateComment: (id, updates) => {
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },
}));
