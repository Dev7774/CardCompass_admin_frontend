import { Download, Plus, CreditCard, Link2, Tag, EyeOff, TrendingUp, TrendingDown, Minus, Edit, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboard } from '@/hooks/apiHooks/Dashboard/useDashboard';
import { useCards } from '@/hooks/apiHooks/Cards/useCards';
import { useQuery } from '@tanstack/react-query';
import { getOffersByCardId } from '@/services/api/Offers/offersApi';
import { exportCardsToCSV, exportOffersToCSV } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { DashboardResponse } from '@/services/api/Dashboard/dashboardApi';
import { CardsResponse } from '@/services/api/Cards/cardsApi';

const Dashboard = () => {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: dashboardData, isLoading, error } = useDashboard();
  const [isExporting, setIsExporting] = useState(false);
  
  // Get metrics from API or use defaults
  const dashboardResponse = dashboardData as DashboardResponse | undefined;
  const metrics = dashboardResponse?.data?.metrics || {
    activeCards: { value: 0, change: 0, trend: 'neutral' as const },
    missingReferrals: { value: 0, change: 0, trend: 'down' as const },
    totalOffers: { value: 0, change: 0, trend: 'neutral' as const },
    hiddenOffers: { value: 0, change: 0, trend: 'neutral' as const },
  };

  // Fetch all cards and offers for export
  const { data: cardsData } = useCards({ page: 1, limit: 10000 });
  const cardsResponse = cardsData as CardsResponse | undefined;
  const cards = cardsResponse?.data?.data || [];

  const { data: allOffersData } = useQuery({
    queryKey: ['allOffersForExport', cards.map((c: any) => c.id).join(',')],
    queryFn: async () => {
      if (cards.length === 0) return [];
      const offersPromises = cards.map((card: any) => getOffersByCardId(card.id));
      const results = await Promise.all(offersPromises);
      return results.flatMap((result: any) => result.data || []);
    },
    enabled: cards.length > 0,
  });

  const allOffers = allOffersData || [];

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      let exportedCards = false;
      let exportedOffers = false;

      // Export Cards
      if (cards.length > 0) {
        await exportCardsToCSV(cards);
        exportedCards = true;
      }

      // Small delay to ensure first file downloads before second
      await new Promise(resolve => setTimeout(resolve, 500));

      // Export Offers
      if (allOffers.length > 0) {
        await exportOffersToCSV(allOffers);
        exportedOffers = true;
      }

      // Show success message
      if (exportedCards && exportedOffers) {
        toast({
          title: 'Success',
          description: `Exported ${cards.length} cards and ${allOffers.length} offers to CSV`,
        });
      } else if (exportedCards) {
        toast({
          title: 'Success',
          description: `Exported ${cards.length} cards to CSV`,
        });
      } else if (exportedOffers) {
        toast({
          title: 'Success',
          description: `Exported ${allOffers.length} offers to CSV`,
        });
      } else {
        toast({
          title: 'No Data',
          description: 'No cards or offers available to export',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const quickActions: Array<{
    name: string;
    icon: any;
    href: string;
    iconColor: string;
    onClick?: () => void;
  }> = [
    { name: 'Add New Card', icon: Plus, href: '/cards/add', iconColor: 'bg-blue-100 text-blue-600' },
    { name: 'Manage Offers', icon: Edit, href: '/offers', iconColor: 'bg-green-100 text-green-600' },
    { name: 'Update Referral Links', icon: Link2, href: '/offers', iconColor: 'bg-orange-100 text-orange-600' },
    { name: 'Export Card/Offer Data', icon: FileText, href: '#', iconColor: 'bg-purple-100 text-purple-600', onClick: handleExportData },
    { name: 'View Reports', icon: TrendingUp, href: '/activity', iconColor: 'bg-blue-100 text-blue-600' },
  ];

  // Get chart data from API or use defaults
  const chartData = dashboardResponse?.data?.chartData || [];

  // Map activity types to icons
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'card_added':
        return CreditCard;
      case 'offer_updated':
        return Tag;
      case 'referral_updated':
        return Link2;
      case 'offer_hidden':
        return EyeOff;
      case 'card_edited':
        return CreditCard;
      default:
        return Edit;
    }
  };

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'card_added':
        return 'text-blue-600 bg-blue-50';
      case 'offer_updated':
        return 'text-green-600 bg-green-50';
      case 'referral_updated':
        return 'text-orange-600 bg-orange-50';
      case 'offer_hidden':
        return 'text-purple-600 bg-purple-50';
      case 'card_edited':
        return 'text-blue-400 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get recent activities from API or use defaults
  const recentActivities = dashboardResponse?.data?.recentActivities?.map((activity) => ({
    type: activity.type,
    icon: getActivityIcon(activity.type),
    iconColor: getActivityIconColor(activity.type),
    description: activity.description,
    time: activity.time,
  })) || [];

  if (isLoading) {
    return (
      <main className="grow bg-gray-50 dark:bg-gray-900">
        <div className={`mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 ${sidebarOpen ? 'pt-6' : 'pt-4'}`}>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="grow bg-gray-50 dark:bg-gray-900">
        <div className={`mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 ${sidebarOpen ? 'pt-6' : 'pt-4'}`}>
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">Error loading dashboard data</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grow bg-gray-50 dark:bg-gray-900">
      <div className={`mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 ${sidebarOpen ? 'pt-6' : 'pt-4'}`}>
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Welcome back! Here's what's happening today.
            </p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Active Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Cards
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {metrics.activeCards.value}
                </p>
                <div className="flex items-center mt-2">
                  {metrics.activeCards.trend === 'up' ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">
                        ↑ {metrics.activeCards.change}% from last month
                      </span>
                    </>
                  ) : metrics.activeCards.trend === 'down' ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">
                        ↓ {metrics.activeCards.change}% from last month
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">— No change</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          {/* Missing Referrals */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Missing Referrals
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {metrics.missingReferrals.value}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm text-red-600">↓ Needs attention</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Link2 className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </div>

          {/* Total Offers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Offers
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {metrics.totalOffers.value.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {metrics.totalOffers.trend === 'up' ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">
                        ↑ {metrics.totalOffers.change}% from last month
                      </span>
                    </>
                  ) : metrics.totalOffers.trend === 'down' ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">
                        ↓ {metrics.totalOffers.change}% from last month
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">— No change</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Tag className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          {/* Hidden Offers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Hidden Offers
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {metrics.hiddenOffers.value}
                </p>
                <div className="flex items-center mt-2">
                  {metrics.hiddenOffers.trend === 'up' ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">
                        ↑ {metrics.hiddenOffers.change}% from last month
                      </span>
                    </>
                  ) : metrics.hiddenOffers.trend === 'down' ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">
                        ↓ {metrics.hiddenOffers.change}% from last month
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">— No change</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <EyeOff className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Activity Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Card Activity
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Monthly card additions and updates
                </p>
              </div>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
                <option>Last year</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar dataKey="added" fill="#3b82f6" name="Cards Added" radius={[4, 4, 0, 0]} />
                <Bar dataKey="updated" fill="#10b981" name="Cards Updated" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                if (action.onClick) {
                  return (
                    <button
                      key={index}
                      onClick={action.onClick}
                      disabled={isExporting}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className={`p-2 rounded-lg ${action.iconColor} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {action.name}
                      </span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className={`p-2 rounded-lg ${action.iconColor} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {action.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest updates and changes
              </p>
            </div>
            <Link
              to="/activity"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${activity.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
