import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services';

export function useDashboard() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => dashboardService.getKPIs(),
    refetchInterval: 30000,
  });

  const { data: sentimentDistribution, isLoading: sentimentLoading } = useQuery({
    queryKey: ['dashboard', 'sentiment'],
    queryFn: () => dashboardService.getSentimentDistribution(),
  });

  const { data: dailyActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardService.getDailyActivity(),
  });

  const { data: recentActivity, isLoading: recentLoading } = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: () => dashboardService.getRecentActivity(),
  });

  return {
    kpis,
    sentimentDistribution,
    dailyActivity,
    recentActivity,
    isLoading: kpisLoading || sentimentLoading || activityLoading || recentLoading,
  };
}
