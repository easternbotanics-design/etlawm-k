/**
 * ─── Auth Context ─────────────────────────────────────────────────────────────
 * Provides authentication state (user + token) to the entire React app.
 * State is persisted in localStorage so sessions survive page refreshes.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_SERVER_API;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user,  setUser]  = useState(null);
    const [token, setToken] = useState(null);
    // true while we're rehydrating from localStorage on first load
    const [loading, setLoading] = useState(true);

    // ── Rehydrate from localStorage on mount ──────────────────────────────────
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser  = localStorage.getItem('etlawm_user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Fetch fresh profile details from the server to keep session in sync
                fetch(`${API}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`
                    }
                })
                .then(res => {
                    if (res.status === 401 || res.status === 403 || res.status === 404) {
                        // Stale/invalid token - clear session
                        setToken(null);
                        setUser(null);
                        localStorage.removeItem('token');
                        localStorage.removeItem('etlawm_user');
                        return;
                    }
                    if (res.ok) return res.json();
                    throw new Error('Network response was not ok');
                })
                .then(data => {
                    if (data && data.success && data.user) {
                        setUser(data.user);
                        localStorage.setItem('etlawm_user', JSON.stringify(data.user));
                    }
                })
                .catch(err => {
                    console.error('[AuthContext] Profile sync failed:', err);
                })
                .finally(() => {
                    setLoading(false);
                });
            } catch {
                // Corrupted storage — clear and start fresh
                localStorage.removeItem('token');
                localStorage.removeItem('etlawm_user');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    /**
     * Call after OTP verification or onboarding to persist the session.
     * @param {string} newToken  JWT returned from the server
     * @param {object} newUser   User object returned from the server
     */
    const login = useCallback((newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('etlawm_user', JSON.stringify(newUser));
    }, []);

    /**
     * Update stored user data (e.g. after onboarding step saves name).
     * @param {object} updatedUser
     */
    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('etlawm_user', JSON.stringify(updatedUser));
    }, []);

    /**
     * Clear local state and optionally call the server logout endpoint.
     */
    const logout = useCallback(async () => {
        const currentToken = localStorage.getItem('token');
        // Fire-and-forget server-side session deletion
        if (currentToken) {
            fetch(`${API}/api/auth/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${currentToken}` },
            }).catch(() => {/* server errors on logout are non-critical */});
        }
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('etlawm_user');
    }, []);

    const isAdmin = user?.is_admin ?? false;

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth state anywhere in the component tree.
 * @throws if used outside <AuthProvider>
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
