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
import { useCreateCard, useUpdateCard } from '@/hooks/apiHooks/Cards/useCardMutations';
import { searchApiCards } from '@/services/api/Cards/cardsApi';
import { Card } from '@/services/api/Cards/cardsApi';
import { Search, Loader2 } from 'lucide-react';

const cardSchema = z.object({
  apiCardId: z.string().min(1, 'Please select a card'),
  cardType: z.string().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

const editCardSchema = z.object({
  cardType: z.string().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

type CardFormData = z.infer<typeof cardSchema>;
type EditCardFormData = z.infer<typeof editCardSchema>;

interface CardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: Card | null;
}

export const CardModal = ({ open, onOpenChange, card }: CardModalProps) => {
  const isEditMode = !!card;
  const createCardMutation = useCreateCard();
  const updateCardMutation = useUpdateCard();
  const [searchTerm, setSearchTerm] = useState('');
  const [apiCards, setApiCards] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedApiCard, setSelectedApiCard] = useState<any | null>(null);

  const form = useForm({
    resolver: zodResolver(isEditMode ? editCardSchema : cardSchema),
    defaultValues: {
      apiCardId: '',
      cardType: '',
      active: true,
      featured: false,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && card) {
        form.reset({
          cardType: card.cardType || '',
          active: card.active,
          featured: card.featured,
        });
      } else {
        form.reset({
          apiCardId: '',
          cardType: '',
          active: true,
          featured: false,
        });
        setSelectedApiCard(null);
        setApiCards([]);
        setSearchTerm('');
      }
    }
  }, [open, isEditMode, card, form]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      const response = await searchApiCards(searchTerm);
      if (response.success && response.data) {
        setApiCards(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error searching cards:', error);
      setApiCards([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectApiCard = (apiCard: any) => {
    setSelectedApiCard(apiCard);
    if (!isEditMode) {
      form.setValue('apiCardId' as any, apiCard.id);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && card) {
        await updateCardMutation.mutateAsync({
          id: card.id,
          data: {
            cardType: data.cardType || undefined,
            active: data.active,
            featured: data.featured,
          },
        });
      } else {
        if (!data.apiCardId) {
          form.setError('apiCardId', { message: 'Please select a card' });
          return;
        }
        await createCardMutation.mutateAsync({
          apiCardId: data.apiCardId,
          cardType: data.cardType || undefined,
          active: data.active,
          featured: data.featured,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isLoading = createCardMutation.isPending || updateCardMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Card' : 'Add New Card'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update card metadata and settings'
              : 'Search and add a new card from the API'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="search">Search Cards</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search for a card..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching || !searchTerm.trim()}
                  variant="outline"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {apiCards.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                  {apiCards.map((apiCard) => (
                    <button
                      key={apiCard.id}
                      type="button"
                      onClick={() => handleSelectApiCard(apiCard)}
                      className={`w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedApiCard?.id === apiCard.id
                          ? 'bg-primary-50 border border-primary-500'
                          : 'border border-transparent'
                      }`}
                    >
                      <div className="font-medium">{apiCard.name}</div>
                      <div className="text-sm text-gray-500">
                        {apiCard.issuer} {apiCard.annualFee ? `• $${apiCard.annualFee}` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {form.formState.errors.apiCardId && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.apiCardId.message}
                </p>
              )}
            </div>
          )}

          {isEditMode && card && (
            <div className="space-y-2">
              <Label>Card Name</Label>
              <Input value={card.name} disabled className="bg-gray-50" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cardType">Category</Label>
            <select
              id="cardType"
              value={form.watch('cardType') || ''}
              onChange={(e) => form.setValue('cardType', e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select category</option>
              <option value="travel">Travel</option>
              <option value="dining">Dining</option>
              <option value="cashback">Cashback</option>
              <option value="business">Business</option>
              <option value="balance_transfer">Balance Transfer</option>
            </select>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={form.watch('active')}
                onChange={(e) => form.setValue('active', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Active
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.watch('featured')}
                onChange={(e) => form.setValue('featured', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured
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
                isEditMode ? 'Update Card' : 'Create Card'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

