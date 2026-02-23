/**
 * Bestillingstjeneste — Håndterer opplasting av bilder, generering av
 * ordrereferanse, og innsending av bestillinger til Supabase.
 */
import { supabase } from './supabase';
import { OrderData, occasionLabels, productLabels, PHOTO_ADDON_PRICE } from './orderTypes';
import { sendConfirmationEmail } from './emailService';

/** En ordrepost slik den lagres i Supabase-databasen */
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
    delivery_date: string;
    status: 'pending' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled';
}

/**
 * Genererer en lesbar ordrereferanse.
 * Format: AB-YYMMDD-XXXX (f.eks. AB-250209-A3K7)
 */
export function generateOrderRef(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    // Unngår I/O/0/1 for å hindre forveksling
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `AB-${yy}${mm}${dd}-${code}`;
}

/**
 * Laster opp inspirasjonsbilder til Supabase Storage.
 * Returnerer offentlige URL-er for de opplastede bildene.
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
            console.error('Bildeopplasting feilet:', error.message);
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
 * Oppretter en Stripe Checkout-session via Edge Function.
 * Returnerer URL til Stripe Checkout-siden.
 * Brukes for bestillinger med fast pris (ikke «Eget design»).
 */
export async function createCheckoutSession(
    orderData: OrderData
): Promise<{ success: boolean; url?: string; orderRef?: string; error?: string }> {
    try {
        // 1. Last opp bilder først
        const imageUrls = await uploadImages(orderData.images);

        // 2. Kall Edge Function
        const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: {
                customerName: orderData.customerName,
                customerEmail: orderData.customerEmail,
                customerPhone: orderData.customerPhone,
                occasion: orderData.occasion ? occasionLabels[orderData.occasion] : '',
                productType: orderData.productType ? productLabels[orderData.productType] : '',
                packageName: orderData.selectedSize
                    ? `${orderData.cakeName || 'Kake'} (${orderData.selectedSize.persons})`
                    : orderData.selectedPackage?.name || orderData.cakeName || 'Bestilling',
                packagePrice: orderData.selectedSize
                    ? orderData.selectedSize.price + (orderData.withPhoto ? PHOTO_ADDON_PRICE : 0)
                    : orderData.selectedPackage?.price || orderData.directPrice || 0,
                quantity: orderData.quantity || '1',
                description: orderData.description,
                ideas: orderData.ideas,
                cakeName: orderData.cakeName,
                cakeText: orderData.cakeText,
                deliveryDate: orderData.deliveryDate,
                imageUrls,
                isCustomDesign: orderData.isCustomDesign,
                // Nye felter
                size: orderData.selectedSize?.label || '',
                sizePersons: orderData.selectedSize?.persons || '',
                flavor: orderData.selectedFlavor?.label || '',
                color: orderData.selectedColor?.label || '',
                withPhoto: orderData.withPhoto,
            },
        });

        if (error) {
            console.error('Checkout session feilet:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true, url: data.url, orderRef: data.orderRef };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Ukjent feil';
        console.error('Checkout-feil:', message);
        return { success: false, error: message };
    }
}

/**
 * Sender en bestilling til Supabase (uten betaling).
 * Brukes for «Eget design»-bestillinger uten fast pris.
 * 1. Laster opp bilder
 * 2. Genererer unik ordrereferanse
 * 3. Lagrer ordren i databasen
 * 4. Sender bekreftelsesmail (ikke-blokkerende)
 */
export async function submitOrder(
    orderData: OrderData
): Promise<{ success: boolean; orderRef?: string; error?: string }> {
    try {
        // 1. Last opp bilder
        const imageUrls = await uploadImages(orderData.images);

        // 2. Generer unik ordrereferanse
        const orderRef = generateOrderRef();

        // 3. Bygg ordrepost for databasen
        const record: OrderRecord = {
            order_ref: orderRef,
            customer_name: orderData.customerName,
            customer_email: orderData.customerEmail,
            customer_phone: orderData.customerPhone,
            occasion: orderData.occasion ? occasionLabels[orderData.occasion] : '',
            product_type: orderData.productType ? productLabels[orderData.productType] : '',
            package_name: orderData.selectedSize
                ? `${occasionLabels[orderData.occasion!]}-kake (${orderData.selectedSize.persons})`
                : orderData.selectedPackage?.name || (orderData.isCustomDesign ? 'Eget design' : ''),
            package_price: orderData.selectedSize
                ? orderData.selectedSize.price + (orderData.withPhoto ? PHOTO_ADDON_PRICE : 0)
                : orderData.selectedPackage?.price ?? null,
            is_custom_design: orderData.isCustomDesign,
            description: [
                orderData.description,
                orderData.selectedFlavor ? `Smak: ${orderData.selectedFlavor.label}` : '',
                orderData.selectedColor ? `Farge: ${orderData.selectedColor.label}` : '',
                orderData.withPhoto ? 'Med spiselig bilde (+200 kr)' : '',
            ].filter(Boolean).join(' | '),
            ideas: orderData.ideas,
            cake_name: orderData.cakeName,
            cake_text: orderData.cakeText,
            quantity: orderData.quantity,
            image_urls: imageUrls,
            delivery_date: orderData.deliveryDate,
            status: 'pending',
        };

        const { error } = await supabase
            .from('orders')
            .insert([record]);

        if (error) {
            console.error('Bestilling feilet:', error.message);
            return { success: false, error: error.message };
        }

        // 4. Send bekreftelsesmail (brann-og-glem, blokkerer ikke UI)
        sendConfirmationEmail(orderData, orderRef).catch((err) =>
            console.error('E-post sending feilet:', err)
        );

        return { success: true, orderRef };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Ukjent feil';
        console.error('Bestillingsfeil:', message);
        return { success: false, error: message };
    }
}

