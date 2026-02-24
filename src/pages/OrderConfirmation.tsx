/**
 * OrderConfirmation — Landingsside etter Stripe-betaling.
 * Viser bekreftelse eller feilmelding basert på URL-parametere.
 */
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Copy, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';

export default function OrderConfirmation() {
    const [searchParams] = useSearchParams();
    const orderRef = searchParams.get('ref');
    const status = searchParams.get('status');
    const [copied, setCopied] = useState(false);

    const isSuccess = status === 'success';
    const isCustom = searchParams.get('type') === 'custom';
    const { clearOrderDrafts } = useCart();

    // Tøm kurven når betaling er bekreftet
    useEffect(() => {
        if (isSuccess) {
            clearOrderDrafts();
            try { sessionStorage.removeItem('afnanbakes_drafts'); } catch { /* ignorer */ }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess]);

    function copyRef() {
        if (orderRef) {
            navigator.clipboard.writeText(orderRef);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="max-w-lg w-full text-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mx-auto mb-8"
                >
                    {isSuccess ? (
                        <div className="w-24 h-24 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-14 h-14 text-emerald-600" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-14 h-14 text-amber-600" />
                        </div>
                    )}
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4"
                >
                    {isSuccess
                        ? (isCustom ? 'Forespørsel mottatt! 🎉' : 'Betaling mottatt! 🎉')
                        : 'Betaling avbrutt'}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground text-lg mb-8"
                >
                    {isSuccess
                        ? (isCustom
                            ? 'Takk for forespørselen! Vi tar kontakt med deg innen kort tid for å bekrefte detaljer og pris.'
                            : 'Takk for bestillingen! Vi har mottatt betalingen din og sender en bekreftelse på e-post.')
                        : 'Betalingen ble ikke fullført. Bestillingen din er lagret — du kan prøve igjen ved å kontakte oss.'}
                </motion.p>

                {/* Order ref */}
                {orderRef && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl mb-8 ${isSuccess
                            ? 'bg-emerald-50 border-2 border-emerald-200'
                            : 'bg-amber-50 border-2 border-amber-200'
                            }`}
                    >
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                Ordrereferanse
                            </p>
                            <p className={`font-mono text-2xl font-bold tracking-wider ${isSuccess ? 'text-emerald-600' : 'text-amber-600'
                                }`}>
                                {orderRef}
                            </p>
                        </div>
                        <button
                            onClick={copyRef}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Kopier referanse"
                        >
                            {copied
                                ? <CheckCheck className="w-5 h-5 text-emerald-500" />
                                : <Copy className="w-5 h-5" />
                            }
                        </button>
                    </motion.div>
                )}

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                    <Link to="/">
                        <Button className="rounded-full gap-2" size="lg">
                            Tilbake til forsiden
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Contact info */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 text-sm text-muted-foreground"
                >
                    Spørsmål? Kontakt oss på{' '}
                    <a href="mailto:afnanbakes@outlook.com" className="text-primary hover:underline">
                        afnanbakes@outlook.com
                    </a>
                </motion.p>
            </motion.div>
        </div>
    );
}
