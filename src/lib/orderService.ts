/**
 * Bestillingstjeneste — Håndterer opplasting av bilder, generering av
 * ordrereferanse, og innsending av bestillinger til Supabase.
 */
import { supabase } from './supabase';
import { OrderData, occasionLabels, productLabels, PHOTO_ADDON_PRICE } from './orderTypes';
import { OrderDraft } from './types';
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

/** Tillatte bildetyper for opplasting */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
/** Maks filstørrelse per bilde (5 MB) */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
/** Maks antall bilder per bestilling */
const MAX_IMAGE_COUNT = 5;

/**
 * Laster opp inspirasjonsbilder til Supabase Storage.
 * Validerer filtype, størrelse og antall før opplasting.
 * Returnerer offentlige URL-er for de opplastede bildene.
 */
export async function uploadImages(images: File[]): Promise<string[]> {
    console.log('[DEBUG uploadImages] Called with', images.length, 'images');
    if (images.length === 0) { console.log('[DEBUG uploadImages] No images, returning []'); return []; }

    // Begrens antall bilder
    const filesToUpload = images.slice(0, MAX_IMAGE_COUNT);
    const urls: string[] = [];

    for (const file of filesToUpload) {
        // Valider filtype
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            console.warn(`Ugyldig filtype avvist: ${file.type} (${file.name})`);
            continue;
        }

        // Valider filstørrelse
        if (file.size > MAX_IMAGE_SIZE) {
            console.warn(`For stor fil avvist: ${(file.size / 1024 / 1024).toFixed(1)} MB (${file.name})`);
            continue;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        // Tving sikker filendelse (kun bilde-endelser)
        const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt) ? fileExt : 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
        const filePath = `order-images/${fileName}`;

        const { error } = await supabase.storage
            .from('orders')
            .upload(filePath, file, { contentType: file.type });

        if (error) {
            console.error('Bildeopplasting feilet:', error.message);
            continue;
        }

        const { data: urlData } = supabase.storage
            .from('orders')
            .getPublicUrl(filePath);

        urls.push(urlData.publicUrl);
        console.log('[DEBUG uploadImages] Uploaded:', urlData.publicUrl);
    }

    console.log('[DEBUG uploadImages] Returning', urls.length, 'urls:', urls);
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
        console.log('[DEBUG createCheckoutSession] orderData.images:', orderData.images?.length, 'files');
        const imageUrls = await uploadImages(orderData.images);
        console.log('[DEBUG createCheckoutSession] imageUrls after upload:', imageUrls);

        // 2. Kall Edge Function via direct fetch (mer pålitelig enn supabase.functions.invoke)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

        const payload = {
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
            // Felter for server-side prisberegning
            productId: orderData.productId,
            sizeId: orderData.selectedSize?.id || '',
            size: orderData.selectedSize?.label || '',
            sizePersons: orderData.selectedSize?.persons || '',
            flavor: orderData.selectedFlavor?.label || '',
            color: orderData.selectedColor?.label || '',
            withPhoto: orderData.withPhoto,
        };

        console.log('[DEBUG createCheckoutSession] Sending payload with imageUrls:', payload.imageUrls);

        const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: anonKey,
                Authorization: `Bearer ${anonKey}`,
            },
            body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        let data: Record<string, unknown> = {};
        try { data = JSON.parse(responseText); } catch { /* ignorer parse-feil */ }

        if (!response.ok) {
            const errMsg =
                (data.error as string) ||
                (data.message as string) ||
                `HTTP ${response.status}: ${responseText.slice(0, 200)}`;
            console.error('Checkout session feilet:', response.status, data);
            return { success: false, error: errMsg };
        }

        if (!data.url) {
            console.error('Ingen URL i svar:', data);
            return { success: false, error: String(data.error || 'Ingen betalings-URL mottatt') };
        }

        return { success: true, url: data.url as string, orderRef: data.orderRef as string };
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

/**
 * Oppretter én Stripe Checkout-session for FLERE bestillingsutkast (handlekurv).
 * Bruker direct fetch mot Edge Function for bedre feilrapportering.
 * Prøver multiItem-banen (separate Stripe-linjeelementer) og faller tilbake til
 * enkelt-item-banen hvis den feiler.
 */
export async function createMultiCheckoutSession(
    drafts: OrderDraft[],
    contact: { customerName: string; customerEmail: string; customerPhone: string }
): Promise<{ success: boolean; url?: string; orderRef?: string; error?: string }> {
    try {
        // 1. Samle forhåndsopplastede bilde-URL-er (lastet opp ved legg-til-kurv)
        const allImageUrls: string[] = [];
        for (const draft of drafts) {
            if (draft.imageUrls && draft.imageUrls.length > 0) {
                allImageUrls.push(...draft.imageUrls);
            }
        }

        // 2. Bygg payload
        const totalPrice = drafts.reduce((sum, d) => sum + d.totalPrice, 0);

        // Bruk siste leveringsdato for DB DATE-kolonnen (én gyldig dato).
        // Individuelle datoer per produkt vises i combinedDescription.
        const uniqueDates = [...new Set(drafts.map((d) => d.delivery))].filter(Boolean).sort();
        const primaryDeliveryDate = uniqueDates[uniqueDates.length - 1] || null;

        const combinedDescription = drafts
            .map((draft, i) =>
                [
                    `${i + 1}. ${draft.productName} (${draft.totalPrice} kr)`,
                    draft.flavorLabel ? `Smak: ${draft.flavorLabel}` : '',
                    draft.fillingLabel ? `Fyll: ${draft.fillingLabel}` : '',
                    draft.sizeSummary || '',
                    !draft.isCake ? `${draft.quantity} stk` : '',
                    draft.delivery ? `Hentes: ${draft.delivery}` : '',
                ]
                    .filter(Boolean)
                    .join(' · ')
            )
            .join(' | ')
            .slice(0, 490); // Stripe max 500 tegn

        const packageLabel =
            drafts.length === 1
                ? drafts[0].packageName
                : `Samlet bestilling (${drafts.length} produkter)`;

        const cakeTexts = drafts.map((d) => d.cakeText).filter(Boolean).join(' / ');

        // 3. Supabase Edge Function – enkelt-item-bane (mest robust)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

        const payload = {
            customerName: contact.customerName,
            customerEmail: contact.customerEmail,
            customerPhone: contact.customerPhone,
            occasion: '',
            productType: '',
            packageName: packageLabel,
            packagePrice: totalPrice,
            quantity: drafts.length === 1 ? String(drafts[0].quantity) : '1',
            description: combinedDescription,
            ideas: '',
            cakeName: packageLabel,
            cakeText: cakeTexts,
            deliveryDate: primaryDeliveryDate,
            imageUrls: allImageUrls,
            isCustomDesign: false,
            // Server-side prisberegning (nøyaktig for enkeltvarer)
            productId: drafts.length === 1 ? drafts[0].productId : undefined,
            sizeId: drafts.length === 1 ? drafts[0].sizeId : undefined,
            withPhoto: drafts.length === 1 ? drafts[0].withPhoto : undefined,
        };

        const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: anonKey,
                Authorization: `Bearer ${anonKey}`,
            },
            body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        let responseJson: Record<string, unknown> = {};
        try { responseJson = JSON.parse(responseText); } catch { /* igorer parse-feil */ }

        if (!response.ok) {
            const errMsg =
                (responseJson.error as string) ||
                (responseJson.message as string) ||
                `HTTP ${response.status}: ${responseText.slice(0, 200)}`;
            console.error('Multi-checkout feilet:', response.status, responseJson);
            return { success: false, error: errMsg };
        }

        if (!responseJson.url) {
            console.error('Ingen URL i svar:', responseJson);
            return { success: false, error: String(responseJson.error || 'Ingen betalings-URL mottatt') };
        }

        return {
            success: true,
            url: responseJson.url as string,
            orderRef: responseJson.orderRef as string,
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Ukjent feil';
        console.error('Multi-checkout unntak:', message);
        return { success: false, error: message };
    }
}
