/**
 * Bestillingstyper — Definerer alle typer og grensesnitt for bestillingssystemet.
 */

/** Tilgjengelige anledninger for bestilling */
export type Occasion = 'bursdag' | 'bryllup' | 'babyshower' | 'annet';

/** Tilgjengelige produkttyper */
export type ProductType = 'kaker' | 'cupcakes';

/** Kakestørrelse med pris */
export interface CakeSize {
  id: string;
  label: string;
  persons: string;
  price: number;
}

/** Smaksalternativ med tilhørende fyllvalg */
export interface CakeFlavor {
  id: string;
  label: string;
  fillings: string[];
}

/** Fargealternativ */
export interface CakeColor {
  id: string;
  label: string;
  hex: string;
}

/** ── Tilgjengelige størrelser ────────────────────────────── */
export const CAKE_SIZES: CakeSize[] = [
  { id: 'small', label: 'Liten', persons: '8–10 porsjoner', price: 499 },
  { id: 'medium', label: 'Medium', persons: '10–12 porsjoner', price: 649 },
];

/** ── Tilgjengelige smaker ───────────────────────────────── */
export const CAKE_FLAVORS: CakeFlavor[] = [
  { id: 'vanilje', label: 'Vanilje', fillings: ['Karamel', 'Bær', 'Vanilje'] },
  { id: 'sjokolade', label: 'Sjokolade', fillings: ['Ganache', 'Bringebær'] },
  { id: 'red-velvet', label: 'Red Velvet', fillings: ['Kremost', 'Kremost og karamel'] },
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
  cupcakes: 'Cupcakes',
};

