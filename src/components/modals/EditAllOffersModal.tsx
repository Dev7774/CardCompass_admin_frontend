import { useState, useEffect } from 'react';
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
import { useUpdateCard } from '@/hooks/apiHooks/Cards/useCardMutations';
import { useUpdateOffer } from '@/hooks/apiHooks/Offers/useOfferMutations';
import { Offer } from '@/services/api/Offers/offersApi';
import { EarnMultiplier } from '@/services/api/Cards/cardsApi';
import { Loader2, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditAllOffersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardId: string;
  offers: Offer[];
  earnMultipliers: EarnMultiplier[];
}

export const EditAllOffersModal = ({
  open,
  onOpenChange,
  cardId,
  offers,
  earnMultipliers: initialEarnMultipliers,
}: EditAllOffersModalProps) => {
  const { toast } = useToast();
  const updateCardMutation = useUpdateCard();
  const updateOfferMutation = useUpdateOffer(cardId);
  const [saving, setSaving] = useState(false);

  // State for offers
  const [offersData, setOffersData] = useState<Offer[]>([]);
  // State for earnMultipliers
  const [earnMultipliers, setEarnMultipliers] = useState<EarnMultiplier[]>([]);

  useEffect(() => {
    if (open) {
      // Initialize offers data
      setOffersData(offers.map(offer => ({ ...offer })));
      // Initialize earnMultipliers data
      setEarnMultipliers(
        initialEarnMultipliers.length > 0
          ? initialEarnMultipliers.map(mult => ({ ...mult }))
          : [{ spendBonusCategoryName: '', earnMultiplier: null, spendBonusDesc: '' }]
      );
    }
  }, [open, offers, initialEarnMultipliers]);

  const handleOfferChange = (index: number, field: keyof Offer, value: any) => {
    const updated = [...offersData];
    updated[index] = { ...updated[index], [field]: value };
    setOffersData(updated);
  };

  const handleEarnMultiplierChange = (
    index: number,
    field: keyof EarnMultiplier,
    value: any
  ) => {
    const updated = [...earnMultipliers];
    updated[index] = { ...updated[index], [field]: value };
    setEarnMultipliers(updated);
  };

  const handleAddEarnMultiplier = () => {
    setEarnMultipliers([
      ...earnMultipliers,
      { spendBonusCategoryName: '', earnMultiplier: null, spendBonusDesc: '' },
    ]);
  };

  const handleRemoveEarnMultiplier = (index: number) => {
    if (earnMultipliers.length > 1) {
      setEarnMultipliers(earnMultipliers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Update all offers
      const offerPromises = offersData.map(offer => {
        const updateData = {
          signupBonusDesc: offer.signUpBonus || offer.signupBonusDescription || undefined,
          signUpBonus: offer.signUpBonus || offer.signupBonusDescription || undefined,
          signupBonusAmount: offer.signupBonusAmount || undefined,
          signupBonusType: offer.signupBonusType || undefined,
          signupBonusSpend: offer.signupBonusSpend || offer.minimumSpend || undefined,
          signupBonusLength: offer.signupBonusLength || undefined,
          minimumSpend: offer.minimumSpend || undefined,
          timePeriod: offer.timePeriod || offer.signupBonusLengthPeriod || undefined,
          referralUrl: offer.referralUrl || undefined,
          publicUrl: offer.publicUrl || undefined,
          internalLabel: offer.internalLabel || undefined,
          isCurrent: offer.isCurrent,
          visible: offer.visible,
        };
        return updateOfferMutation.mutateAsync({
          id: offer.id,
          data: updateData,
        });
      });

      await Promise.all(offerPromises);

      // Update card with earnMultipliers
      const filteredMultipliers = earnMultipliers.filter(
        m => m.spendBonusCategoryName?.trim() || m.earnMultiplier
      );

      await updateCardMutation.mutateAsync({
        id: cardId,
        data: {
          earnMultipliers: filteredMultipliers,
        },
      });

      toast({
        title: 'Success',
        description: 'All offers and earning categories updated successfully',
        variant: 'default',
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update offers and earning categories',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const isLoading = saving || updateOfferMutation.isPending || updateCardMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit All Offers & Earning Categories</DialogTitle>
          <DialogDescription>
            Edit all offers and earning categories for this card
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Offers Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Offers ({offersData.length})
            </h3>
            <div className="space-y-4">
              {offersData.map((offer, offerIndex) => (
                <div
                  key={offer.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {offer.internalLabel || `Offer ${offerIndex + 1}`}
                    </h4>
                    {offer.isCurrent && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Sign-Up Bonus Description</Label>
                      <Input
                        value={offer.signUpBonus || offer.signupBonusDescription || ''}
                        onChange={(e) =>
                          handleOfferChange(offerIndex, 'signUpBonus', e.target.value)
                        }
                        placeholder="e.g., 80,000 bonus points"
                      />
                    </div>
                    <div>
                      <Label>Sign-Up Bonus Amount</Label>
                      <Input
                        value={offer.signupBonusAmount || ''}
                        onChange={(e) =>
                          handleOfferChange(offerIndex, 'signupBonusAmount', e.target.value)
                        }
                        placeholder="e.g., 80000"
                      />
                    </div>
                    <div>
                      <Label>Sign-Up Bonus Type/Item</Label>
                      <Input
                        value={offer.signupBonusType || offer.signupBonusItem || ''}
                        onChange={(e) =>
                          handleOfferChange(offerIndex, 'signupBonusType', e.target.value)
                        }
                        placeholder="e.g., Points, Miles"
                      />
                    </div>
                    <div>
                      <Label>Sign-Up Bonus Spend</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={offer.signupBonusSpend?.toString() || offer.minimumSpend?.toString() || ''}
                        onChange={(e) =>
                          handleOfferChange(
                            offerIndex,
                            'signupBonusSpend',
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        placeholder="e.g., 4000"
                      />
                    </div>
                    <div>
                      <Label>Sign-Up Bonus Length</Label>
                      <Input
                        type="number"
                        value={offer.signupBonusLength?.toString() || ''}
                        onChange={(e) =>
                          handleOfferChange(
                            offerIndex,
                            'signupBonusLength',
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        placeholder="e.g., 90"
                      />
                    </div>
                    <div>
                      <Label>Referral URL</Label>
                      <Input
                        type="url"
                        value={offer.referralUrl || ''}
                        onChange={(e) =>
                          handleOfferChange(offerIndex, 'referralUrl', e.target.value)
                        }
                        placeholder="https://example.com/referral"
                      />
                    </div>
                    <div>
                      <Label>Internal Label</Label>
                      <Input
                        value={offer.internalLabel || ''}
                        onChange={(e) =>
                          handleOfferChange(offerIndex, 'internalLabel', e.target.value)
                        }
                        placeholder="e.g., Q4 2024 Promo"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={offer.isCurrent || false}
                          onChange={(e) =>
                            handleOfferChange(offerIndex, 'isCurrent', e.target.checked)
                          }
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Current Offer
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={offer.visible || false}
                          onChange={(e) =>
                            handleOfferChange(offerIndex, 'visible', e.target.checked)
                          }
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Visible</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earning Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Earning Categories ({earnMultipliers.length})
              </h3>
              <Button type="button" onClick={handleAddEarnMultiplier} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Earning Category
              </Button>
            </div>
            <div className="space-y-4">
              {earnMultipliers.map((multiplier, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-end mb-2">
                    {earnMultipliers.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEarnMultiplier(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Category Name</Label>
                      <Input
                        value={multiplier.spendBonusCategoryName || ''}
                        onChange={(e) =>
                          handleEarnMultiplierChange(
                            index,
                            'spendBonusCategoryName',
                            e.target.value
                          )
                        }
                        placeholder="e.g., Dining, Travel"
                      />
                    </div>
                    <div>
                      <Label>Earn Multiplier</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={multiplier.earnMultiplier?.toString() || ''}
                        onChange={(e) =>
                          handleEarnMultiplierChange(
                            index,
                            'earnMultiplier',
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        placeholder="e.g., 3 for 3X"
                      />
                    </div>
                    <div>
                      <Label>Category Group</Label>
                      <Input
                        value={multiplier.spendBonusCategoryGroup || ''}
                        onChange={(e) =>
                          handleEarnMultiplierChange(
                            index,
                            'spendBonusCategoryGroup',
                            e.target.value
                          )
                        }
                        placeholder="Category group"
                      />
                    </div>
                    <div>
                      <Label>Subcategory Group</Label>
                      <Input
                        value={multiplier.spendBonusSubcategoryGroup || ''}
                        onChange={(e) =>
                          handleEarnMultiplierChange(
                            index,
                            'spendBonusSubcategoryGroup',
                            e.target.value
                          )
                        }
                        placeholder="Subcategory group"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <textarea
                        value={multiplier.spendBonusDesc || ''}
                        onChange={(e) =>
                          handleEarnMultiplierChange(index, 'spendBonusDesc', e.target.value)
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Bonus description"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save All Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

