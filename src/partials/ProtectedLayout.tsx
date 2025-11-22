import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from './Header';
import Sidebar from './Sidebar';

interface ProtectedLayoutProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const ProtectedLayout = ({
  sidebarOpen,
  setSidebarOpen,
}: ProtectedLayoutProps) => {
  const token = Cookies.get('accessToken');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.includes('create')) setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-800 opacity-90 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-200">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Outlet context={{ sidebarOpen }} />
      </div>
    </div>
  );
};

export default ProtectedLayout;

