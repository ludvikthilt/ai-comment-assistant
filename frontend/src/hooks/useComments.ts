import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '@/services';
import type { Comment } from '@/types';

export function useComments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  sentiment?: string;
  search?: string;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['comments', params],
    queryFn: () => commentsService.getComments(params),
    refetchInterval: 30000,
  });

  const analyzeMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentsService.analyzeComment(commentId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['comment', variables.commentId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      commentsService.updateCommentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  return {
    comments: data?.data || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    analyzeComment: analyzeMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
  };
}
