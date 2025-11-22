import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateOffer, useUpdateOffer } from '@/hooks/apiHooks/Offers/useOfferMutations';
import { Offer } from '@/services/api/Offers/offersApi';
import { Loader2 } from 'lucide-react';

const offerSchema = z.object({
  signUpBonus: z.string().min(1, 'Sign-up bonus is required'),
  minimumSpend: z.string().optional(),
  timePeriod: z.string().optional(),
  referralUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  publicUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  internalLabel: z.string().optional(),
  isCurrent: z.boolean().default(false),
  visible: z.boolean().default(true),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface OfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardId: string;
  offer?: Offer | null;
}

export const OfferModal = ({ open, onOpenChange, cardId, offer }: OfferModalProps) => {
  const isEditMode = !!offer;
  const createOfferMutation = useCreateOffer(cardId);
  const updateOfferMutation = useUpdateOffer(cardId);

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      signUpBonus: '',
      minimumSpend: '',
      timePeriod: '',
      referralUrl: '',
      publicUrl: '',
      internalLabel: '',
      isCurrent: false,
      visible: true,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && offer) {
        form.reset({
          signUpBonus: offer.signUpBonus || '',
          minimumSpend: offer.minimumSpend?.toString() || '',
          timePeriod: offer.timePeriod || '',
          referralUrl: offer.referralUrl || '',
          publicUrl: offer.publicUrl || '',
          internalLabel: offer.internalLabel || '',
          isCurrent: offer.isCurrent,
          visible: offer.visible,
        });
      } else {
        form.reset({
          signUpBonus: '',
          minimumSpend: '',
          timePeriod: '',
          referralUrl: '',
          publicUrl: '',
          internalLabel: '',
          isCurrent: false,
          visible: true,
        });
      }
    }
  }, [open, isEditMode, offer, form]);

  const onSubmit = async (data: OfferFormData) => {
    try {
      const submitData = {
        signUpBonus: data.signUpBonus,
        minimumSpend: data.minimumSpend ? parseFloat(data.minimumSpend) : undefined,
        timePeriod: data.timePeriod || undefined,
        referralUrl: data.referralUrl || undefined,
        publicUrl: data.publicUrl || undefined,
        internalLabel: data.internalLabel || undefined,
        isCurrent: data.isCurrent,
        visible: data.visible,
      };

      if (isEditMode && offer) {
        await updateOfferMutation.mutateAsync({
          id: offer.id,
          data: submitData,
        });
      } else {
        await createOfferMutation.mutateAsync(submitData);
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isLoading = createOfferMutation.isPending || updateOfferMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Offer' : 'Add New Offer'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update offer details and settings'
              : 'Create a new offer for this card'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="internalLabel">Internal Label</Label>
            <Input
              id="internalLabel"
              {...form.register('internalLabel')}
              placeholder="e.g., Q4 2024 Promo"
              className={form.formState.errors.internalLabel ? 'border-red-600' : ''}
            />
            {form.formState.errors.internalLabel && (
              <p className="text-sm text-red-600">
                {form.formState.errors.internalLabel.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signUpBonus">
              Sign-Up Bonus <span className="text-red-500">*</span>
            </Label>
            <Input
              id="signUpBonus"
              {...form.register('signUpBonus')}
              placeholder="e.g., 80,000 bonus points"
              className={form.formState.errors.signUpBonus ? 'border-red-600' : ''}
            />
            {form.formState.errors.signUpBonus && (
              <p className="text-sm text-red-600">
                {form.formState.errors.signUpBonus.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumSpend">Minimum Spend</Label>
              <Input
                id="minimumSpend"
                type="number"
                step="0.01"
                {...form.register('minimumSpend')}
                placeholder="e.g., 4000"
                className={form.formState.errors.minimumSpend ? 'border-red-600' : ''}
              />
              {form.formState.errors.minimumSpend && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.minimumSpend.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timePeriod">Time Period</Label>
              <Input
                id="timePeriod"
                {...form.register('timePeriod')}
                placeholder="e.g., 90 days"
                className={form.formState.errors.timePeriod ? 'border-red-600' : ''}
              />
              {form.formState.errors.timePeriod && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.timePeriod.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralUrl">Referral URL</Label>
            <Input
              id="referralUrl"
              type="url"
              {...form.register('referralUrl')}
              placeholder="https://example.com/referral"
              className={form.formState.errors.referralUrl ? 'border-red-600' : ''}
            />
            {form.formState.errors.referralUrl && (
              <p className="text-sm text-red-600">
                {form.formState.errors.referralUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicUrl">Public URL</Label>
            <Input
              id="publicUrl"
              type="url"
              {...form.register('publicUrl')}
              placeholder="https://example.com/public"
              className={form.formState.errors.publicUrl ? 'border-red-600' : ''}
            />
            {form.formState.errors.publicUrl && (
              <p className="text-sm text-red-600">
                {form.formState.errors.publicUrl.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCurrent"
                checked={form.watch('isCurrent')}
                onChange={(e) => form.setValue('isCurrent', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <Label htmlFor="isCurrent" className="cursor-pointer">
                Set as Current Offer
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="visible"
                checked={form.watch('visible')}
                onChange={(e) => form.setValue('visible', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <Label htmlFor="visible" className="cursor-pointer">
                Visible
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Offer' : 'Create Offer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

