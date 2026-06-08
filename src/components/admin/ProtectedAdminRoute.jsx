import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedAdminRoute — only allows access for authenticated users
 * whose JWT-verified role is 'admin', 'super_admin', or 'gym_admin'.
 *
 * Previously used a client-side localStorage check which could be bypassed.
 * Now relies entirely on the JWT token role verified by the backend.
 */
export default function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--surface-bg, #050507)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: 'var(--accent)', fontSize: 15, fontWeight: 600 }}>
          Verifying access…
        </div>
      </div>
    );
  }

  if (isAuthenticated && isAdmin) {
    return children;
  }

  return <Navigate to="/admin/login" replace />;
}
