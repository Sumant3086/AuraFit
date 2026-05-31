import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Still loading auth state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9d00ff' }}>Loading...</div>
      </div>
    );
  }

  // Fallback: also check legacy localStorage admin key
  const legacyAdmin = localStorage.getItem('admin');
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'sumant@gmail.com';
  let legacyAdminValid = false;
  if (legacyAdmin) {
    try {
      const adminData = JSON.parse(legacyAdmin);
      legacyAdminValid = adminData.email === ADMIN_EMAIL && adminData.role === 'admin';
    } catch {}
  }

  if ((isAuthenticated && isAdmin) || legacyAdminValid) {
    return children;
  }

  return <Navigate to="/admin/login" replace />;
};

export default ProtectedAdminRoute;
