import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  MenuIcon,
  CreditCard,
  Tag,
  History,
  User,
  UserCircle,
  Lock,
  LogOut,
} from 'lucide-react';
import ProfileModal from '@/components/modals/ProfileModal';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import { handleLogout } from '@/services/api/apiService';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userCookie = Cookies.get('user');
  const user = userCookie ? JSON.parse(userCookie) : null;
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Cards', href: '/cards', icon: CreditCard },
    { name: 'Offers', href: '/offers', icon: Tag },
    { name: 'Activity Log', href: '/activity', icon: History },
  ];

  return (
    <div
      className={`no-scrollbar absolute left-0 top-0 z-40 flex h-dvh w-72 min-w-72 shrink-0 flex-col overflow-y-auto bg-white p-0 transition-all duration-200 ease-in-out dark:bg-gray-800 pointer-events-auto shadow-lg ${
        sidebarOpen
          ? 'translate-x-0 lg:static lg:translate-x-0'
          : '-translate-x-72 lg:absolute'
      }`}
    >
      <aside className="relative size-full rounded-lg bg-white px-4 py-6 dark:bg-slate-800 flex flex-col">
        {/* Header Section with Logo, Text, and Hamburger Button */}
        <div className="relative flex items-center justify-between mb-6">
          {/* Logo and Text */}
          <div className="flex items-center gap-3 flex-1">
            <img
              src="/Logo.png"
              alt="CardCompass Logo"
              className="w-16 h-16 object-contain flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="flex flex-col justify-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                CardCompass
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Toggle Button - Top Right */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => setSidebarOpen(false)}
                  className={`rounded-md flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 ${
                    sidebarOpen ? 'p-2' : 'p-2'
                  }`}
                >
                  <MenuIcon className={sidebarOpen ? 'w-8 h-8' : 'w-5 h-5'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="-ml-2">
                <h6 className="p-1 text-xs font-semibold">
                  {sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                </h6>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-1 flex-col">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || (item.href === '/' && location.pathname === '/');
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user?.name || 'Admin'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || 'admin@cardcompass.com'}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              side="right" 
              sideOffset={8}
              className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-1"
            >
              <DropdownMenuItem 
                onClick={() => setProfileModalOpen(true)}
                className="cursor-pointer px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
              >
                <UserCircle className="mr-3 h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setChangePasswordModalOpen(true)}
                className="cursor-pointer px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
              >
                <Lock className="mr-3 h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem
                onClick={() => {
                  handleLogout();
                  navigate('/login');
                }}
                className="cursor-pointer px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                <LogOut className="mr-3 h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Modals */}
        <ProfileModal
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
        />
        <ChangePasswordModal
          open={changePasswordModalOpen}
          onOpenChange={setChangePasswordModalOpen}
        />
      </aside>
    </div>
  );
};

export default Sidebar;
