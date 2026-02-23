/**
 * Bestillingstyper — Definerer alle typer og grensesnitt for bestillingssystemet.
 */

/** Tilgjengelige anledninger for bestilling */
export type Occasion = 'bursdag' | 'bryllup' | 'babyshower' | 'annet';

/** Tilgjengelige produkttyper */
export type ProductType = 'kaker' | 'cookies' | 'cakepops' | 'cupcakes' | 'sabayad';

/** Kakestørrelse med pris */
export interface CakeSize {
  id: string;
  label: string;
  persons: string;
  price: number;
}

/** Smaksalternativ */
export interface CakeFlavor {
  id: string;
  label: string;
}

/** Fargealternativ */
export interface CakeColor {
  id: string;
  label: string;
  hex: string;
}

/** ── Tilgjengelige størrelser ────────────────────────────── */
export const CAKE_SIZES: CakeSize[] = [
  { id: 'small', label: 'Liten', persons: '8–10 personer', price: 1050 },
  { id: 'medium', label: 'Medium', persons: '10–15 personer', price: 1350 },
  { id: 'large', label: 'Stor', persons: '15–20 personer', price: 1650 },
  { id: 'xlarge', label: 'Ekstra stor', persons: '20–30 personer', price: 2200 },
];

/** ── Tilgjengelige smaker ───────────────────────────────── */
export const CAKE_FLAVORS: CakeFlavor[] = [
  { id: 'sjokolade', label: 'Sjokolade' },
  { id: 'vanilje', label: 'Vanilje' },
  { id: 'red-velvet', label: 'Red Velvet' },
  { id: 'karamell', label: 'Karamell' },
  { id: 'sitron', label: 'Sitron' },
  { id: 'jordbaer', label: 'Jordbær' },
];

/** ── Tilgjengelige farger ───────────────────────────────── */
export const CAKE_COLORS: CakeColor[] = [
  { id: 'dusty-pink', label: 'Dusty Pink', hex: '#E8A0B0' },
  { id: 'cream-white', label: 'Cream White', hex: '#FFF8F0' },
  { id: 'mint', label: 'Mint', hex: '#A8D8C8' },
  { id: 'sage-green', label: 'Sage Green', hex: '#B2C9AD' },
  { id: 'light-purple', label: 'Light Purple', hex: '#C3A6D6' },
  { id: 'dusty-blue', label: 'Dusty Blue', hex: '#8AACBF' },
  { id: 'light-medium-pink', label: 'Light to Medium Pink', hex: '#F0A0B8' },
  { id: 'coral', label: 'Coral', hex: '#F4846A' },
  { id: 'turquoise', label: 'Turquoise', hex: '#5BC8C8' },
  { id: 'beige', label: 'Beige', hex: '#E8D5B7' },
  { id: 'yellow', label: 'Yellow', hex: '#F5E05A' },
  { id: 'hot-pink', label: 'Hot Pink', hex: '#E8427C' },
  { id: 'light-medium-blue', label: 'Light to Medium Blue', hex: '#7EB3D8' },
  { id: 'orange', label: 'Orange', hex: '#F4903A' },
  { id: 'grey', label: 'Grey', hex: '#C0BDC0' },
];

/** Pris for spiselig bilde-tillegg */
export const PHOTO_ADDON_PRICE = 200;

/** Pakkealternativ med navn, pris og innhold (legacy — brukes fortsatt internt) */
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

  // Nye produktfelter
  selectedSize: CakeSize | null;
  selectedFlavor: CakeFlavor | null;
  selectedColor: CakeColor | null;
  withPhoto: boolean;

  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  ideas: string;
  cakeName: string;
  cakeText: string;
  quantity: string;
  deliveryDate: string;
  images: File[];
  directPrice?: number; // Brukes for produkter uten selectedSize/selectedPackage (cupcakes, cookies)
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
