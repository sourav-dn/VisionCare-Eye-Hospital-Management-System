import { Navigate, Outlet } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { PageLoader } from '../components/UI';

/**
 * Wraps all protected pages — shows sidebar, topbar, and content area.
 * Redirects to /login if not authenticated or wrong role.
 * Manages mobile sidebar drawer state.
 */
export default function RoleLayout({ allowedRoles }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return (
    <>
      {/* Mobile backdrop overlay — closes sidebar when clicked */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="page-wrapper">
        <main className="page-content">
          {/* Pass toggle handler via React context or outlet context */}
          <Outlet context={{ onMenuToggle: openSidebar }} />
        </main>
      </div>
    </>
  );
}
