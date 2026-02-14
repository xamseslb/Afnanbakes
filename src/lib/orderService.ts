import { supabase } from './supabase';
import { OrderData, occasionLabels, productLabels } from './orderTypes';
import { sendConfirmationEmail } from './emailService';

export interface OrderRecord {
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
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

/**
 * Generate a human-readable order reference.
 * Format: AB-YYMMDD-XXXX (e.g. AB-250209-A3K7)
 */
export function generateOrderRef(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `AB-${yy}${mm}${dd}-${code}`;
}

/**
 * Upload inspiration images to Supabase Storage and return their public URLs.
 */
async function uploadImages(images: File[]): Promise<string[]> {
    if (images.length === 0) return [];

    const urls: string[] = [];

    for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `order-images/${fileName}`;

        const { error } = await supabase.storage
            .from('orders')
            .upload(filePath, file);

        if (error) {
            console.error('Image upload failed:', error.message);
            continue;
        }

        const { data: urlData } = supabase.storage
            .from('orders')
            .getPublicUrl(filePath);

        urls.push(urlData.publicUrl);
    }

    return urls;
}

/**
 * Submit an order to Supabase.
 * Uploads images first, then inserts the order record with a unique reference.
 * After success, sends a confirmation email (non-blocking).
 */
export async function submitOrder(orderData: OrderData): Promise<{ success: boolean; orderRef?: string; error?: string }> {
    try {
        // Upload images
        const imageUrls = await uploadImages(orderData.images);

        // Generate unique order reference
        const orderRef = generateOrderRef();

        // Build the order record
        const record: OrderRecord = {
            order_ref: orderRef,
            customer_name: orderData.customerName,
            customer_email: orderData.customerEmail,
            customer_phone: orderData.customerPhone,
            occasion: orderData.occasion ? occasionLabels[orderData.occasion] : '',
            product_type: orderData.productType ? productLabels[orderData.productType] : '',
            package_name: orderData.selectedPackage?.name || (orderData.isCustomDesign ? 'Eget design' : ''),
            package_price: orderData.selectedPackage?.price ?? null,
            is_custom_design: orderData.isCustomDesign,
            description: orderData.description,
            ideas: orderData.ideas,
            cake_name: orderData.cakeName,
            cake_text: orderData.cakeText,
            quantity: orderData.quantity,
            image_urls: imageUrls,
            status: 'pending',
        };

        const { error } = await supabase
            .from('orders')
            .insert([record]);

        if (error) {
            console.error('Order submission failed:', error.message);
            return { success: false, error: error.message };
        }

        // Send confirmation email (fire-and-forget, don't block the UI)
        sendConfirmationEmail(orderData, orderRef).catch((err) =>
            console.error('Email sending failed:', err)
        );

        return { success: true, orderRef };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Ukjent feil';
        console.error('Order submission error:', message);
        return { success: false, error: message };
    }
}
