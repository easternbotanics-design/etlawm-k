import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route guard — redirects to /login if not authenticated,
 * to / if authenticated but not admin.
 */
export default function AdminRoute({ children }) {
    const { user, token, loading, isAdmin } = useAuth();

    // Wait for localStorage rehydration before making a redirect decision
    if (loading) return null;

    // Not authenticated → redirect to login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated but not admin → redirect to home page
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
