import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useTheme } from './context/ThemeContext';
import './components/notifications.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import ScrollToTop from './components/ScrollToTop';
import { defaultRouteForRole } from './lib/capabilities';

// Lazy-loaded pages and layouts
const Landing = React.lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Subscription = React.lazy(() => import('./pages/Subscription'));
const DashboardLayout = React.lazy(() => import('./components/DashboardLayout'));
const DashboardOverview = React.lazy(() => import('./pages/dashboard/DashboardOverview'));
const MenuManagement = React.lazy(() => import('./pages/dashboard/MenuManagement'));
const CategoryManagement = React.lazy(() => import('./pages/dashboard/CategoryManagement'));
const TableManagement = React.lazy(() => import('./pages/dashboard/TableManagement'));
const OrderManagement = React.lazy(() => import('./pages/dashboard/OrderManagement'));
const BillsPage = React.lazy(() => import('./pages/dashboard/BillsPage'));
const Analytics = React.lazy(() => import('./pages/dashboard/Analytics'));
const SubscriptionManagement = React.lazy(() => import('./pages/dashboard/SubscriptionManagement'));
const SuperAdminDashboard = React.lazy(() => import('./pages/dashboard/SuperAdminDashboard'));
const CustomersDirectory = React.lazy(() => import('./pages/dashboard/crm/CustomersDirectory'));
const CustomerDetail = React.lazy(() => import('./pages/dashboard/crm/CustomerDetail'));
const Settings = React.lazy(() => import('./pages/dashboard/Settings'));
const InventoryDashboard = React.lazy(() => import('./pages/dashboard/inventory/InventoryDashboard'));
const CustomerMenu = React.lazy(() => import('./pages/CustomerMenu'));
const WaitersPage = React.lazy(() => import('./pages/dashboard/WaitersPage'));
const WaiterDashboard = React.lazy(() => import('./pages/waiter/WaiterDashboard'));
const Terms = React.lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Privacy = React.lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Refund = React.lazy(() => import('./pages/Refund').then(m => ({ default: m.Refund })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Help = React.lazy(() => import('./pages/Help').then(m => ({ default: m.Help })));
const Unauthorized = React.lazy(() => import('./pages/Unauthorized').then(m => ({ default: m.Unauthorized })));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center gap-4">
    <div className="relative w-16 h-16">
      {/* Outer spinning gradient ring */}
      <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-[#FF6B35] animate-spin"></div>
      {/* Inner glowing pulse circle */}
      <div className="absolute inset-2 bg-gradient-to-tr from-[#FF6B35] to-orange-500 rounded-full animate-pulse shadow-lg shadow-orange-500/50 flex items-center justify-center">
        <span className="text-white font-black text-lg">O</span>
      </div>
    </div>
    <div className="flex flex-col items-center gap-1.5">
      <h3 className="font-extrabold text-sm text-white tracking-widest uppercase">Ordio</h3>
      <p className="text-[10px] text-gray-400 font-semibold tracking-wide animate-pulse">Loading experience...</p>
    </div>
  </div>
);


function App() {
  const { theme } = useTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Toast provider */}
      <Toaster position="top-right" theme={theme} closeButton />
      
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Root route: Landing page for unauthenticated users, dashboard redirect for authenticated */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to={defaultRouteForRole(user?.role)} replace /> : <Landing />}
          />

          {/* Public auth routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to={defaultRouteForRole(user?.role)} replace /> : <Login />}
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to={defaultRouteForRole(user?.role)} replace /> : <Register />}
          />

          {/* Public Policy & Support routes */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />

          {/* Protected dashboard routes */}
          <Route element={<ProtectedRoute requiredCapability={['superadmin.dashboard', 'owner.dashboard']} />}>
            <Route path="/subscription" element={<ProtectedRoute requiredCapability="subscription.manage"><Subscription /></ProtectedRoute>} />
            
            <Route 
              path="/dashboard" 
              element={user?.role === 'SUPER_ADMIN' ? <SuperAdminDashboard /> : <DashboardLayout />}
            >
              <Route index element={<ProtectedRoute requiredCapability="owner.dashboard"><DashboardOverview /></ProtectedRoute>} />
              <Route path="menu" element={<ProtectedRoute requiredCapability="menu.manage"><MenuManagement /></ProtectedRoute>} />
              <Route path="categories" element={<ProtectedRoute requiredCapability="categories.manage"><CategoryManagement /></ProtectedRoute>} />
              <Route path="tables" element={<ProtectedRoute requiredCapability="tables.manage"><TableManagement /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute requiredCapability="orders.manage"><OrderManagement /></ProtectedRoute>} />
              <Route path="bills" element={<ProtectedRoute requiredCapability="billing.manage"><BillsPage /></ProtectedRoute>} />
              <Route path="waiters" element={<ProtectedRoute requiredCapability="waiters.manage"><WaitersPage /></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute requiredCapability="analytics.view"><Analytics /></ProtectedRoute>} />
              <Route path="crm" element={<ProtectedRoute requiredCapability="crm.manage"><CustomersDirectory /></ProtectedRoute>} />
              <Route path="inventory" element={<ProtectedRoute requiredCapability="inventory.manage"><InventoryDashboard /></ProtectedRoute>} />
              <Route path="crm/customers/:id" element={<ProtectedRoute requiredCapability="crm.manage"><CustomerDetail /></ProtectedRoute>} />
              <Route path="subscription" element={<ProtectedRoute requiredCapability="subscription.manage"><SubscriptionManagement /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute requiredCapability="settings.manage"><Settings /></ProtectedRoute>} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requiredCapability="waiter.dashboard" />}>
            <Route path="/waiter-dashboard" element={<WaiterDashboard />} />
          </Route>

          {/* Public QR ordering route — no auth required */}
          <Route path="/order/:slug/:tableNumber" element={<CustomerMenu />} />
          <Route path="/unauthorized" element={isAuthenticated ? <Unauthorized /> : <Navigate to="/login" replace />} />

          {/* Catch-all redirect */}
          <Route 
            path="*" 
            element={<Navigate to={isAuthenticated ? defaultRouteForRole(user?.role) : "/"} replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
