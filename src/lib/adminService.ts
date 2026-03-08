/**
 * Admin-tjeneste — Henter bestillinger, oppdaterer status, og beregner statistikk.
 * Brukes av AdminDashboard og AdminOrders.
 */
import { supabase } from './supabase';

/** En ordrepost slik den hentes fra Supabase (inkludert id og tidsstempel) */
export interface OrderRow {
    id: string;
    created_at: string;
    order_ref: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    occasion: string;
    product_type: string;
    package_name: string;
    package_price: number | null;
    is_custom_design: boolean;
    description: string;
    ideas: string;
    cake_name: string;
    cake_text: string;
    quantity: string;
    image_urls: string[];
    edible_image_url: string | null;
    delivery_date: string;
    status: 'pending' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled';
}

/** Ordrens mulige statuser */
export type OrderStatus = OrderRow['status'];

/**
 * En GRUPPERT ordre — alle rader med samme basis-referanse (AB-XXXXXX)
 * samles som én logisk bestilling med flere produkter.
 */
export interface GroupedOrder {
    /** Basis-referanse uten suffiks, f.eks. "AB-AJ9UDP" */
    baseRef: string;
    /** Alle DB-rader som tilhører denne bestillingen */
    items: OrderRow[];
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    created_at: string;
    status: OrderStatus;
    /** Alle unike leveringsdatoer */
    delivery_dates: string[];
    /** Totalsum av alle produkter */
    total_price: number;
}

/** Norske navn for hver ordrestatus */
export const statusLabels: Record<OrderStatus, string> = {
    pending_payment: 'Venter betaling',
    pending: 'Ny',
    confirmed: 'Bekreftet',
    completed: 'Fullført',
    cancelled: 'Kansellert',
};

/** Tailwind-farger for hver ordrestatus (brukes i badges) */
export const statusColors: Record<OrderStatus, string> = {
    pending_payment: 'bg-purple-100 text-purple-800',
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
};

/** Henter alle bestillinger, nyeste først (ekskluder ubetalte) */
export async function fetchOrders(): Promise<OrderRow[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .not('status', 'eq', 'pending_payment')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Henting av bestillinger feilet:', error.message);
        return [];
    }

    return (data as OrderRow[]) || [];
}

/**
 * Grupperer flate DB-rader til logiske bestillinger basert på basis-referansen.
 * AB-AJ9UDP-1, AB-AJ9UDP-2, AB-AJ9UDP-3 → én GroupedOrder med 3 produkter.
 * Enkelt-bestillinger (AB-A5ZUBR uten suffiks) beholdes som de er.
 */
export function groupOrders(rows: OrderRow[]): GroupedOrder[] {
    const map = new Map<string, OrderRow[]>();

    for (const row of rows) {
        // Fjern -N suffiks: "AB-AJ9UDP-1" → "AB-AJ9UDP", "AB-A5ZUBR" → "AB-A5ZUBR"
        const baseRef = row.order_ref.replace(/-\d+$/, '');
        const existing = map.get(baseRef) || [];
        existing.push(row);
        map.set(baseRef, existing);
    }

    const groups: GroupedOrder[] = [];
    map.forEach((items, baseRef) => {
        items.sort((a, b) => a.order_ref.localeCompare(b.order_ref));
        const first = items[0];
        const uniqueDates = [...new Set(items.map((i) => i.delivery_date).filter(Boolean))];

        groups.push({
            baseRef,
            items,
            customer_name: first.customer_name,
            customer_email: first.customer_email,
            customer_phone: first.customer_phone,
            created_at: first.created_at,
            status: first.status,
            delivery_dates: uniqueDates,
            total_price: items.reduce((sum, i) => sum + (i.package_price || 0), 0),
        });
    });

    return groups.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

/** Oppdaterer statusen til én ordrepost */
export async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
): Promise<boolean> {
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        console.error('Statusoppdatering feilet:', error.message);
        return false;
    }

    return true;
}

/** Oppdaterer status for ALLE rader i en gruppe (alle produkter i samme bestilling) */
export async function updateGroupStatus(
    baseRef: string,
    newStatus: OrderStatus
): Promise<boolean> {
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .like('order_ref', `${baseRef}%`);

    if (error) {
        console.error('Gruppestatusoppdatering feilet:', error.message);
        return false;
    }

    return true;
}

/** Beregner statistikk basert på grupperte ordrer (ikke enkelt-rader) */
export function getOrderStats(orders: OrderRow[]) {
    const groups = groupOrders(orders);
    return {
        pending: groups.filter((g) => g.status === 'pending').length,
        confirmed: groups.filter((g) => g.status === 'confirmed').length,
        completed: groups.filter((g) => g.status === 'completed').length,
        cancelled: groups.filter((g) => g.status === 'cancelled').length,
        total: groups.filter((g) => g.status !== 'cancelled').length,
    };
}
