import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useCards } from '@/hooks/apiHooks/Cards/useCards';
import { useIssuers } from '@/hooks/apiHooks/Cards/useIssuers';
import { useUpdateCard, useDeleteCard } from '@/hooks/apiHooks/Cards/useCardMutations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardModal } from '@/components/modals/CardModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardsResponse, IssuersResponse } from '@/services/api/Cards/cardsApi';

const Cards = () => {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [issuerFilter, setIssuerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const filters = {
    page,
    limit,
    search: search || undefined,
    issuer: issuerFilter !== 'all' ? issuerFilter : undefined,
    active: statusFilter === 'all' ? undefined : statusFilter === 'active',
  };

  const { data, isLoading, error } = useCards(filters);
  const { data: issuersData } = useIssuers();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);

  const response = data as CardsResponse | undefined;
  const cards = response?.data?.data || [];
  const pagination = response?.data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 };

  // Get all unique issuers from the database (not just current page)
  const issuersResponse = issuersData as IssuersResponse | undefined;
  const issuers = issuersResponse?.data || [];

  const getIssuerColor = (issuer: string) => {
    const colors: { [key: string]: string } = {
      'Chase': 'bg-blue-100 text-blue-700',
      'Amex': 'bg-yellow-100 text-yellow-700',
      'American Express': 'bg-yellow-100 text-yellow-700',
      'Capital One': 'bg-red-100 text-red-700',
      'Citi': 'bg-purple-100 text-purple-700',
      'Discover': 'bg-orange-100 text-orange-700',
      'Bank of America': 'bg-indigo-100 text-indigo-700',
      'Wells Fargo': 'bg-green-100 text-green-700',
    };
    return colors[issuer] || 'bg-gray-100 text-gray-700';
  };

  const getCategory = (cardType: string | null) => {
    if (!cardType) return 'N/A';
    // Map cardType to category
    const categoryMap: { [key: string]: string } = {
      'travel': 'Travel',
      'dining': 'Dining',
      'cashback': 'Cashback',
      'business': 'Business',
      'balance_transfer': 'Balance Transfer',
    };
    return categoryMap[cardType.toLowerCase()] || cardType;
  };

  const formatSignUpBonus = (card: any) => {
    if (card.currentOffer?.signUpBonus) {
      return card.currentOffer.signUpBonus;
    }
    return 'N/A';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDeleteClick = (card: Card) => {
    setCardToDelete(card);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cardToDelete) {
      deleteCardMutation.mutate(
        { id: cardToDelete.id, hardDelete: true },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setCardToDelete(null);
          },
        }
      );
    }
  };

  return (
    <main className="grow bg-gray-50 dark:bg-gray-900">
      <div className={`mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 ${sidebarOpen ? 'pt-6' : 'pt-4'}`}>
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Cards Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage all credit cards and their details
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 w-full sm:w-auto"
              onClick={() => {
                navigate('/cards/add');
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center w-full sm:w-auto"
              onClick={() => {
                navigate('/cards/add-from-api');
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Card From API
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search cards..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 border-2 border-gray-300"
              />
            </div>
          </form>
          <div className="relative">
            <select
              value={issuerFilter}
              onChange={(e) => {
                setIssuerFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Issuers</option>
              {issuers.map((issuer: string) => (
                <option key={issuer} value={issuer}>
                  {issuer}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Cards Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading cards...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error loading cards</div>
          ) : cards.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No cards found</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Card Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Issuer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Annual Fee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Featured
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {cards.map((card, index) => (
                      <tr
                        key={card.id}
                        className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/offers/${card.id}`)}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            {card.name}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getIssuerColor(card.issuer)}`}>
                            {card.issuer}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {getCategory(card.cardType)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {card.annualFee ? `$${card.annualFee}` : '$0'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={card.active}
                              onChange={(e) => {
                                updateCardMutation.mutate({
                                  id: card.id,
                                  data: { active: e.target.checked },
                                });
                              }}
                              disabled={updateCardMutation.isPending}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={card.featured}
                              onChange={(e) => {
                                updateCardMutation.mutate({
                                  id: card.id,
                                  data: { featured: e.target.checked },
                                });
                              }}
                              disabled={updateCardMutation.isPending}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center"
                              onClick={() => {
                                navigate(`/cards/edit/${card.id}`);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleDeleteClick(card)}
                              disabled={deleteCardMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {cards.map((card) => (
                  <div key={card.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <button
                        onClick={() => navigate(`/offers/${card.id}`)}
                        className="text-base font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 text-left"
                      >
                        {card.name}
                      </button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigate(`/cards/edit/${card.id}`);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteClick(card)}
                          disabled={deleteCardMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Issuer:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getIssuerColor(card.issuer)}`}>
                          {card.issuer}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{getCategory(card.cardType)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Annual Fee:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{card.annualFee ? `$${card.annualFee}` : '$0'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Active:</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={card.active}
                            onChange={(e) => {
                              updateCardMutation.mutate({
                                id: card.id,
                                data: { active: e.target.checked },
                              });
                            }}
                            disabled={updateCardMutation.isPending}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Featured:</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={card.featured}
                            onChange={(e) => {
                              updateCardMutation.mutate({
                                id: card.id,
                                data: { featured: e.target.checked },
                              });
                            }}
                            disabled={updateCardMutation.isPending}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Updated:</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} cards
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                    >
                      &lt; Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages = [];
                        const totalPages = pagination.pages;
                        const currentPage = pagination.page;

                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={i === currentPage ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPage(i)}
                              >
                                {i}
                              </Button>
                            );
                          }
                        } else {
                          pages.push(
                            <Button
                              key={1}
                              variant={1 === currentPage ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPage(1)}
                            >
                              1
                            </Button>
                          );

                          if (currentPage > 3) {
                            pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
                          }

                          const start = Math.max(2, currentPage - 1);
                          const end = Math.min(totalPages - 1, currentPage + 1);

                          for (let i = start; i <= end; i++) {
                            if (i !== 1 && i !== totalPages) {
                              pages.push(
                                <Button
                                  key={i}
                                  variant={i === currentPage ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setPage(i)}
                                >
                                  {i}
                                </Button>
                              );
                            }
                          }

                          if (currentPage < totalPages - 2) {
                            pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
                          }

                          pages.push(
                            <Button
                              key={totalPages}
                              variant={totalPages === currentPage ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPage(totalPages)}
                            >
                              {totalPages}
                            </Button>
                          );
                        }

                        return pages;
                      })()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next &gt;
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Card Modal */}
      <CardModal
        open={cardModalOpen}
        onOpenChange={setCardModalOpen}
        card={selectedCard}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Card Permanently?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <strong>{cardToDelete?.name}</strong>? 
              This action cannot be undone. All associated offers, benefits, earn multipliers, and annual spend perks will also be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setCardToDelete(null);
              }}
              disabled={deleteCardMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteCardMutation.isPending}
            >
              {deleteCardMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Cards;

