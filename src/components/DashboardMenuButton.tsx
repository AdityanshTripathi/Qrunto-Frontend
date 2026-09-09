import { Menu } from 'lucide-react';
import { useSidebar } from './ui/sidebar';

export function DashboardMenuButton() {
  const { toggleSidebar, openMobile } = useSidebar();
  return (
    <button
      className="dash-icon-button dash-mobile-menu"
      onClick={toggleSidebar}
      aria-label="Open navigation"
      aria-expanded={openMobile}
    >
      <Menu size={18} />
    </button>
  );
}
