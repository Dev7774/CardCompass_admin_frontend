import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/api/Dashboard/dashboardApi';
import { useToast } from '@/hooks/use-toast';

export const useDashboard = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardStats(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

