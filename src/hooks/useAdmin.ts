/**
 * useAdmin — Håndterer admin-autentisering med Supabase Auth.
 * Erstatter gammel client-side passordsjekk med ekte server-side auth.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useAdmin() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    // Sjekk om bruker allerede er innlogget via Supabase session
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session);
            setLoading(false);
        });

        // Lytt på auth-endringer (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    /** Logg inn med e-post og passord via Supabase Auth */
    const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return { success: false, error: error.message };
        }

        setIsAuthenticated(true);
        return { success: true };
    }, []);

    /** Logg ut og fjern sesjonen */
    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
    }, []);

    return { isAuthenticated, loading, login, logout };
}
