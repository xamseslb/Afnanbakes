// Supabase Edge Function: create-checkout
// Deploy with: supabase functions deploy create-checkout
//
// Required secrets (set via Supabase Dashboard → Edge Functions → Secrets):
//   STRIPE_SECRET_KEY = your Stripe secret key (sk_test_... or sk_live_...)
//   SITE_URL          = your site URL (e.g. https://afnanbakes.com)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://afnanbakes.com';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Server-side produktkatalog (kilde til sannhet for priser) ──────────────

/** Prisene her er den eneste kilde til sannhet — klient kan IKKE manipulere */
const PRODUCT_PRICES: Record<number, { name: string; price: number; category: 'cakes' | 'cupcakes' }> = {
    1: { name: 'Bursdagskake', price: 499, category: 'cakes' },
    2: { name: 'Bryllupskake', price: 499, category: 'cakes' },
    3: { name: 'Baby Shower-kake', price: 499, category: 'cakes' },
    4: { name: 'Anledningskake', price: 499, category: 'cakes' },
    5: { name: 'Vanilje Cupcakes', price: 30, category: 'cupcakes' },
    6: { name: 'Sjokolade Cupcakes', price: 32, category: 'cupcakes' },
    7: { name: 'Rød Fløyel Cupcakes', price: 35, category: 'cupcakes' },
    8: { name: 'Sitron Cupcakes', price: 30, category: 'cupcakes' },
};

const CAKE_SIZES: Record<string, { price: number; persons: string }> = {
    small: { price: 499, persons: '8–10 porsjoner' },
    medium: { price: 649, persons: '10–12 porsjoner' },
};

const PHOTO_ADDON_PRICE = 200;

/**
 * Beregner korrekt pris server-side.
 * Returnerer beregnet pris, eller null hvis input er ugyldig.
 */
function calculateServerPrice(body: Record<string, unknown>): number | null {
    const productId = body.productId as number | undefined;
    const sizeId = body.sizeId as string | undefined;
    const quantity = Math.max(1, parseInt(String(body.quantity || '1'), 10));
    const withPhoto = body.withPhoto === true;

    // Kaker: pris basert på størrelse
    if (sizeId && CAKE_SIZES[sizeId]) {
        let price = CAKE_SIZES[sizeId].price;
        if (withPhoto) price += PHOTO_ADDON_PRICE;
        return price;
    }

    // Cupcakes / andre produkter: pris basert på produkt-ID × antall
    if (productId && PRODUCT_PRICES[productId]) {
        const product = PRODUCT_PRICES[productId];
        if (product.category === 'cupcakes') {
            let price = product.price * quantity;
            if (withPhoto) price += PHOTO_ADDON_PRICE;
            return price;
        }
        // Kake uten størrelse (fallback)
        let price = product.price;
        if (withPhoto) price += PHOTO_ADDON_PRICE;
        return price;
    }

    // Ukjent produkt — returner null (vil bruke client-pris med advarsel)
    return null;
}

// ─── Typer ────────────────────────────────────────────────────────────────────

/** Enkelt-bestilling */
interface CheckoutPayload {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    occasion: string;
    productType: string;
    packageName: string;
    packagePrice: number;       // klientens pris (blir overskrevet av server)
    quantity: string;
    description: string;
    ideas: string;
    cakeName: string;
    cakeText: string;
    deliveryDate: string;
    imageUrls: string[];
    isCustomDesign: boolean;
    // Nye felter for server-side prisberegning
    productId?: number;
    sizeId?: string;
    withPhoto?: boolean;
}

/** Et linjeelement i en flerbestilling */
interface LineItem {
    name: string;
    price: number;              // klientens pris (blir overskrevet av server)
    description: string;
    deliveryDate?: string;
    cakeText?: string;
    productId?: number;
    sizeId?: string;
    quantity?: number;
    withPhoto?: boolean;
}

/** Flerbestilling */
interface MultiCheckoutPayload {
    multiItem: true;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    lineItems: LineItem[];
    imageUrls: string[];
}

// ─── Ordrereferanse ────────────────────────────────────────────────────────

function generateOrderRef(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let ref = 'AB-';
    for (let i = 0; i < 6; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
}

// ─── Server ────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();

        // ── Flerbestilling ──────────────────────────────────────────────────
        if (body.multiItem === true) {
            const data = body as MultiCheckoutPayload;

            if (!data.customerEmail || !data.lineItems?.length) {
                return new Response(
                    JSON.stringify({ error: 'Mangler e-post eller produkter' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            const orderRef = generateOrderRef();
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

            // Server-side prisberegning for hvert linjeelement
            const verifiedItems = data.lineItems.map((item) => {
                const serverPrice = calculateServerPrice({
                    productId: item.productId,
                    sizeId: item.sizeId,
                    quantity: String(item.quantity || 1),
                    withPhoto: item.withPhoto,
                });

                const finalPrice = serverPrice ?? item.price; // Fallback til klient-pris kun hvis ukjent produkt

                if (serverPrice !== null && serverPrice !== item.price) {
                    console.warn(`Prisavvik: klient=${item.price}, server=${serverPrice} for ${item.name}`);
                }

                return { ...item, price: finalPrice };
            });

            // Lagre én ordre per linjeelement i DB
            const records = verifiedItems.map((item) => ({
                order_ref: orderRef,
                customer_name: data.customerName,
                customer_email: data.customerEmail,
                customer_phone: data.customerPhone,
                package_name: item.name,
                package_price: item.price,
                description: item.description,
                cake_text: item.cakeText || '',
                delivery_date: item.deliveryDate || null,
                image_urls: data.imageUrls || [],
                status: 'pending_payment',
                is_custom_design: false,
                occasion: '',
                product_type: '',
                quantity: String(item.quantity || 1),
                ideas: '',
                cake_name: item.name,
            }));

            const { error: dbError } = await supabase.from('orders').insert(records);
            if (dbError) {
                console.error('DB insert error (multi):', JSON.stringify(dbError));
                return new Response(
                    JSON.stringify({ error: 'Kunne ikke lagre ordre' }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // Stripe: ett linjeelement per produkt (server-beregnede priser)
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                customer_email: data.customerEmail,
                line_items: verifiedItems.map((item) => ({
                    price_data: {
                        currency: 'nok',
                        product_data: {
                            name: item.name,
                            description: item.description || 'AfnanBakes bestilling',
                        },
                        unit_amount: Math.round(item.price * 100),
                    },
                    quantity: 1,
                })),
                metadata: { order_ref: orderRef },
                success_url: `${SITE_URL}/ordre-bekreftelse?ref=${orderRef}&status=success`,
                cancel_url: `${SITE_URL}/ordre-bekreftelse?ref=${orderRef}&status=cancelled`,
                locale: 'nb',
            });

            return new Response(
                JSON.stringify({ url: session.url, orderRef }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // ── Enkeltbestilling (eksisterende flyt) ────────────────────────────
        const data: CheckoutPayload = body;

        if (!data.customerEmail) {
            return new Response(
                JSON.stringify({ error: 'Mangler e-post' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Server-side prisberegning — overskriver klientens pris
        const serverPrice = calculateServerPrice({
            productId: data.productId,
            sizeId: data.sizeId,
            quantity: data.quantity,
            withPhoto: data.withPhoto,
        });

        const finalPrice = serverPrice ?? data.packagePrice;

        if (serverPrice !== null && serverPrice !== data.packagePrice) {
            console.warn(`Prisavvik (single): klient=${data.packagePrice}, server=${serverPrice}`);
        }

        if (!finalPrice || finalPrice <= 0) {
            return new Response(
                JSON.stringify({ error: 'Ugyldig pris' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const orderRef = generateOrderRef();

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { error: dbError } = await supabase.from('orders').insert({
            order_ref: orderRef,
            customer_name: data.customerName,
            customer_email: data.customerEmail,
            customer_phone: data.customerPhone,
            occasion: data.occasion,
            product_type: data.productType,
            package_name: data.packageName,
            package_price: finalPrice,   // Server-beregnet pris
            quantity: data.quantity || '1',
            description: data.description,
            ideas: data.ideas,
            cake_name: data.cakeName,
            cake_text: data.cakeText,
            delivery_date: data.deliveryDate || null,
            image_urls: data.imageUrls || [],
            is_custom_design: data.isCustomDesign || false,
            status: 'pending_payment',
        });

        if (dbError) {
            console.error('DB insert error:', JSON.stringify(dbError));
            return new Response(
                JSON.stringify({ error: 'Kunne ikke lagre ordre', details: dbError.message, code: dbError.code }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: data.customerEmail,
            line_items: [
                {
                    price_data: {
                        currency: 'nok',
                        product_data: {
                            name: data.packageName || `${data.occasion} - Bestilling`,
                            description: [
                                data.cakeName ? `Kake: ${data.cakeName}` : '',
                                data.cakeText ? `Tekst: "${data.cakeText}"` : '',
                                data.deliveryDate ? `Levering: ${data.deliveryDate}` : '',
                            ].filter(Boolean).join(' • ') || 'AfnanBakes bestilling',
                        },
                        unit_amount: finalPrice * 100,   // Server-beregnet pris
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                order_ref: orderRef,
            },
            success_url: `${SITE_URL}/ordre-bekreftelse?ref=${orderRef}&status=success`,
            cancel_url: `${SITE_URL}/ordre-bekreftelse?ref=${orderRef}&status=cancelled`,
            locale: 'nb',
        });

        return new Response(
            JSON.stringify({ url: session.url, orderRef }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (err) {
        console.error('create-checkout error:', err);
        return new Response(
            JSON.stringify({ error: 'Intern serverfeil' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
