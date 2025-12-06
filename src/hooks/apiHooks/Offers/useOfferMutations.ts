import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOffer,
  updateOffer,
  setCurrentOffer,
  toggleArchiveOffer,
  deleteOffer,
  CreateOfferRequest,
  UpdateOfferRequest,
} from '@/services/api/Offers/offersApi';
import { useToast } from '@/hooks/use-toast';

export const useCreateOffer = (cardId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateOfferRequest) => createOffer(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', cardId] });
      toast({
        title: 'Success',
        description: 'Offer created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateOffer = (cardId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOfferRequest }) =>
      updateOffer(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['offers', cardId] });

      // Snapshot the previous value
      const previousOffers = queryClient.getQueryData(['offers', cardId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['offers', cardId], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((offer: any) =>
            offer.id === id 
              ? { ...offer, visible: data.visible !== undefined ? data.visible : offer.visible }
              : offer
          ),
        };
      });

      // Return a context object with the snapshotted value
      return { previousOffers };
    },
    onError: (error: Error, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousOffers) {
        queryClient.setQueryData(['offers', cardId], context.previousOffers);
      }
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: (response) => {
      // Update the cache with the response data directly
      if (response?.data) {
        queryClient.setQueryData(['offers', cardId], (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((offer: any) =>
              offer.id === response.data.id ? response.data : offer
            ),
          };
        });
      }
      // Also invalidate allOffers for the OffersList page
      queryClient.invalidateQueries({ queryKey: ['allOffers'] });
      toast({
        title: 'Success',
        description: 'Offer updated successfully',
      });
    },
  });
};

export const useSetCurrentOffer = (cardId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => setCurrentOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', cardId] });
      toast({
        title: 'Success',
        description: 'Current offer updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useToggleArchiveOffer = (cardId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => toggleArchiveOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', cardId] });
      toast({
        title: 'Success',
        description: 'Offer archive status updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteOffer = (cardId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', cardId] });
      toast({
        title: 'Success',
        description: 'Offer deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

