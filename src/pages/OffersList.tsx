import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useCards } from '@/hooks/apiHooks/Cards/useCards';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOffersByCardId, updateOffer, UpdateOfferRequest } from '@/services/api/Offers/offersApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Edit, Check, X, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Offer } from '@/services/api/Offers/offersApi';
import { useToast } from '@/hooks/use-toast';

const OffersList = () => {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cardsData, isLoading: cardsLoading } = useCards({ page: 1, limit: 1000 });
  const cards = (cardsData as any)?.data?.data || [];

  // Fetch offers for all cards using Promise.all
  const { data: allOffersData, isLoading: offersLoading } = useQuery<Offer[]>({
    queryKey: ['allOffers', cards.map((c: any) => c.id).join(',')],
    queryFn: async () => {
      if (cards.length === 0) return [];
      const offersPromises = cards.map((card: any) => getOffersByCardId(card.id));
      const results = await Promise.all(offersPromises);
      const offers = results.flatMap((result: any) => result.data || []);
      // Ensure each offer has card information, using cards list as fallback
      return offers.map((offer: Offer) => {
        if (!offer.card && offer.cardId) {
          const card = cards.find((c: any) => c.id === offer.cardId);
          if (card) {
            return {
              ...offer,
              card: {
                id: card.id,
                name: card.name,
                issuer: card.issuer,
              },
            };
          }
        }
        return offer;
      });
    },
    enabled: cards.length > 0,
  });

  const allOffers: Offer[] = allOffersData || [];

  const filteredOffers = allOffers.filter(offer => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        offer.signUpBonus?.toLowerCase().includes(searchLower) ||
        offer.internalLabel?.toLowerCase().includes(searchLower) ||
        offer.card?.name?.toLowerCase().includes(searchLower) ||
        offer.card?.issuer?.toLowerCase().includes(searchLower)
      );
    }
    if (selectedCardId) {
      return offer.cardId === selectedCardId;
    }
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOffers = filteredOffers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCardId]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const updateOfferMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOfferRequest }) =>
      updateOffer(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['allOffers'] });

      // Snapshot the previous value
      const previousOffers = queryClient.getQueryData(['allOffers', cards.map((c: any) => c.id).join(',')]);

      // Optimistically update to the new value
      queryClient.setQueryData(['allOffers', cards.map((c: any) => c.id).join(',')], (old: any) => {
        if (!old) return old;
        return old.map((offer: Offer) =>
          offer.id === id ? { ...offer, visible: data.visible } : offer
        );
      });

      // Return a context object with the snapshotted value
      return { previousOffers };
    },
    onError: (error: Error, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousOffers) {
        queryClient.setQueryData(['allOffers', cards.map((c: any) => c.id).join(',')], context.previousOffers);
      }
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate all offers queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['allOffers'] });
      // Also invalidate the specific card's offers if we have the cardId
      const offer = allOffers.find(o => o.id === variables.id);
      if (offer?.cardId) {
        queryClient.invalidateQueries({ queryKey: ['offers', offer.cardId] });
      }
      toast({
        title: 'Success',
        description: 'Offer visibility updated successfully',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['allOffers'] });
    },
  });

  const handleToggleVisible = async (offer: Offer) => {
    try {
      await updateOfferMutation.mutateAsync({
        id: offer.id,
        data: {
          visible: !offer.visible,
        },
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  return (
    <main className="grow bg-gray-50 dark:bg-gray-900">
      <div className={`mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 ${sidebarOpen ? 'pt-6' : 'pt-4'}`}>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Offers Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage all offers across all credit cards
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search offers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="pl-10 border-2 border-gray-300"
              />
            </div>
          </form>
          <div className="relative">
            <select
              value={selectedCardId}
              onChange={(e) => {
                setSelectedCardId(e.target.value);
              }}
              className="appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Cards</option>
              {cards.map((card: any) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {cardsLoading || offersLoading ? (
            <div className="p-8 text-center text-gray-500">Loading offers...</div>
          ) : filteredOffers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No offers found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Card
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Internal Label
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sign-Up Bonus
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Min Spend
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Referral URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Current
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Visible
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedOffers.map((offer, index) => (
                      <tr
                        key={offer.id}
                        className={`${offer.isCurrent ? 'bg-green-50 dark:bg-green-900/20' : index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/offers/${offer.cardId}`)}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            {offer.card?.name || 'Unknown Card'}
                          </button>
                        
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {offer.internalLabel || 'Standard Offer'}
                          </div>
                        
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {offer.signUpBonus}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {offer.minimumSpend ? `$${offer.minimumSpend.toLocaleString()}` : 'N/A'}
                          </div>
                          {offer.timePeriod && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {offer.timePeriod}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {offer.referralUrl ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                                {offer.referralUrl.length > 30
                                  ? `${offer.referralUrl.substring(0, 30)}...`
                                  : offer.referralUrl}
                              </span>
                              <button
                                onClick={() => handleCopyUrl(offer.referralUrl!)}
                                className="text-primary-600 hover:text-primary-700"
                                title="Copy URL"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No URL</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {offer.isCurrent ? (
                              <>
                                <Check className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-gray-900 dark:text-white">Yes</span>
                              </>
                            ) : (
                              <>
                                <X className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500">No</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={offer.visible}
                              onChange={() => handleToggleVisible(offer)}
                              disabled={updateOfferMutation.isPending}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/offers/${offer.cardId}`)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredOffers.length)} of {filteredOffers.length} offers
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={currentPage === page ? "bg-primary-600 hover:bg-primary-700" : ""}
                            >
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default OffersList;

