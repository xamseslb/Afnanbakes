/**
 * useCart — Handlekurv-kontekst med localStorage-persistering for enkle varer
 * og in-memory-lagring for konfigurerte bestillingsutkast (OrderDraft).
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, OrderDraft } from '@/lib/types';

/** Grensesnitt for handlekurv-konteksten */
interface CartContextType {
  // ── Enkle produktvarer ──
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  // ── Bestillingsutkast (konfigurerte produkter) ──
  orderDrafts: OrderDraft[];
  addOrderDraft: (draft: OrderDraft) => void;
  removeOrderDraft: (draftId: string) => void;
  clearOrderDrafts: () => void;
  getDraftsTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/** Nøkkel for lagring i localStorage */
const CART_STORAGE_KEY = 'afnanbakes_cart';

/** Provider som wrapper appen og tilbyr handlekurvfunksjonalitet */
export function CartProvider({ children }: { children: ReactNode }) {
  // Hent lagret handlekurv fra localStorage ved oppstart
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Bestillingsutkast – lagres i sessionStorage (uten File-objekter som ikke kan serialiseres).
  // File-objektene trenger vi bare under opplasting; etter at brukeren er videresendt til Stripe
  // er bildene allerede lastet opp og URL-er er sendt.
  const DRAFTS_SESSION_KEY = 'afnanbakes_drafts';
  const [orderDrafts, setOrderDrafts] = useState<OrderDraft[]>(() => {
    try {
      const stored = sessionStorage.getItem(DRAFTS_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OrderDraft[];
        return parsed.map((d) => ({ ...d, images: [] })); // File-objekter kan ikke serialiseres
      }
    } catch { /* ignorer */ }
    return [];
  });

  // Synkroniser handlekurven til localStorage ved endringer
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Synkroniser utkast til sessionStorage (uten File-objekter som ikke kan serialiseres)
  useEffect(() => {
    try {
      const toStore = orderDrafts.map((d) => ({ ...d, images: [] }));
      sessionStorage.setItem(DRAFTS_SESSION_KEY, JSON.stringify(toStore));
    } catch { /* ignorer */ }
  }, [orderDrafts]);

  /** Legg til et produkt (øker antall hvis det allerede finnes) */
  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      ];
    });
  };

  /** Fjern et produkt fra handlekurven */
  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  /** Oppdater antall for et produkt (fjerner hvis 0 eller mindre) */
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  /** Tøm hele handlekurven */
  const clearCart = () => {
    setItems([]);
  };

  /** Beregn totalbeløp for enkle varer */
  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  /** Beregn totalt antall varer (inkluderer utkast i badge-telleren) */
  const getCartCount = () => {
    const simpleCount = items.reduce((count, item) => count + item.quantity, 0);
    return simpleCount + orderDrafts.length;
  };

  // ── Bestillingsutkast ──

  /** Legg til et konfigurert produkt i utkastskurven */
  const addOrderDraft = (draft: OrderDraft) => {
    setOrderDrafts((prev) => [...prev, draft]);
  };

  /** Fjern ett utkast */
  const removeOrderDraft = (draftId: string) => {
    setOrderDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  /** Tøm alle utkast */
  const clearOrderDrafts = () => {
    setOrderDrafts([]);
  };

  /** Totalbeløp for alle utkast */
  const getDraftsTotal = () => {
    return orderDrafts.reduce((sum, d) => sum + d.totalPrice, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        orderDrafts,
        addOrderDraft,
        removeOrderDraft,
        clearOrderDrafts,
        getDraftsTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/** Hook for å bruke handlekurven — må brukes innenfor CartProvider */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart må brukes innenfor en CartProvider');
  }
  return context;
}
