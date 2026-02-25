/**
 * Kalendertjeneste — Håndterer tilgjengelighet, kapasitet og blokkerte datoer.
 * Maks 3 bestillinger per dag. Kanselleringer frigjør plasser automatisk.
 */
import { supabase } from './supabase';

const MAX_ORDERS_PER_DAY = 3;
const BOOKING_WINDOW_DAYS = 60;

export type DateStatus = 'available' | 'full' | 'blocked';

export interface DateAvailability {
    date: string;          // YYYY-MM-DD
    status: DateStatus;
    orderCount: number;    // antall aktive bestillinger
    isBlocked: boolean;    // manuelt blokkert av admin
}

export interface BlockedDate {
    id: string;
    date: string;
    reason: string;
    created_at: string;
}

/**
 * Henter tilgjengelighet for alle dager i et gitt datovindu.
 * Teller bare aktive bestillinger (ikke kansellerte).
 */
export async function fetchAvailability(
    fromDate?: string,
    toDate?: string
): Promise<DateAvailability[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const from = fromDate || formatDate(today);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + BOOKING_WINDOW_DAYS);
    const to = toDate || formatDate(endDate);

    // Hent aktive bestillinger med leveringsdato i vinduet
    // Ekskluder ubetalte (pending_payment) og kansellerte ordrer
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('delivery_date, status')
        .in('status', ['pending', 'confirmed', 'completed'])
        .not('delivery_date', 'is', null)
        .gte('delivery_date', from)
        .lte('delivery_date', to);

    if (ordersError) {
        console.error('Henting av ordrer feilet:', ordersError.message);
    }

    // Hent blokkerte datoer
    const { data: blockedDates, error: blockedError } = await supabase
        .from('blocked_dates')
        .select('date')
        .gte('date', from)
        .lte('date', to);

    if (blockedError) {
        console.error('Henting av blokkerte datoer feilet:', blockedError.message);
    }

    // Tell opp bestillinger per dato
    const orderCounts: Record<string, number> = {};
    (orders || []).forEach((o: { delivery_date: string }) => {
        const d = o.delivery_date;
        orderCounts[d] = (orderCounts[d] || 0) + 1;
    });

    // Sett med blokkerte datoer
    const blockedSet = new Set(
        (blockedDates || []).map((b: { date: string }) => b.date)
    );

    // Bygg tilgjengelighetsliste for hver dag
    const availability: DateAvailability[] = [];
    const current = new Date(from);
    const end = new Date(to);

    while (current <= end) {
        const dateStr = formatDate(current);
        const count = orderCounts[dateStr] || 0;
        const isBlocked = blockedSet.has(dateStr);

        let status: DateStatus = 'available';
        if (isBlocked) {
            status = 'blocked';
        } else if (count >= MAX_ORDERS_PER_DAY) {
            status = 'full';
        }

        availability.push({
            date: dateStr,
            status,
            orderCount: count,
            isBlocked,
        });

        current.setDate(current.getDate() + 1);
    }

    return availability;
}

/**
 * Sjekker om en spesifikk dato er tilgjengelig for bestilling.
 */
export async function isDateAvailable(date: string): Promise<boolean> {
    // Sjekk om dato er blokkert
    const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('id')
        .eq('date', date)
        .maybeSingle();

    if (blocked) return false;

    // Tell aktive bestillinger for datoen
    const { count, error } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('delivery_date', date)
        .not('status', 'eq', 'cancelled');

    if (error) {
        console.error('Tilgjengelighetssjekk feilet:', error.message);
        return false;
    }

    return (count || 0) < MAX_ORDERS_PER_DAY;
}

// ─── Admin-funksjoner ────────────────────────────────────────────────────────

/** Henter alle blokkerte datoer */
export async function fetchBlockedDates(): Promise<BlockedDate[]> {
    const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        console.error('Henting av blokkerte datoer feilet:', error.message);
        return [];
    }

    return (data as BlockedDate[]) || [];
}

/** Blokkerer en dato */
export async function blockDate(date: string, reason = ''): Promise<boolean> {
    const { error } = await supabase
        .from('blocked_dates')
        .upsert({ date, reason }, { onConflict: 'date' });

    if (error) {
        console.error('Blokkering feilet:', error.message);
        return false;
    }

    return true;
}

/** Fjerner blokkering av en dato */
export async function unblockDate(date: string): Promise<boolean> {
    const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('date', date);

    if (error) {
        console.error('Avblokkering feilet:', error.message);
        return false;
    }

    return true;
}

// ─── Hjelpefunksjoner ────────────────────────────────────────────────────────

/** Formatterer Date til YYYY-MM-DD */
export function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Formatterer YYYY-MM-DD til norsk lesbar dato */
export function formatNorwegianDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('nb-NO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/** Maks bestillinger per dag */
export { MAX_ORDERS_PER_DAY, BOOKING_WINDOW_DAYS };
