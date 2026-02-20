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

// ─── Typer ────────────────────────────────────────────────────────────────────

interface CheckoutPayload {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    occasion: string;
    productType: string;
    packageName: string;
    packagePrice: number;       // i hele kroner
    quantity: string;
    description: string;
    ideas: string;
    cakeName: string;
    cakeText: string;
    deliveryDate: string;
    imageUrls: string[];
    isCustomDesign: boolean;
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
        const data: CheckoutPayload = await req.json();

        if (!data.customerEmail || !data.packagePrice || data.packagePrice <= 0) {
            return new Response(
                JSON.stringify({ error: 'Mangler e-post eller pris' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const orderRef = generateOrderRef();

        // Lagre ordren i DB med status pending_payment
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { error: dbError } = await supabase.from('orders').insert({
            order_ref: orderRef,
            customer_name: data.customerName,
            customer_email: data.customerEmail,
            customer_phone: data.customerPhone,
            occasion: data.occasion,
            product_type: data.productType,
            package_name: data.packageName,
            package_price: data.packagePrice,
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

        // Opprett Stripe Checkout-session
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
                        unit_amount: data.packagePrice * 100, // Stripe bruker øre
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
