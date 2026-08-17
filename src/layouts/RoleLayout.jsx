import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { PageLoader } from '../components/UI';

/**
 * Wraps all protected pages — shows sidebar, topbar, and content area.
 * Redirects to /login if not authenticated or wrong role.
 */
export default function RoleLayout({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return (
    <>
      <Sidebar />
      <div className="page-wrapper">
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
