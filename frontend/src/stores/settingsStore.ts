import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  sidebarCollapsed: boolean;
  sentimentThreshold: number;
  questionThreshold: number;
  autoLikeEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  toggleSidebar: () => void;
  setSentimentThreshold: (threshold: number) => void;
  setQuestionThreshold: (threshold: number) => void;
  setAutoLikeEnabled: (enabled: boolean) => void;
  setWhatsappNotificationsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'fr',
      sidebarCollapsed: false,
      sentimentThreshold: 0.7,
      questionThreshold: 0.7,
      autoLikeEnabled: true,
      whatsappNotificationsEnabled: true,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSentimentThreshold: (sentimentThreshold) => set({ sentimentThreshold }),
      setQuestionThreshold: (questionThreshold) => set({ questionThreshold }),
      setAutoLikeEnabled: (autoLikeEnabled) => set({ autoLikeEnabled }),
      setWhatsappNotificationsEnabled: (whatsappNotificationsEnabled) => set({ whatsappNotificationsEnabled }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
