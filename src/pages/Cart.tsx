/**
 * Cart — Handlekurvside for konfigurerte bestillingsutkast.
 * Viser alle produkter lagt til med «Legg til produkt til», lar brukeren fylle inn
 * kontaktinfo og betale for alt på én gang via Stripe.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, ShoppingBag, ArrowRight, ArrowLeft,
  Loader2, User, Mail, Phone, CalendarDays, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { createMultiCheckoutSession } from '@/lib/orderService';
import { formatNorwegianDate } from '@/lib/calendarService';
import { cn } from '@/lib/utils';

export default function Cart() {
  const { orderDrafts, removeOrderDraft, clearOrderDrafts, getDraftsTotal } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = getDraftsTotal();
  const isValid = name.trim() && email.trim() && phone.trim();

  const handlePayAll = async () => {
    if (!isValid || isSubmitting || orderDrafts.length === 0) return;
    setIsSubmitting(true);
    const result = await createMultiCheckoutSession(orderDrafts, {
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
    });
    setIsSubmitting(false);
    if (result.success && result.url) {
      clearOrderDrafts();
      window.location.href = result.url;
    } else {
      toast({ title: 'Noe gikk galt', description: 'Kunne ikke starte betaling.', variant: 'destructive' });
    }
  };

  // ── Tom kurv ────────────────────────────────────────────────────────────
  if (orderDrafts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Handlekurven er tom</h1>
          <p className="mt-4 text-muted-foreground">
            Gå til et produkt og klikk «Legg til produkt til» for å bygge opp bestillingen din.
          </p>
          <Link to="/" className="mt-8 inline-block">
            <Button className="gap-2 rounded-full">
              Se produkter
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Kurv med produkter ───────────────────────────────────────────────────
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Tilbake-lenke */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Tilbake
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl font-bold text-foreground mb-8"
        >
          Handlekurv
          <span className="ml-3 text-lg font-normal text-muted-foreground">
            ({orderDrafts.length} {orderDrafts.length === 1 ? 'produkt' : 'produkter'})
          </span>
        </motion.h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Produktliste — 3/5 */}
          <div className="lg:col-span-3 space-y-4">
            <AnimatePresence>
              {orderDrafts.map((draft, i) => (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg font-semibold text-card-foreground truncate">
                        {draft.productName}
                      </h3>

                      {/* Detaljer */}
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {draft.sizeSummary && (
                          <li className="flex items-center gap-1.5">
                            <ChevronRight className="w-3 h-3 shrink-0" />
                            {draft.sizeSummary}
                          </li>
                        )}
                        {draft.flavorLabel && (
                          <li className="flex items-center gap-1.5">
                            <ChevronRight className="w-3 h-3 shrink-0" />
                            Smak: {draft.flavorLabel}
                            {draft.fillingLabel ? ` · Fyll: ${draft.fillingLabel}` : ''}
                          </li>
                        )}
                        {!draft.isCake && (
                          <li className="flex items-center gap-1.5">
                            <ChevronRight className="w-3 h-3 shrink-0" />
                            {draft.quantity} stk
                          </li>
                        )}
                        {draft.withPhoto && (
                          <li className="flex items-center gap-1.5">
                            <ChevronRight className="w-3 h-3 shrink-0" />
                            Med spiselig bilde
                          </li>
                        )}
                        {draft.delivery && (
                          <li className="flex items-center gap-1.5">
                            <CalendarDays className="w-3 h-3 shrink-0" />
                            Hentes: {formatNorwegianDate(draft.delivery)}
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className="font-bold text-primary text-lg whitespace-nowrap">
                        {draft.totalPrice.toLocaleString('nb-NO')} kr
                      </span>
                      <button
                        onClick={() => removeOrderDraft(draft.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Fjern produkt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Legg til flere */}
            <Link to="/cakes">
              <Button variant="outline" className="w-full rounded-full gap-2 mt-2">
                + Legg til et produkt til
              </Button>
            </Link>
          </div>

          {/* Ordresammendrag + kontakt — 2/5 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Prissammendrag */}
            <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-card-foreground mb-4">
                Ordresammendrag
              </h2>
              <div className="space-y-2 border-b border-border pb-4">
                {orderDrafts.map((d) => (
                  <div key={d.id} className="flex justify-between text-sm text-muted-foreground">
                    <span className="truncate pr-2">{d.productName}</span>
                    <span className="shrink-0">{d.totalPrice.toLocaleString('nb-NO')} kr</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between py-4 text-lg font-bold text-card-foreground">
                <span>Totalt</span>
                <span className="text-primary">{total.toLocaleString('nb-NO')} kr</span>
              </div>
            </div>

            {/* Kontaktinfo */}
            <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-card-foreground">
                Kontaktinfo
              </h2>

              <div>
                <Label htmlFor="cart-name" className="text-sm font-medium mb-1 block">Navn *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cart-name"
                    placeholder="Ditt navn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cart-email" className="text-sm font-medium mb-1 block">E-post *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cart-email"
                    type="email"
                    placeholder="din@epost.no"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cart-phone" className="text-sm font-medium mb-1 block">Telefon *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cart-phone"
                    type="tel"
                    placeholder="400 00 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={handlePayAll}
                disabled={!isValid || isSubmitting}
                size="lg"
                className="w-full rounded-full gap-2 mt-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Behandler...</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> Betal — {total.toLocaleString('nb-NO')} kr</>
                )}
              </Button>

              {!isValid && (
                <p className="text-xs text-muted-foreground text-center">
                  Fyll inn navn, e-post og telefon for å betale
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
