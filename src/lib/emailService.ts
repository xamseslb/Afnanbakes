import { supabase } from './supabase';
import { OrderData, occasionLabels, productLabels } from './orderTypes';

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
 * Send order confirmation email via Supabase Edge Function.
 * The Edge Function uses Resend to deliver the email.
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
            console.error('Email sending failed:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Email error';
        console.error('Email service error:', message);
        return { success: false, error: message };
    }
}
