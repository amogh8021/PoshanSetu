import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components';

export function ProtectedRoute({ children, allowedRoles }) {
    const { token, role, loading } = useAuth();
    const location = useLocation();

    if (loading) return <LoadingSpinner message="Authenticating..." />;
    if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
    if (allowedRoles && !allowedRoles.includes(role))
        return <Navigate to="/unauthorized" replace />;

    return children;
}
