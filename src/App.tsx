import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ActivityLog from './pages/ActivityLog';
import Cards from './pages/Cards';
import AddCard from './pages/AddCard';
import AddEditCard from './pages/AddEditCard';
import Offers from './pages/Offers';
import OffersList from './pages/OffersList';
import ProtectedLayout from './partials/ProtectedLayout';

function App() {
  // Sidebar should be open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check if we're on desktop (lg breakpoint)
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024; // lg breakpoint
    }
    return true;
  });
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html')!.style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html')!.style.scrollBehavior = '';
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <ProtectedLayout
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/cards/add" element={<AddEditCard />} />
        <Route path="/cards/add-from-api" element={<AddCard />} />
        <Route path="/cards/edit/:id" element={<AddEditCard />} />
        <Route path="/offers" element={<OffersList />} />
        <Route path="/offers/:cardId" element={<Offers />} />
        <Route path="/activity" element={<ActivityLog />} />
      </Route>
    </Routes>
  );
}

export default App;

