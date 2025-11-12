import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const admin = localStorage.getItem('admin');
  
  if (!admin) {
    // Not logged in as admin, redirect to admin login
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const adminData = JSON.parse(admin);
    // Verify it's the correct admin
    if (adminData.email === 'sumant@gmail.com' && adminData.role === 'admin') {
      return children;
    } else {
      // Invalid admin data, clear and redirect
      localStorage.removeItem('admin');
      return <Navigate to="/admin/login" replace />;
    }
  } catch (error) {
    // Invalid data format, clear and redirect
    localStorage.removeItem('admin');
    return <Navigate to="/admin/login" replace />;
  }
};

export default ProtectedAdminRoute;
