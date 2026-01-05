// Protected route component - redirects to login if not authenticated
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component that ensures only authenticated users can access
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

