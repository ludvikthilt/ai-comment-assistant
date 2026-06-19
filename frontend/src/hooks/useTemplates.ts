import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesService } from '@/services';

export function useTemplates(params?: {
  page?: number;
  limit?: number;
  category?: string;
  isActive?: boolean;
  search?: string;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesService.getTemplates(params),
  });

  const createMutation = useMutation({
    mutationFn: templatesService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, template }: { id: string; template: any }) =>
      templatesService.updateTemplate(id, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: templatesService.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  return {
    templates: data?.data || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
  };
}
