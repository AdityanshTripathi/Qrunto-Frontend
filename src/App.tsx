import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Landing } from './pages/Landing';
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
import { SuperAdminDashboard } from './pages/dashboard/SuperAdminDashboard';
import { Settings } from './pages/dashboard/Settings';
import { CustomerMenu } from './pages/CustomerMenu';
import { useAuthStore } from './store/authStore';
import { WaitersPage } from './pages/dashboard/WaitersPage';
import { WaiterDashboard } from './pages/waiter/WaiterDashboard';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Refund } from './pages/Refund';
import { Contact } from './pages/Contact';
import { Help } from './pages/Help';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      {/* Toast provider */}
      <Toaster position="top-right" theme="dark" richColors closeButton />
      
      <Routes>
        {/* Root route: Landing page for unauthenticated users, dashboard redirect for authenticated */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to={user?.role === 'WAITER' ? "/waiter-dashboard" : "/dashboard"} replace /> : <Landing />} 
        />

        {/* Public auth routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
        />

        {/* Public Policy & Support routes */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RESTAURANT_OWNER', 'STAFF']} />}>
          <Route path="/subscription" element={<Subscription />} />
          
          <Route 
            path="/dashboard" 
            element={user?.role === 'SUPER_ADMIN' ? <SuperAdminDashboard /> : <DashboardLayout />}
          >
            <Route index element={<DashboardOverview />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="waiters" element={<WaitersPage />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="subscription" element={<SubscriptionManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['WAITER']} />}>
          <Route path="/waiter-dashboard" element={<WaiterDashboard />} />
        </Route>

        {/* Public QR ordering route — no auth required */}
        <Route path="/order/:slug/:tableNumber" element={<CustomerMenu />} />

        {/* Catch-all redirect */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? (user?.role === 'WAITER' ? "/waiter-dashboard" : "/dashboard") : "/"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
