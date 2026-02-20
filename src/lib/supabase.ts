/**
 * Supabase-klient — Oppretter og eksporterer tilkoblingen til Supabase.
 * Brukes av orderService, emailService og adminService.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase-miljøvariabler mangler. Bestillinger vil ikke bli lagret.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
