import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchApiCards } from '@/services/api/Cards/cardsApi';
import { useCreateCard, useSyncCardFromApi } from '@/hooks/apiHooks/Cards/useCardMutations';
import { Search, Loader2, ArrowLeft, Plus, Edit } from 'lucide-react';
import { ApiCard } from '@/services/api/Cards/cardsApi';

const AddCard = () => {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [apiCards, setApiCards] = useState<ApiCard[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingCards, setAddingCards] = useState<Set<string>>(new Set());
  const [addingAll, setAddingAll] = useState(false);
  const createCardMutation = useCreateCard();
  const syncCardMutation = useSyncCardFromApi();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      const response = await searchApiCards(searchTerm);
      if (response.success && response.data && response.data.cards) {
        setApiCards(Array.isArray(response.data.cards) ? response.data.cards : []);
      } else {
        setApiCards([]);
      }
    } catch (error) {
      console.error('Error searching cards:', error);
      setApiCards([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddCard = async (apiCard: ApiCard) => {
    if (addingCards.has(apiCard.cardKey)) return;

    setAddingCards((prev) => new Set(prev).add(apiCard.cardKey));
    try {
      if (apiCard.existsInDb && apiCard.cardId) {
        // Sync/refetch card from API if it exists
        await syncCardMutation.mutateAsync(apiCard.cardId);
        // Optionally refresh the search results to show updated data
        // The mutation will invalidate queries, so the card list will refresh
      } else {
        // Add new card
        await createCardMutation.mutateAsync({
          apiCardId: apiCard.cardKey,
          active: true,
          featured: false,
        });
        // Remove the card from the list after successful addition
        setApiCards((prev) => prev.filter((card) => card.cardKey !== apiCard.cardKey));
      }
    } catch (error) {
      console.error('Error adding/syncing card:', error);
    } finally {
      setAddingCards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(apiCard.cardKey);
        return newSet;
      });
    }
  };

  const handleAddAll = async () => {
    if (apiCards.length === 0 || addingAll) return;

    setAddingAll(true);
    try {
      // Add all cards sequentially
      for (const apiCard of apiCards) {
        try {
          await createCardMutation.mutateAsync({
            apiCardId: apiCard.cardKey,
            active: true,
            featured: false,
          });
        } catch (error) {
          console.error(`Error adding card ${apiCard.cardName}:`, error);
          // Continue with other cards even if one fails
        }
      }
      // Clear the list after all cards are added
      setApiCards([]);
    } catch (error) {
      console.error('Error adding all cards:', error);
    } finally {
      setAddingAll(false);
    }
  };

  return (
    <main className="grow bg-gray-50 dark:bg-gray-900">
      <div className={`mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 ${sidebarOpen ? 'pt-6' : 'pt-4'}`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/cards')}
              className="flex items-center w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Add New Card
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Search and add cards from the API
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for a card by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-300 w-full"
              />
            </div>
            <Button
              type="submit"
              disabled={searching || !searchTerm.trim()}
              className="flex items-center justify-center w-full sm:w-auto"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Add All Button */}
        {apiCards.length > 0 && (
          <div className="mb-4">
            <Button
              onClick={handleAddAll}
              disabled={addingAll}
              className="flex items-center bg-primary-600 hover:bg-primary-700"
            >
              {addingAll ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding All...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add All ({apiCards.length})
                </>
              )}
            </Button>
          </div>
        )}

        {/* Cards List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {apiCards.length === 0 && !searching ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No cards found. Try a different search term.' : 'Search for cards to add them to your collection.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {apiCards.map((apiCard) => {
                const isAdding = addingCards.has(apiCard.cardKey) || syncCardMutation.isPending;
                return (
                  <div
                    key={apiCard.cardKey}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 w-full">
                        <div className="font-medium text-gray-900 dark:text-white text-base sm:text-lg">
                          {apiCard.cardName}
                        </div>
                        {apiCard.cardIssuer && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {apiCard.cardIssuer}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleAddCard(apiCard)}
                        disabled={isAdding}
                        className="flex items-center justify-center w-full sm:w-auto ml-0 sm:ml-4"
                        variant={apiCard.existsInDb ? "outline" : "default"}
                      >
                        {isAdding ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {apiCard.existsInDb ? 'Syncing...' : 'Adding...'}
                          </>
                        ) : (
                          <>
                            {apiCard.existsInDb ? (
                              <>
                                <Edit className="w-4 h-4 mr-2" />
                                Update
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                              </>
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AddCard;

