import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useActivityLogs } from '@/hooks/apiHooks/Activity/useActivityLog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Tag,
  CreditCard,
  Link2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  User,
  Settings,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ActivityLog = () => {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { data, isLoading, error } = useActivityLogs({
    page,
    limit,
    action: actionFilter !== 'all' ? actionFilter : undefined,
  });

  const activityLogs = data?.data?.data || [];
  const pagination = data?.data?.pagination || { page: 1, limit: 8, total: 0, pages: 1 };

  const getActionIcon = (action: string, entityType: string) => {
    if (action === 'CREATE' && entityType === 'Card') return { icon: Plus, color: 'bg-yellow-100 text-yellow-600' };
    if (action === 'UPDATE' && entityType === 'Card') return { icon: Edit, color: 'bg-blue-100 text-blue-600' };
    if (action === 'DELETE' && entityType === 'Card') return { icon: Trash2, color: 'bg-red-100 text-red-600' };
    if (action === 'CREATE' && entityType === 'Offer') return { icon: Tag, color: 'bg-green-100 text-green-600' };
    if (action === 'UPDATE' && entityType === 'Offer') return { icon: Tag, color: 'bg-green-100 text-green-600' };
    if (entityType === 'Offer' && action.includes('VISIBILITY')) return { icon: Eye, color: 'bg-purple-100 text-purple-600' };
    if (action.includes('REFERRAL') || action.includes('LINK')) return { icon: Link2, color: 'bg-purple-100 text-purple-600' };
    if (action.includes('SYNC') || action.includes('API')) return { icon: RefreshCw, color: 'bg-gray-100 text-gray-600' };
    return { icon: Settings, color: 'bg-gray-100 text-gray-600' };
  };

  const getActionLabel = (action: string, entityType: string) => {
    if (action === 'CREATE' && entityType === 'Card') return 'Card Added';
    if (action === 'UPDATE' && entityType === 'Card') return 'Card Updated';
    if (action === 'DELETE' && entityType === 'Card') return 'Card Deactivated';
    if (action === 'CREATE' && entityType === 'Offer') return 'Offer Added';
    if (action === 'UPDATE' && entityType === 'Offer') return 'Offer Modified';
    if (action.includes('VISIBILITY')) return 'Visibility Changed';
    if (action.includes('REFERRAL') || action.includes('LINK')) return 'Link Added';
    if (action.includes('SYNC') || action.includes('API')) return 'System Event';
    if (action.includes('CURRENT')) return 'Current Offer';
    return `${action} ${entityType}`;
  };

  const getActionColor = (action: string, entityType: string) => {
    if (action === 'CREATE' && entityType === 'Card') return 'bg-yellow-100 text-yellow-700';
    if (action === 'UPDATE' && entityType === 'Card') return 'bg-blue-100 text-blue-700';
    if (action === 'DELETE' && entityType === 'Card') return 'bg-red-100 text-red-700';
    if (action === 'CREATE' && entityType === 'Offer') return 'bg-green-100 text-green-700';
    if (action === 'UPDATE' && entityType === 'Offer') return 'bg-green-100 text-green-700';
    if (action.includes('VISIBILITY')) return 'bg-purple-100 text-purple-700';
    if (action.includes('REFERRAL') || action.includes('LINK')) return 'bg-purple-100 text-purple-700';
    if (action.includes('SYNC') || action.includes('API')) return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // Search will be handled by the API when implemented
  };

  const filteredLogs = activityLogs.filter((log) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.description?.toLowerCase().includes(searchLower) ||
      log.admin?.name?.toLowerCase().includes(searchLower) ||
      log.admin?.email?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.entityType?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <main className="grow bg-gray-50 dark:bg-gray-900">
      <div className={`mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 ${sidebarOpen ? 'pt-6' : 'pt-4'}`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Activity Log
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track all system changes and admin actions
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-2 border-gray-300"
              />
            </div>
          </form>
          <div className="relative">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Created</option>
              <option value="UPDATE">Updated</option>
              <option value="DELETE">Deleted</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading activities...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error loading activities</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No activities found</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => {
                const { icon: Icon, color: iconColor } = getActionIcon(log.action, log.entityType);
                const actionLabel = getActionLabel(log.action, log.entityType);
                const actionColor = getActionColor(log.action, log.entityType);

                return (
                  <div
                    key={log.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-full ${iconColor} flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.description || `${log.action} ${log.entityType}`}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${actionColor} flex-shrink-0`}>
                            {actionLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          {log.admin ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary-600" />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {log.admin.name || log.admin.email}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <Settings className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">System</span>
                            </div>
                          )}

                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(log.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })} • {new Date(log.createdAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} activities
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                >
                  &lt; Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    if (i === 0 && pagination.page > 3 && pagination.pages > 5) {
                      return (
                        <>
                          <Button
                            key={1}
                            variant={1 === pagination.page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(1)}
                          >
                            1
                          </Button>
                          <span className="px-2 text-gray-500">...</span>
                        </>
                      );
                    }

                    if (i === 4 && pagination.page < pagination.pages - 2 && pagination.pages > 5) {
                      return (
                        <>
                          <span className="px-2 text-gray-500">...</span>
                          <Button
                            key={pagination.pages}
                            variant={pagination.pages === pagination.page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pagination.pages)}
                          >
                            {pagination.pages}
                          </Button>
                        </>
                      );
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
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
        </div>
      </div>
    </main>
  );
};

export default ActivityLog;

