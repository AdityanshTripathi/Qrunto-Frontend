import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import ScrollToTop from './components/ScrollToTop';

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
const Settings = React.lazy(() => import('./pages/dashboard/Settings'));
const CustomerMenu = React.lazy(() => import('./pages/CustomerMenu'));
const WaitersPage = React.lazy(() => import('./pages/dashboard/WaitersPage'));
const WaiterDashboard = React.lazy(() => import('./pages/waiter/WaiterDashboard'));
const Terms = React.lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Privacy = React.lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Refund = React.lazy(() => import('./pages/Refund').then(m => ({ default: m.Refund })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Help = React.lazy(() => import('./pages/Help').then(m => ({ default: m.Help })));

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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Toast provider */}
      <Toaster position="top-right" theme="dark" richColors closeButton />
      
      <Suspense fallback={<LoadingFallback />}>
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
              <Route path="bills" element={<BillsPage />} />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
