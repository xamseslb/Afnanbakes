/**
 * SuccessSection — Bekreftelsesside etter vellykket bestilling.
 * Viser ordrereferanse, kontaktinfo og lenker til sosiale medier.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Mail, Instagram, RefreshCw, Copy, CheckCheck, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessSectionProps {
  orderRef?: string | null;
  onNewOrder: () => void;
}

export function SuccessSection({ orderRef, onNewOrder }: SuccessSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!orderRef) return;
    try {
      await navigator.clipboard.writeText(orderRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = orderRef;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center"
          >
            <Check className="w-8 h-8 text-primary-foreground" />
          </motion.div>
        </motion.div>

        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
          Takk for bestillingen!
        </h2>

        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          Vi har mottatt din forespørsel og vil kontakte deg snart for å bekrefte detaljer og pris.
        </p>

        {/* Order reference */}
        {orderRef && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6 md:p-8 shadow-soft mb-6"
          >
            <p className="text-muted-foreground text-sm mb-2">
              Din ordrereferanse
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl md:text-3xl font-bold text-primary tracking-wider">
                {orderRef}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs mt-3">
              Ta vare på dette nummeret for referanse
            </p>
          </motion.div>
        )}

        {/* Email sent notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-6"
        >
          <Send className="w-4 h-4" />
          <span>Bekreftelse sendt til din e-post</span>
        </motion.div>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-6 md:p-8 shadow-soft mb-8"
        >
          <h3 className="font-semibold text-foreground mb-6">
            Kontakt oss
          </h3>

          <div className="space-y-4">
            <a
              href="mailto:afnanbakes@outlook.com"
              className="flex items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>afnanbakes@outlook.com</span>
            </a>

            <a
              href="https://instagram.com/afnanBakes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-5 h-5" />
              <span>@afnanBakes</span>
            </a>

            <a
              href="https://www.tiktok.com/@afnanBakes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z" />
              </svg>
              <span>@afnanBakes</span>
            </a>
          </div>
        </motion.div>

        {/* New order button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            onClick={onNewOrder}
            className="rounded-full gap-2"
            size="lg"
          >
            <RefreshCw className="w-4 h-4" />
            Ny bestilling
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
