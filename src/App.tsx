import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Subscription } from './pages/Subscription';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { MenuManagement } from './pages/dashboard/MenuManagement';
import { CategoryManagement } from './pages/dashboard/CategoryManagement';
import { TableManagement } from './pages/dashboard/TableManagement';
import { OrderManagement } from './pages/dashboard/OrderManagement';
import { Analytics } from './pages/dashboard/Analytics';
import { SubscriptionManagement } from './pages/dashboard/SubscriptionManagement';
import { Settings } from './pages/dashboard/Settings';
import { useAuthStore } from './store/authStore';
import { CustomerMenu } from './pages/CustomerMenu';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      {/* Toast provider */}
      <Toaster position="top-right" theme="dark" richColors closeButton />
      
      <Routes>
        {/* Public auth routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
        />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/subscription" element={<Subscription />} />
          
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="subscription" element={<SubscriptionManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Public QR ordering route — no auth required */}
        <Route path="/order/:slug/:tableNumber" element={<CustomerMenu />} />

        {/* Catch-all redirect */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
