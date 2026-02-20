/**
 * useAdmin — Håndterer admin-autentisering med sessionStorage.
 * Passord valideres mot VITE_ADMIN_PASSWORD fra miljøvariabler.
 */
import { useState, useCallback } from 'react';

/** Nøkkel for admin-sesjon i sessionStorage */
const ADMIN_KEY = 'afnanbakes_admin_session';

export function useAdmin() {
    /** Sjekk om admin allerede er innlogget fra sessionStorage */
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem(ADMIN_KEY) === 'true';
    });

    /** Logg inn med passord — returnerer true hvis riktig */
    const login = useCallback((password: string): boolean => {
        const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
        if (password === correctPassword) {
            sessionStorage.setItem(ADMIN_KEY, 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    }, []);

    /** Logg ut og fjern sesjonen */
    const logout = useCallback(() => {
        sessionStorage.removeItem(ADMIN_KEY);
        setIsAuthenticated(false);
    }, []);

    return { isAuthenticated, login, logout };
}
