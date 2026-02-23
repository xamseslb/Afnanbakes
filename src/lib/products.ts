/**
 * Produktkatalog — Alle produkter, kategorier og hjelpefunksjoner.
 * Bilder er blanke (tom streng) — legges til av Afnan etter hvert.
 */
import { Product, Category } from './types';

/** Alle produktkategorier med visningsnavn */
export const categories: Category[] = [
  {
    id: 'cakes',
    name: 'Kaker',
    description: 'Håndlagde kaker for enhver anledning',
    imageUrl: '',
  },
  {
    id: 'cupcakes',
    name: 'Cupcakes',
    description: 'Små biter av lykke',
    imageUrl: '',
  },
  {
    id: 'cookies',
    name: 'Cookies',
    description: 'Ferske og sprø cookies',
    imageUrl: '',
  },
  {
    id: 'sabayad',
    name: 'Sabayad',
    description: 'Tradisjonelt somalisk flatbrød',
    imageUrl: '',
  },
];

/** Komplett produktliste — bilder legges til etter hvert */
export const products: Product[] = [
  // ── Kaker ──
  {
    id: 1,
    name: 'Bursdagskake',
    description: 'En søt og gjennomtenkt kake til bursdagen',
    price: 1050,
    imageUrl: '',
    category: 'cakes',
  },
  {
    id: 2,
    name: 'Bryllupskake',
    description: 'Elegant kake for den store dagen',
    price: 1999,
    imageUrl: '',
    category: 'cakes',
  },
  {
    id: 3,
    name: 'Baby Shower-kake',
    description: 'Søt og delikat kake til babydusjen',
    price: 1050,
    imageUrl: '',
    category: 'cakes',
  },
  {
    id: 4,
    name: 'Anledningskake',
    description: 'Perfekt for alle andre anledninger',
    price: 1050,
    imageUrl: '',
    category: 'cakes',
  },

  // ── Cupcakes (min. 6 stk) ──
  {
    id: 5,
    name: 'Vanilje Cupcakes',
    description: 'Luftige vaniljecupcakes med smørfrosting',
    price: 55,
    imageUrl: '',
    category: 'cupcakes',
    minOrder: 6,
  },
  {
    id: 6,
    name: 'Sjokolade Cupcakes',
    description: 'Rike sjokoladecupcakes med sjokoladefrosting',
    price: 60,
    imageUrl: '',
    category: 'cupcakes',
    minOrder: 6,
  },
  {
    id: 7,
    name: 'Rød Fløyel Cupcakes',
    description: 'Mini rød fløyelskake med kremosttopping',
    price: 65,
    imageUrl: '',
    category: 'cupcakes',
    minOrder: 6,
  },
  {
    id: 8,
    name: 'Sitron Cupcakes',
    description: 'Friske sitron cupcakes med sitron-frosting',
    price: 60,
    imageUrl: '',
    category: 'cupcakes',
    minOrder: 6,
  },

  // ── Cookies (min. 10 stk) ──
  {
    id: 9,
    name: 'Chocolate Chip Cookies',
    description: 'Klassisk cookie med sjokoladebiter',
    price: 40,
    imageUrl: '',
    category: 'cookies',
    minOrder: 10,
  },
  {
    id: 10,
    name: 'Double Chocolate Cookies',
    description: 'For de som elsker ekstra sjokolade',
    price: 45,
    imageUrl: '',
    category: 'cookies',
    minOrder: 10,
  },
  {
    id: 11,
    name: 'Havrecookies',
    description: 'Hjemmelaget havrecookie med rosiner',
    price: 35,
    imageUrl: '',
    category: 'cookies',
    minOrder: 10,
  },
  {
    id: 12,
    name: 'Peanøttsmør Cookies',
    description: 'Søt og salt peanøttsmør cookie',
    price: 45,
    imageUrl: '',
    category: 'cookies',
    minOrder: 10,
  },

  // ── Sabayad (min. 10 stk) ──
  {
    id: 13,
    name: 'Klassisk Sabayad',
    description: 'Tradisjonelt somalisk flatbrød',
    price: 35,
    imageUrl: '',
    category: 'sabayad',
    minOrder: 10,
  },
  {
    id: 14,
    name: 'Honning Sabayad',
    description: 'Sabayad toppet med honning og smør',
    price: 45,
    imageUrl: '',
    category: 'sabayad',
    minOrder: 10,
  },
];

/** Henter alle produkter i en gitt kategori */
export const getProductsByCategory = (category: string): Product[] =>
  products.filter((p) => p.category === category);

/** Henter et produkt basert på ID */
export const getProductById = (id: number): Product | undefined =>
  products.find((p) => p.id === id);

/** Henter et utvalg av produkter for forsiden */
export const getFeaturedProducts = (): Product[] =>
  products.filter((_, i) => [0, 4, 8, 12].includes(i));
