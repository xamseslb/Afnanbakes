import { motion } from 'framer-motion';
import { Check, Phone, Mail, Instagram, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessSectionProps {
  onNewOrder: () => void;
}

export function SuccessSection({ onNewOrder }: SuccessSectionProps) {
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

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 md:p-8 shadow-soft mb-8"
        >
          <h3 className="font-semibold text-foreground mb-6">
            Kontakt oss
          </h3>
          
          <div className="space-y-4">
            <a
              href="tel:+4712345678"
              className="flex items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>+47 123 45 678</span>
            </a>
            
            <a
              href="mailto:hei@afnanbakes.no"
              className="flex items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>hei@afnanbakes.no</span>
            </a>
            
            <a
              href="https://instagram.com/afnanbakes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-5 h-5" />
              <span>@afnanbakes</span>
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
