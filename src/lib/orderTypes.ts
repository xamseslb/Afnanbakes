/**
 * Bestillingstyper — Definerer alle typer og grensesnitt for bestillingssystemet.
 */

/** Tilgjengelige anledninger for bestilling */
export type Occasion = 'bursdag' | 'bryllup' | 'babyshower' | 'annet';

/** Tilgjengelige produkttyper */
export type ProductType = 'kaker' | 'cookies' | 'cakepops' | 'cupcakes' | 'sabayad';

/** Pakkealternativ med navn, pris og innhold */
export interface PackageOption {
  name: string;
  price: number;
  items: string[];
  popular?: boolean;
}

/** All data som samles inn gjennom bestillingsflyten */
export interface OrderData {
  occasion: Occasion | null;
  productType: ProductType | null;
  selectedPackage: PackageOption | null;
  isCustomDesign: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  ideas: string;
  cakeName: string;
  cakeText: string;
  quantity: string;
  images: File[];
}

/** Norske navn for hver anledning — brukes i UI og e-poster */
export const occasionLabels: Record<Occasion, string> = {
  bursdag: 'Bursdag',
  bryllup: 'Bryllup',
  babyshower: 'Baby Shower',
  annet: 'Annet',
};

/** Norske navn for hver produkttype — brukes i UI og e-poster */
export const productLabels: Record<ProductType, string> = {
  kaker: 'Kaker',
  cookies: 'Cookies',
  cakepops: 'Cake Pops',
  cupcakes: 'Cupcakes',
  sabayad: 'Sabayad',
};
