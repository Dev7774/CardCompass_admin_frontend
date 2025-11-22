import { useQuery } from '@tanstack/react-query';
import { getCardById } from '@/services/api/Cards/cardsApi';
import { useToast } from '@/hooks/use-toast';

export const useCardById = (id: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['card', id],
    queryFn: () => getCardById(id),
    enabled: !!id,
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

