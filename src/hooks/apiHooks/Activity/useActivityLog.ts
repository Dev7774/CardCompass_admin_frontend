import { useQuery } from '@tanstack/react-query';
import { getActivityLogs, ActivityLogFilters } from '@/services/api/Activity/activityApi';
import { useToast } from '@/hooks/use-toast';

export const useActivityLogs = (filters: ActivityLogFilters = {}) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['activityLogs', filters],
    queryFn: () => getActivityLogs(filters),
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

