/**
 * ─── Protected Route ──────────────────────────────────────────────────────────
 * Wraps routes that require authentication.
 * If the user is not logged in, redirects to /login.
 * Shows nothing while auth state is being rehydrated from localStorage.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, token, loading } = useAuth();

    // Wait for localStorage rehydration before making a redirect decision
    if (loading) return null;

    // Not authenticated → redirect to login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
