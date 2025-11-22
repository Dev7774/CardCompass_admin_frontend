import { Download, Plus, CreditCard, Link2, Tag, EyeOff, TrendingUp, TrendingDown, Minus, Edit, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  
  // Mock data - will be replaced with API calls later
  const metrics = {
    activeCards: { value: 248, change: 12, trend: 'up' },
    missingReferrals: { value: 34, change: 0, trend: 'down' },
    totalOffers: { value: 1247, change: 8, trend: 'up' },
    hiddenOffers: { value: 89, change: 0, trend: 'neutral' },
  };

  const quickActions = [
    { name: 'Add New Card', icon: Plus, href: '/cards/new', iconColor: 'bg-blue-100 text-blue-600' },
    { name: 'Edit Offers', icon: Edit, href: '/offers', iconColor: 'bg-green-100 text-green-600' },
    { name: 'Update Referral Links', icon: Link2, href: '/cards?filter=no-referral', iconColor: 'bg-orange-100 text-orange-600' },
    { name: 'Export Data', icon: FileText, href: '#', iconColor: 'bg-purple-100 text-purple-600' },
    { name: 'View Reports', icon: TrendingUp, href: '#', iconColor: 'bg-blue-100 text-blue-600' },
  ];

  const chartData = [
    { month: 'Jan', added: 42, updated: 28 },
    { month: 'Feb', added: 38, updated: 32 },
    { month: 'Mar', added: 56, updated: 41 },
    { month: 'Apr', added: 48, updated: 37 },
    { month: 'May', added: 61, updated: 45 },
    { month: 'Jun', added: 58, updated: 42 },
  ];

  const recentActivities = [
    {
      type: 'card_added',
      icon: CreditCard,
      iconColor: 'text-blue-600 bg-blue-50',
      description: 'Chase Sapphire Preferred was added to the system.',
      time: '2 hours ago',
    },
    {
      type: 'offer_updated',
      icon: Tag,
      iconColor: 'text-green-600 bg-green-50',
      description: 'Welcome bonus increased for American Express Gold.',
      time: '5 hours ago',
    },
    {
      type: 'referral_updated',
      icon: Link2,
      iconColor: 'text-orange-600 bg-orange-50',
      description: 'Capital One Venture X referral link has been updated.',
      time: '1 day ago',
    },
    {
      type: 'offer_hidden',
      icon: EyeOff,
      iconColor: 'text-purple-600 bg-purple-50',
      description: 'Citi Premier Card offer was hidden from public view.',
      time: '2 days ago',
    },
    {
      type: 'card_edited',
      icon: CreditCard,
      iconColor: 'text-blue-400 bg-blue-50',
      description: 'Card details edited for Bank of America Customized Cash.',
      time: '3 days ago',
    },
  ];

  return (
    <main className="grow bg-gray-50 dark:bg-gray-900">
      <div className={`mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 ${sidebarOpen ? 'pt-6' : 'pt-4'}`}>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="flex items-center bg-primary-600 hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
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
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">
                        ↓ {metrics.activeCards.change}% from last month
                      </span>
                    </>
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
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    ↑ {metrics.totalOffers.change}% from last month
                  </span>
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
                  <span className="text-sm text-gray-400">— No change</span>
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
                  domain={[0, 60]}
                  ticks={[0, 10, 20, 30, 40, 50, 60]}
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
            {recentActivities.map((activity, index) => {
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
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
