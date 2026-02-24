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
/** Nøkkel for utkast i sessionStorage */
const DRAFTS_SESSION_KEY = 'afnanbakes_drafts';

/** Skriver utkast til sessionStorage SYNKRONT (uten File-objekter som ikke kan serialiseres) */
function saveToSession(drafts: OrderDraft[]) {
  try {
    sessionStorage.setItem(DRAFTS_SESSION_KEY, JSON.stringify(drafts.map((d) => ({ ...d, images: [] }))));
  } catch { /* ignorer */ }
}

/** Provider som wrapper appen og tilbyr handlekurvfunksjonalitet */
export function CartProvider({ children }: { children: ReactNode }) {
  // Hent lagret handlekurv fra localStorage ved oppstart
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Bestillingsutkast – initialisert fra sessionStorage (uten File-objekter)
  const [orderDrafts, setOrderDrafts] = useState<OrderDraft[]>(() => {
    try {
      const stored = sessionStorage.getItem(DRAFTS_SESSION_KEY);
      if (stored) {
        return (JSON.parse(stored) as OrderDraft[]).map((d) => ({ ...d, images: [] }));
      }
    } catch { /* ignorer */ }
    return [];
  });

  // Synkroniser handlekurven til localStorage ved endringer
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Backup-synkronisering til sessionStorage ved re-renders
  useEffect(() => { saveToSession(orderDrafts); }, [orderDrafts]);

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
    setOrderDrafts((prev) => {
      const updated = [...prev, draft];
      saveToSession(updated); // SYNKRONT: sikrer at sessionStorage alltid er oppdatert
      return updated;
    });
  };

  /** Fjern ett utkast */
  const removeOrderDraft = (draftId: string) => {
    setOrderDrafts((prev) => {
      const updated = prev.filter((d) => d.id !== draftId);
      saveToSession(updated);
      return updated;
    });
  };

  /** Tøm alle utkast */
  const clearOrderDrafts = () => {
    saveToSession([]); // SYNKRONT: tøm sessionStorage før setState
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
