import { useState } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { useOffers } from '@/hooks/apiHooks/Offers/useOffers';
import { useCardById } from '@/hooks/apiHooks/Cards/useCard';
import { useSetCurrentOffer, useToggleArchiveOffer, useDeleteOffer } from '@/hooks/apiHooks/Offers/useOfferMutations';
import { OfferModal } from '@/components/modals/OfferModal';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Archive, Trash2, Check, X, Copy, CreditCard, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Offer } from '@/services/api/Offers/offersApi';

const Offers = () => {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const { data: cardData, isLoading: cardLoading } = useCardById(cardId || '');
  const { data: offersData, isLoading: offersLoading } = useOffers(cardId || '');
  const setCurrentOfferMutation = useSetCurrentOffer(cardId || '');
  const toggleArchiveMutation = useToggleArchiveOffer(cardId || '');
  const deleteOfferMutation = useDeleteOffer(cardId || '');

  const card = cardData?.data;
  const offers = offersData?.data || [];

  const getIssuerColor = (issuer: string) => {
    const colors: { [key: string]: string } = {
      'Chase': 'bg-blue-100 text-blue-700',
      'Amex': 'bg-yellow-100 text-yellow-700',
      'American Express': 'bg-yellow-100 text-yellow-700',
      'Capital One': 'bg-red-100 text-red-700',
      'Citi': 'bg-purple-100 text-purple-700',
      'Discover': 'bg-orange-100 text-orange-700',
    };
    return colors[issuer] || 'bg-gray-100 text-gray-700';
  };

  const getCategory = (cardType: string | null) => {
    if (!cardType) return 'N/A';
    const categoryMap: { [key: string]: string } = {
      'travel': 'Travel Rewards',
      'dining': 'Dining',
      'cashback': 'Cashback',
      'business': 'Business',
      'balance_transfer': 'Balance Transfer',
    };
    return categoryMap[cardType.toLowerCase()] || cardType;
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const handleSetCurrent = async (offerId: string) => {
    await setCurrentOfferMutation.mutateAsync(offerId);
  };

  const handleArchive = async (offerId: string) => {
    await toggleArchiveMutation.mutateAsync(offerId);
  };

  const handleDelete = async (offerId: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      await deleteOfferMutation.mutateAsync(offerId);
    }
  };

  if (cardLoading || offersLoading) {
    return (
      <main className="grow bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 pt-6">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="grow bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 pt-6">
          <div className="text-center text-red-500">Card not found</div>
        </div>
      </main>
    );
  }

  const currentOffer = offers.find(o => o.isCurrent);

  return (
    <main className="grow bg-gray-50 dark:bg-gray-900">
      <div className={`mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 ${sidebarOpen ? 'pt-6' : 'pt-4'}`}>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/cards')}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {card.name} - Offers
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage offers for this credit card
            </p>
          </div>
          <Button
            className="flex items-center bg-primary-600 hover:bg-primary-700"
            onClick={() => {
              setSelectedOffer(null);
              setOfferModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Offer
          </Button>
        </div>

        {/* Card Summary */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {card.name}
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getIssuerColor(card.issuer)}`}>
                  {card.issuer}
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {getCategory(card.cardType)}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${card.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {card.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Annual Fee:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {card.annualFee ? `$${card.annualFee}` : '$0'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total Offers:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {offers.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Current Offer:</span>
                  <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                    {currentOffer?.internalLabel || currentOffer?.signUpBonus || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {offers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No offers found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
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
                        Time Period
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
                    {offers.map((offer, index) => (
                      <tr
                        key={offer.id}
                        className={`${offer.isCurrent ? 'bg-green-50 dark:bg-green-900/20' : index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {offer.internalLabel || 'Standard Offer'}
                            </div>
                            {offer.internalLabel && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {offer.isCurrent && (
                                  <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded mr-2">
                                    Current
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {offer.signUpBonus}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            After qualifying spend
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {offer.minimumSpend ? `$${offer.minimumSpend.toLocaleString()}` : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {offer.timePeriod ? `in ${offer.timePeriod}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {offer.timePeriod || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            from approval
                          </div>
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
                              {offer.endDate && new Date(offer.endDate) < new Date() && (
                                <span className="text-xs text-red-600">(Expired)</span>
                              )}
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
                              readOnly
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOffer(offer);
                                setOfferModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            {offer.archived ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(offer.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleArchive(offer.id)}
                              >
                                <Archive className="w-4 h-4 mr-1" />
                                Archive
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {offers.length} offers total
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      <OfferModal
        open={offerModalOpen}
        onOpenChange={setOfferModalOpen}
        cardId={cardId || ''}
        offer={selectedOffer}
      />
    </main>
  );
};

export default Offers;

