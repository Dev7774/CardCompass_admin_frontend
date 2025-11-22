import { useQuery } from '@tanstack/react-query';
import { getOffersByCardId } from '@/services/api/Offers/offersApi';
import { useToast } from '@/hooks/use-toast';

export const useOffers = (cardId: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['offers', cardId],
    queryFn: () => getOffersByCardId(cardId),
    enabled: !!cardId,
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

