// Supabase Edge Function: send-order-confirmation
// Deploy with: supabase functions deploy send-order-confirmation
//
// Required secrets (set via Supabase Dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY = your Resend API key
//   SENDER_EMAIL   = the verified sender email in Resend (e.g. orders@afnanbakes.no)
//                    or use onboarding@resend.dev for testing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'onboarding@resend.dev';

// ─── Typer ────────────────────────────────────────────────────────────────────

/** Payload for ordrebekreftelse */
interface OrderPayload {
  type?: 'confirmation' | 'cancellation';
  to: string;
  customerName: string;
  orderRef: string;
  occasion: string;
  productType: string;
  quantity: string;
  description: string;
  cakeName: string;
  cakeText: string;
  // Ekstra felt for kansellering (sendt fra CancelOrder-klienten)
  customerEmail?: string;
}

// ─── HTML-maler ───────────────────────────────────────────────────────────────

/** Felles HTML-wrapper med AfnanBakes-design */
function wrapHtml(headerBg: string, title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background: ${headerBg}; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: 700; font-family: Georgia, serif;">
        Afnan<span style="opacity: 0.9;">Bakes</span>
      </h1>
    </div>

    <!-- Body -->
    <div style="padding: 32px 24px;">
      ${body}
    </div>

    <!-- Footer -->
    <div style="background: #faf9f7; padding: 24px; text-align: center; border-top: 1px solid #f0f0f0;">
      <p style="margin: 0 0 8px; color: #888; font-size: 13px;">
        Kontakt oss
      </p>
      <p style="margin: 0; font-size: 13px;">
        <a href="mailto:afnanbakes@outlook.com" style="color: #d4a574; text-decoration: none;">afnanbakes@outlook.com</a>
        &nbsp;·&nbsp;
        <a href="https://instagram.com/afnanBakes" style="color: #d4a574; text-decoration: none;">@afnanBakes</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/** Ordrebekreftelse-e-post */
function buildConfirmationHtml(data: OrderPayload): string {
  const rows = [
    { label: 'Ordrereferanse', value: data.orderRef },
    { label: 'Anledning', value: data.occasion },
    { label: 'Produkt', value: data.productType },
    { label: 'Antall', value: data.quantity },
  ];

  if (data.description) rows.push({ label: 'Beskrivelse', value: data.description });
  if (data.cakeName) rows.push({ label: 'Navn på kaken', value: data.cakeName });
  if (data.cakeText) rows.push({ label: 'Tekst på kaken', value: data.cakeText });

  const tableRows = rows
    .map(
      (r) => `
      <tr>
        <td style="padding: 10px 16px; color: #888; font-size: 14px; border-bottom: 1px solid #f0f0f0; width: 140px;">${r.label}</td>
        <td style="padding: 10px 16px; color: #333; font-size: 14px; border-bottom: 1px solid #f0f0f0;">${r.value}</td>
      </tr>`
    )
    .join('');

  const body = `
      <h2 style="margin: 0 0 8px; color: #333; font-size: 22px; font-family: Georgia, serif;">
        Takk for bestillingen, ${data.customerName}! 🎉
      </h2>
      <p style="margin: 0 0 24px; color: #666; font-size: 15px; line-height: 1.6;">
        Vi har mottatt din forespørsel og vil kontakte deg snart for å bekrefte detaljer og pris.
      </p>

      <!-- Order ref highlight -->
      <div style="background: #faf5f0; border: 2px solid #d4a574; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
          Din ordrereferanse
        </p>
        <p style="margin: 0; color: #d4a574; font-size: 28px; font-weight: 700; font-family: monospace; letter-spacing: 2px;">
          ${data.orderRef}
        </p>
      </div>

      <!-- Order details table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        ${tableRows}
      </table>

      <p style="margin: 0; color: #888; font-size: 13px; line-height: 1.6; text-align: center;">
        Ta vare på ordrereferansen din. Du kan bruke den når du kontakter oss.
      </p>`;

  return wrapHtml('linear-gradient(135deg, #d4a574 0%, #c4956a 100%)', 'Ordrebekreftelse', body);
}

/** Kanselleringsbekreftelse-e-post */
function buildCancellationHtml(data: OrderPayload): string {
  const body = `
      <h2 style="margin: 0 0 8px; color: #333; font-size: 22px; font-family: Georgia, serif;">
        Bestillingen din er kansellert
      </h2>
      <p style="margin: 0 0 24px; color: #666; font-size: 15px; line-height: 1.6;">
        Vi bekrefter at bestillingen din har blitt kansellert. Ingen videre handling er nødvendig.
      </p>

      <!-- Order ref highlight -->
      <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
          Kansellert ordrereferanse
        </p>
        <p style="margin: 0; color: #ef4444; font-size: 28px; font-weight: 700; font-family: monospace; letter-spacing: 2px;">
          ${data.orderRef}
        </p>
      </div>

      <p style="margin: 0; color: #888; font-size: 13px; line-height: 1.6; text-align: center;">
        Har du spørsmål? Kontakt oss gjerne via e-post eller Instagram.
      </p>`;

  return wrapHtml('linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 'Kansellering', body);
}

// ─── Server ───────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const data: OrderPayload = await req.json();
    const emailType = data.type || 'confirmation';

    // For kansellering bruker CancelOrder.tsx 'customerEmail' i stedet for 'to'
    const recipientEmail = data.to || data.customerEmail;

    if (!recipientEmail || !data.orderRef) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Velg riktig e-postmal
    const isCancel = emailType === 'cancellation';
    const subject = isCancel
      ? `Kansellering ${data.orderRef} - AfnanBakes`
      : `Ordrebekreftelse ${data.orderRef} - AfnanBakes`;
    const html = isCancel
      ? buildCancellationHtml(data)
      : buildConfirmationHtml(data);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `AfnanBakes <${SENDER_EMAIL}>`,
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', result);
      return new Response(JSON.stringify({ error: result }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
