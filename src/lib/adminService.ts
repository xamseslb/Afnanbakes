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
    delivery_date: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

/** Ordrens mulige statuser */
export type OrderStatus = OrderRow['status'];

/** Norske navn for hver ordrestatus */
export const statusLabels: Record<OrderStatus, string> = {
    pending: 'Ny',
    confirmed: 'Bekreftet',
    completed: 'Fullført',
    cancelled: 'Kansellert',
};

/** Tailwind-farger for hver ordrestatus (brukes i badges) */
export const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
};

/** Henter alle bestillinger, nyeste først */
export async function fetchOrders(): Promise<OrderRow[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Henting av bestillinger feilet:', error.message);
        return [];
    }

    return (data as OrderRow[]) || [];
}

/** Oppdaterer statusen til en bestilling */
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

/** Beregner antall bestillinger per status */
export function getOrderStats(orders: OrderRow[]) {
    return {
        pending: orders.filter((o) => o.status === 'pending').length,
        confirmed: orders.filter((o) => o.status === 'confirmed').length,
        completed: orders.filter((o) => o.status === 'completed').length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
        total: orders.length,
    };
}
