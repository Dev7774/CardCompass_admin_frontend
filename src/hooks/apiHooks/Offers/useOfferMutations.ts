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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', cardId] });
      toast({
        title: 'Success',
        description: 'Offer updated successfully',
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

