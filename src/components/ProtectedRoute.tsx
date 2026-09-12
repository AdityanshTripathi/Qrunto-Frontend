import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  defaultRouteForRole,
  hasCapability,
  type Capability,
  type UserRole,
} from '../lib/capabilities';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requiredCapability?: Capability | Capability[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, requiredCapability, children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const requiredCapabilities = requiredCapability
    ? Array.isArray(requiredCapability) ? requiredCapability : [requiredCapability]
    : [];
  const lacksAccess = !user
    || (allowedRoles && !allowedRoles.includes(user.role))
    || (requiredCapabilities.length > 0 && !requiredCapabilities.some(capability => hasCapability(user.role, capability)));

  if (lacksAccess) {
    const destination = defaultRouteForRole(user?.role);
    return <Navigate to={destination === location.pathname ? '/unauthorized' : destination} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
