import { create } from 'zustand';
import type { DashboardKPI, SentimentDistribution, DailyActivity } from '@/types';
import { dashboardService } from '@/services';

interface DashboardState {
  kpis: DashboardKPI | null;
  sentimentDistribution: SentimentDistribution[];
  dailyActivity: DailyActivity[];
  isLoading: boolean;
  error: string | null;
  fetchKPIs: () => Promise<void>;
  fetchSentimentDistribution: () => Promise<void>;
  fetchDailyActivity: (days?: number) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  kpis: null,
  sentimentDistribution: [],
  dailyActivity: [],
  isLoading: false,
  error: null,

  fetchKPIs: async () => {
    set({ isLoading: true });
    try {
      const kpis = await dashboardService.getKPIs();
      set({ kpis, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchSentimentDistribution: async () => {
    try {
      const data = await dashboardService.getSentimentDistribution();
      set({ sentimentDistribution: data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchDailyActivity: async (days = 30) => {
    try {
      const data = await dashboardService.getDailyActivity(days);
      set({ dailyActivity: data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  refreshAll: async () => {
    set({ isLoading: true });
    try {
      const [kpis, sentiment, activity] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getSentimentDistribution(),
        dashboardService.getDailyActivity(),
      ]);
      set({ kpis, sentimentDistribution: sentiment, dailyActivity: activity, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
