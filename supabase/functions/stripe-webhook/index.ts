// Supabase Edge Function: stripe-webhook
// Deploy with: supabase functions deploy stripe-webhook --no-verify-jwt
//
// Required secrets:
//   STRIPE_SECRET_KEY     = your Stripe secret key
//   STRIPE_WEBHOOK_SECRET = webhook signing secret (whsec_...)
//
// Set up webhook in Stripe Dashboard → Developers → Webhooks:
//   URL: https://qnvbgsviixnyylslmwyt.supabase.co/functions/v1/stripe-webhook
//   Events: checkout.session.completed, checkout.session.expired

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'onboarding@resend.dev';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
});

// ─── Send bekreftelsesmail ─────────────────────────────────────────────────

async function sendConfirmationEmail(order: Record<string, unknown>) {
    if (!RESEND_API_KEY) {
        console.log('No RESEND_API_KEY, skipping email');
        return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #faf9f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #d4a574 0%, #c4956a 100%); padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: 700; font-family: Georgia, serif;">
        Afnan<span style="opacity: 0.9;">Bakes</span>
      </h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="margin: 0 0 8px; color: #333; font-size: 22px; font-family: Georgia, serif;">
        Betaling mottatt! 🎉
      </h2>
      <p style="margin: 0 0 24px; color: #666; font-size: 15px; line-height: 1.6;">
        Takk for bestillingen, ${order.customer_name}! Betalingen din er bekreftet.
        Vi vil kontakte deg snart for å bekrefte detaljer.
      </p>
      <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
          Din ordrereferanse
        </p>
        <p style="margin: 0; color: #22c55e; font-size: 28px; font-weight: 700; font-family: monospace; letter-spacing: 2px;">
          ${order.order_ref}
        </p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 10px 16px; color: #888; font-size: 14px; border-bottom: 1px solid #f0f0f0;">Anledning</td>
          <td style="padding: 10px 16px; color: #333; font-size: 14px; border-bottom: 1px solid #f0f0f0;">${order.occasion || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; color: #888; font-size: 14px; border-bottom: 1px solid #f0f0f0;">Pakke</td>
          <td style="padding: 10px 16px; color: #333; font-size: 14px; border-bottom: 1px solid #f0f0f0;">${order.package_name || order.product_type || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; color: #888; font-size: 14px; border-bottom: 1px solid #f0f0f0;">Betalt</td>
          <td style="padding: 10px 16px; color: #22c55e; font-size: 14px; font-weight: 700; border-bottom: 1px solid #f0f0f0;">${order.package_price?.toLocaleString('nb-NO')} kr ✓</td>
        </tr>
        ${order.delivery_date ? `<tr>
          <td style="padding: 10px 16px; color: #888; font-size: 14px; border-bottom: 1px solid #f0f0f0;">Levering</td>
          <td style="padding: 10px 16px; color: #333; font-size: 14px; border-bottom: 1px solid #f0f0f0;">${order.delivery_date}</td>
        </tr>` : ''}
      </table>
      <p style="margin: 0; color: #888; font-size: 13px; line-height: 1.6; text-align: center;">
        Ta vare på ordrereferansen din. Du kan bruke den når du kontakter oss.
      </p>
    </div>
    <div style="background: #faf9f7; padding: 24px; text-align: center; border-top: 1px solid #f0f0f0;">
      <p style="margin: 0; font-size: 13px;">
        <a href="mailto:afnanbakes@outlook.com" style="color: #d4a574; text-decoration: none;">afnanbakes@outlook.com</a>
        &nbsp;·&nbsp;
        <a href="https://instagram.com/afnanBakes" style="color: #d4a574; text-decoration: none;">@afnanBakes</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    try {
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: `AfnanBakes <${SENDER_EMAIL}>`,
                to: [order.customer_email],
                subject: `Betaling bekreftet ${order.order_ref} - AfnanBakes`,
                html,
            }),
        });
    } catch (e) {
        console.error('Email send error:', e);
    }
}

// ─── Server ────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
            },
        });
    }

    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature) {
            return new Response('Missing stripe-signature', { status: 400 });
        }

        // Verifiser webhook-signatur
        let event: Stripe.Event;
        try {
            event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderRef = session.metadata?.order_ref;

                if (orderRef) {
                    // Oppdater ordrestatus til pending (betalt)
                    const { error } = await supabase
                        .from('orders')
                        .update({ status: 'pending' })
                        .eq('order_ref', orderRef)
                        .eq('status', 'pending_payment');

                    if (error) {
                        console.error('DB update error:', error);
                    } else {
                        console.log(`Order ${orderRef} marked as paid`);

                        // Hent ordredata og send bekreftelsesmail
                        const { data: order } = await supabase
                            .from('orders')
                            .select('*')
                            .eq('order_ref', orderRef)
                            .single();

                        if (order) {
                            await sendConfirmationEmail(order);
                        }
                    }
                }
                break;
            }

            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderRef = session.metadata?.order_ref;

                if (orderRef) {
                    await supabase
                        .from('orders')
                        .update({ status: 'cancelled' })
                        .eq('order_ref', orderRef)
                        .eq('status', 'pending_payment');

                    console.log(`Order ${orderRef} expired — cancelled`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        console.error('Webhook error:', err);
        return new Response('Internal error', { status: 500 });
    }
});
