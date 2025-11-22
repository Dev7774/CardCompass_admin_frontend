import { useQuery } from '@tanstack/react-query';
import { getCards, CardFilters } from '@/services/api/Cards/cardsApi';
import { useToast } from '@/hooks/use-toast';

export const useCards = (filters: CardFilters = {}) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['cards', filters],
    queryFn: () => getCards(filters),
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

