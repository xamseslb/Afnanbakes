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
];

/** Komplett produktliste — bilder legges til etter hvert */
export const products: Product[] = [
  // ── Kaker ──
  {
    id: 1,
    name: 'Bursdagskake',
    description: 'En søt og gjennomtenkt kake til bursdagen',
    price: 499,
    imageUrl: '',
    category: 'cakes',
  },
  {
    id: 2,
    name: 'Bryllupskake',
    description: 'Elegant kake for den store dagen',
    price: 499,
    imageUrl: '',
    category: 'cakes',
  },
  {
    id: 3,
    name: 'Baby Shower-kake',
    description: 'Søt og delikat kake til babydusjen',
    price: 499,
    imageUrl: '',
    category: 'cakes',
  },
  {
    id: 4,
    name: 'Anledningskake',
    description: 'Perfekt for alle andre anledninger',
    price: 499,
    imageUrl: '',
    category: 'cakes',
  },

  // ── Cupcakes (min. 6 stk) ──
  {
    id: 5,
    name: 'Vanilje Cupcakes',
    description: 'Luftige vaniljecupcakes med smørfrosting',
    price: 30,
    imageUrl: '',
    category: 'cupcakes',
    minOrder: 6,
  },
  {
    id: 6,
    name: 'Sjokolade Cupcakes',
    description: 'Rike sjokoladecupcakes med sjokoladefrosting',
    price: 32,
    imageUrl: '',
    category: 'cupcakes',
    minOrder: 6,
  },
  {
    id: 7,
    name: 'Rød Fløyel Cupcakes',
    description: 'Mini rød fløyelskake med kremosttopping',
    price: 35,
    imageUrl: '',
    category: 'cupcakes',
    minOrder: 6,
  },
  {
    id: 8,
    name: 'Sitron Cupcakes',
    description: 'Friske sitron cupcakes med sitron-frosting',
    price: 30,
    imageUrl: '',
    category: 'cupcakes',
    minOrder: 6,
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
  products.filter((_, i) => [0, 4].includes(i));

