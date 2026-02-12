import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Search, Mail, AlertTriangle, CheckCircle2, ArrowLeft, Cake, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

type Step = 'form' | 'confirm' | 'success' | 'error';

export default function CancelOrder() {
    const [step, setStep] = useState<Step>('form');
    const [orderRef, setOrderRef] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [orderInfo, setOrderInfo] = useState<{ id: string; customer_name: string; product_type: string; occasion: string } | null>(null);

    // Step 1: Look up the order
    async function handleLookup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        const { data, error } = await supabase
            .from('orders')
            .select('id, customer_name, customer_email, product_type, occasion, status')
            .eq('order_ref', orderRef.trim().toUpperCase())
            .single();

        if (error || !data) {
            setErrorMsg('Fant ingen bestilling med denne referansen. Sjekk at du har skrevet riktig.');
            setLoading(false);
            return;
        }

        // Check email matches
        if (data.customer_email?.toLowerCase() !== email.trim().toLowerCase()) {
            setErrorMsg('E-postadressen samsvarer ikke med bestillingen. Bruk e-posten du oppga ved bestilling.');
            setLoading(false);
            return;
        }

        // Check if already cancelled or completed
        if (data.status === 'cancelled') {
            setErrorMsg('Denne bestillingen er allerede kansellert.');
            setLoading(false);
            return;
        }

        if (data.status === 'completed') {
            setErrorMsg('Denne bestillingen er allerede fullført og kan ikke kanselleres.');
            setLoading(false);
            return;
        }

        setOrderInfo({
            id: data.id,
            customer_name: data.customer_name,
            product_type: data.product_type,
            occasion: data.occasion,
        });
        setStep('confirm');
        setLoading(false);
    }

    // Step 2: Confirm cancellation
    async function handleConfirmCancel() {
        if (!orderInfo) return;
        setLoading(true);

        const { error } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderInfo.id);

        if (error) {
            setErrorMsg('Noe gikk galt. Prøv igjen eller kontakt oss direkte.');
            setStep('error');
        } else {
            // Try to send cancellation email (optional, don't block on failure)
            try {
                await supabase.functions.invoke('send-order-confirmation', {
                    body: {
                        type: 'cancellation',
                        orderRef: orderRef.trim().toUpperCase(),
                        customerEmail: email.trim(),
                        customerName: orderInfo.customer_name,
                    },
                });
            } catch {
                // Email is best-effort, don't fail the cancellation
            }
            setStep('success');
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4"
                    >
                        <Cake className="w-8 h-8 text-primary" />
                    </motion.div>
                    <Link to="/" className="block hover:opacity-80 transition-opacity">
                        <h1 className="font-serif text-3xl font-bold text-foreground">
                            Afnan<span className="text-primary">Bakes</span>
                        </h1>
                    </Link>
                    <p className="text-muted-foreground mt-2">Kanseller bestilling</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tilbake til forsiden
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border/50">
                    <AnimatePresence mode="wait">
                        {/* STEP: Form */}
                        {step === 'form' && (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <Search className="w-5 h-5 text-amber-700" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-foreground">Finn bestillingen</h2>
                                        <p className="text-sm text-muted-foreground">Skriv inn referanse og e-post</p>
                                    </div>
                                </div>

                                <form onSubmit={handleLookup} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                                            Ordrereferanse
                                        </label>
                                        <Input
                                            value={orderRef}
                                            onChange={(e) => setOrderRef(e.target.value)}
                                            placeholder="F.eks. AB-250209-A3K7"
                                            className="h-12 bg-background border-border/50 focus:border-primary/50 rounded-xl text-base font-mono"
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                                            E-postadresse
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Din e-postadresse"
                                                className="h-12 pl-10 bg-background border-border/50 focus:border-primary/50 rounded-xl text-base"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {errorMsg && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-start gap-2 p-3 bg-destructive/5 rounded-xl"
                                        >
                                            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                                            <p className="text-sm text-destructive">{errorMsg}</p>
                                        </motion.div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 rounded-xl text-base font-semibold shadow-soft hover:shadow-card transition-all duration-300"
                                    >
                                        {loading ? 'Søker...' : 'Finn bestilling'}
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {/* STEP: Confirm */}
                        {step === 'confirm' && orderInfo && (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-red-700" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-foreground">Bekreft kansellering</h2>
                                        <p className="text-sm text-muted-foreground">Er du sikker?</p>
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-xl p-4 mb-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Referanse</span>
                                        <span className="font-mono font-semibold text-foreground">{orderRef.toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Kunde</span>
                                        <span className="text-foreground">{orderInfo.customer_name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Produkt</span>
                                        <span className="text-foreground capitalize">{orderInfo.product_type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Anledning</span>
                                        <span className="text-foreground">{orderInfo.occasion}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl mb-6">
                                    <ShieldCheck className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                                    <p className="text-sm text-amber-800">
                                        Kansellering kan ikke angres. Du vil motta en bekreftelse på e-post.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => { setStep('form'); setErrorMsg(''); }}
                                        className="flex-1 h-12 rounded-xl"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Tilbake
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleConfirmCancel}
                                        disabled={loading}
                                        className="flex-1 h-12 rounded-xl font-semibold"
                                    >
                                        {loading ? 'Kansellerer...' : 'Kanseller'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP: Success */}
                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h2 className="font-serif text-xl font-bold text-foreground mb-2">
                                    Bestillingen er kansellert
                                </h2>
                                <p className="text-muted-foreground text-sm mb-6">
                                    Referanse <span className="font-mono font-semibold">{orderRef.toUpperCase()}</span> er kansellert.
                                    En bekreftelse er sendt til {email}.
                                </p>
                                <Link to="/">
                                    <Button className="rounded-xl h-11 px-6">
                                        Tilbake til forsiden
                                    </Button>
                                </Link>
                            </motion.div>
                        )}

                        {/* STEP: Error */}
                        {step === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                    <XCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h2 className="font-serif text-xl font-bold text-foreground mb-2">
                                    Noe gikk galt
                                </h2>
                                <p className="text-muted-foreground text-sm mb-6">
                                    {errorMsg || 'Kunne ikke kansellere bestillingen. Kontakt oss direkte.'}
                                </p>
                                <Button onClick={() => { setStep('form'); setErrorMsg(''); }} className="rounded-xl h-11 px-6">
                                    Prøv igjen
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="text-center mt-6 space-y-1">
                    <p className="text-xs text-muted-foreground/80">
                        Spørsmål om kansellering? Kontakt oss på
                    </p>
                    <a
                        href="mailto:afnanbakes@outlook.com"
                        className="text-sm text-primary hover:underline font-medium"
                    >
                        afnanbakes@outlook.com
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
