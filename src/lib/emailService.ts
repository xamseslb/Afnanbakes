/**
 * E-posttjeneste — Sender ordrebekreftelse via Supabase Edge Function (Resend).
 */
import { supabase } from './supabase';
import { OrderData, occasionLabels, productLabels } from './orderTypes';

/** Data som sendes til Edge Function for e-postlevering */
interface EmailPayload {
    to: string;
    customerName: string;
    orderRef: string;
    occasion: string;
    productType: string;
    quantity: string;
    description: string;
    cakeName: string;
    cakeText: string;
}

/**
 * Sender ordrebekreftelse-e-post til kunden.
 * Kaller Supabase Edge Function som bruker Resend for å levere e-posten.
 */
export async function sendConfirmationEmail(
    orderData: OrderData,
    orderRef: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const payload: EmailPayload = {
            to: orderData.customerEmail,
            customerName: orderData.customerName,
            orderRef,
            occasion: orderData.occasion ? occasionLabels[orderData.occasion] : '',
            productType: orderData.productType ? productLabels[orderData.productType] : '',
            quantity: orderData.quantity,
            description: orderData.description,
            cakeName: orderData.cakeName,
            cakeText: orderData.cakeText,
        };

        const { error } = await supabase.functions.invoke('send-order-confirmation', {
            body: payload,
        });

        if (error) {
            console.error('E-post sending feilet:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'E-postfeil';
        console.error('E-posttjeneste feil:', message);
        return { success: false, error: message };
    }
}
