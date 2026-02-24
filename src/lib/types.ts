/**
 * Generelle typer — Produkter, handlekurv og kategorier.
 */

/** Tilgjengelige produktkategorier i butikken */
export type ProductCategory = 'cakes' | 'cupcakes';

/** Et enkelt produkt i katalogen */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  minOrder?: number;
}

/** En vare i handlekurven */
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

/** En produktkategori med visningsnavn og bilde */
export interface Category {
  id: ProductCategory;
  name: string;
  description: string;
  imageUrl: string;
}

/**
 * En konfigurert bestilling som er parkert i kurven.
 * Brukes av «Legg til produkt til»-funksjonen i ProductDetailPage.
 */
export interface OrderDraft {
  /** Unik ID (tilfeldig UUID) */
  id: string;
  /** Produktnavn for visning */
  productName: string;
  productImageUrl: string;
  isCake: boolean;
  /** Oppsummeringstekst for størrelse, f.eks. "Liten · 8–10 porsjoner" */
  sizeSummary: string;
  flavorLabel: string;
  fillingLabel: string;
  quantity: number;
  /** Ferdig beregnet totalpris inkl. tillegg */
  totalPrice: number;
  delivery: string;          // ISO-dato
  withPhoto: boolean;
  cakeText: string;
  description: string;
  /** Stripens linjeelement-navn */
  packageName: string;
  /** Betalbar pris i NOK (= totalPrice) */
  packagePrice: number;
  /** Inspirasjonsfiler — beholdes kun i minnet, ikke i localStorage */
  images: File[];
}
