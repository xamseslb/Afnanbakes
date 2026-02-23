/**
 * Header — Navigasjonsmeny med logo, lenker og mobilmeny.
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';

const menuLinks = [
  { href: '/', label: 'Hjem' },
  { href: '/cakes', label: 'Kaker' },
  { href: '/cupcakes', label: 'Cupcakes' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/om-oss', label: 'Om oss' },
  { href: '/kanseller', label: 'Kanseller bestilling' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const location = useLocation();
  const cartCount = getCartCount();

  return (
    <>
      <header className="relative z-50 w-full border-b border-border/50 bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-tight">
              Afnan<span className="text-primary">Bakes</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side: Cart + Menu */}
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative" aria-label="Handlekurv">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden"
              aria-label="Åpne meny"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Slide-out menu overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Side panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 z-[70] h-full w-72 bg-background shadow-2xl border-l border-border"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
                <span className="font-serif text-lg font-bold">
                  Afnan<span className="text-primary">Bakes</span>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Lukk meny"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Links */}
              <nav className="flex flex-col px-4 py-4">
                {menuLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-3 rounded-lg text-base font-medium transition-colors ${location.pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-secondary hover:text-primary'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
