import { useQuery } from '@tanstack/react-query';
import { getAllIssuers } from '@/services/api/Cards/cardsApi';
import { useToast } from '@/hooks/use-toast';

export const useIssuers = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['issuers'],
    queryFn: () => getAllIssuers(),
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

