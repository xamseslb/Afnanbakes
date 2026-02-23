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
