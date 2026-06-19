import { useQuery } from '@tanstack/react-query';
import { commentsService } from '@/services';

export function useQuestions(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', params],
    queryFn: () =>
      commentsService.getComments({
        ...params,
        // This would be filtered server-side via RPC
      }),
    refetchInterval: 15000,
  });

  return {
    questions: data?.data.filter((c) => c.is_question) || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
  };
}
