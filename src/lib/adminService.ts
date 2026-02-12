import { supabase } from './supabase';

export interface OrderRow {
    id: string;
    created_at: string;
    order_ref: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    occasion: string;
    product_type: string;
    description: string;
    ideas: string;
    cake_name: string;
    cake_text: string;
    quantity: string;
    image_urls: string[];
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export type OrderStatus = OrderRow['status'];

export const statusLabels: Record<OrderStatus, string> = {
    pending: 'Ny',
    confirmed: 'Bekreftet',
    completed: 'Fullført',
    cancelled: 'Kansellert',
};

export const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
};

/**
 * Fetch all orders, newest first.
 */
export async function fetchOrders(): Promise<OrderRow[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch orders:', error.message);
        return [];
    }

    return (data as OrderRow[]) || [];
}

/**
 * Update the status of an order.
 */
export async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
): Promise<boolean> {
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        console.error('Failed to update order status:', error.message);
        return false;
    }

    return true;
}

/**
 * Get order stats (counts per status).
 */
export function getOrderStats(orders: OrderRow[]) {
    return {
        pending: orders.filter((o) => o.status === 'pending').length,
        confirmed: orders.filter((o) => o.status === 'confirmed').length,
        completed: orders.filter((o) => o.status === 'completed').length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
        total: orders.length,
    };
}
