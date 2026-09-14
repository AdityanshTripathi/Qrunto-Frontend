import { useLocation } from 'react-router-dom';

export function useDashboardNavigation() {
  const location = useLocation();
  return { pathname: location.pathname };
}
