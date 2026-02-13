import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const total = getCartTotal();

  if (items.length === 0) {
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
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Handlekurven er tom
          </h1>
          <p className="mt-4 text-muted-foreground">
            Du har ikke lagt til noe i handlekurven ennå.
          </p>
          <Link to="/" className="mt-8 inline-block">
            <Button className="gap-2 rounded-full">
              Bestill nå
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl font-bold text-foreground mb-8"
        >
          Handlekurv
        </motion.h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 rounded-2xl bg-card p-4 shadow-soft"
              >
                <div className="h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-card-foreground">
                      {item.name}
                    </h3>
                    <p className="text-primary font-medium">
                      {item.price} kr
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-full bg-secondary p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-card-foreground">
                    {item.price * item.quantity} kr
                  </p>
                </div>
              </motion.div>
            ))}

            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={clearCart}
            >
              Tøm handlekurv
            </Button>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-card p-6 shadow-soft h-fit"
          >
            <h2 className="font-serif text-xl font-bold text-card-foreground mb-4">
              Ordresammendrag
            </h2>

            <div className="space-y-3 border-b border-border pb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Delsum</span>
                <span>{total} kr</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Henting</span>
                <span className="text-primary">Gratis</span>
              </div>
            </div>

            <div className="flex justify-between py-4 text-lg font-bold text-card-foreground">
              <span>Total</span>
              <span>{total} kr</span>
            </div>

            <Link to="/">
              <Button className="w-full gap-2 rounded-full" size="lg">
                Bestill nå
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Bruk bestillingsflyten på forsiden for å fullføre bestillingen.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
