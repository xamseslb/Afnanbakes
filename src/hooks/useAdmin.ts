import { useState, useCallback } from 'react';

const ADMIN_KEY = 'afnanbakes_admin_session';

export function useAdmin() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem(ADMIN_KEY) === 'true';
    });

    const login = useCallback((password: string): boolean => {
        const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
        if (password === correctPassword) {
            sessionStorage.setItem(ADMIN_KEY, 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(ADMIN_KEY);
        setIsAuthenticated(false);
    }, []);

    return { isAuthenticated, login, logout };
}
