/**
 * Produktkatalog — Alle produkter, kategorier og hjelpefunksjoner.
 */
import { Product, Category } from './types';
import categoryCakes from '@/assets/category-cakes.jpg';
import categoryCupcakes from '@/assets/category-cupcakes.jpg';
import categoryCookies from '@/assets/category-cookies.jpg';
import categorySabayad from '@/assets/category-sabayad.jpg';

/** Alle produktkategorier med visningsnavn og bilde */
export const categories: Category[] = [
  {
    id: 'cakes',
    name: 'Kaker',
    description: 'Håndlagde kaker for enhver anledning',
    imageUrl: categoryCakes,
  },
  {
    id: 'cupcakes',
    name: 'Cupcakes',
    description: 'Små biter av lykke',
    imageUrl: categoryCupcakes,
  },
  {
    id: 'cookies',
    name: 'Cookies',
    description: 'Ferske og sprø hver dag',
    imageUrl: categoryCookies,
  },
  {
    id: 'sabayad',
    name: 'Sabayad',
    description: 'Tradisjonelt somalisk flatbrød',
    imageUrl: categorySabayad,
  },
];

/** Komplett produktliste med priser og minimum-bestilling */
export const products: Product[] = [
  // ── Kaker (ingen minimumsbestilling) ──
  {
    id: 1,
    name: 'Vanilla Dream',
    description: 'Klassisk vaniljekake med kremostfrosting',
    price: 450,
    imageUrl: categoryCakes,
    category: 'cakes',
  },
  {
    id: 2,
    name: 'Chocolate Delight',
    description: 'Rik sjokoladekake med sjokolade ganache',
    price: 495,
    imageUrl: categoryCakes,
    category: 'cakes',
  },
  {
    id: 3,
    name: 'Red Velvet',
    description: 'Elegant rød fløyelskake med kremostfrosting',
    price: 525,
    imageUrl: categoryCakes,
    category: 'cakes',
  },
  {
    id: 4,
    name: 'Carrot Cake',
    description: 'Saftig gulrotkake med valnøtter og kremostfrosting',
    price: 475,
    imageUrl: categoryCakes,
    category: 'cakes',
  },

  // ── Cupcakes (min. 10 stk) ──
  {
    id: 5,
    name: 'Vanilje Cupcake',
    description: 'Luftig vaniljecupcake med smørfrosting',
    price: 45,
    imageUrl: categoryCupcakes,
    category: 'cupcakes',
    minOrder: 10,
  },
  {
    id: 6,
    name: 'Sjokolade Cupcake',
    description: 'Dekadent sjokoladecupcake med sjokoladefrosting',
    price: 50,
    imageUrl: categoryCupcakes,
    category: 'cupcakes',
    minOrder: 10,
  },
  {
    id: 7,
    name: 'Rød Fløyel Cupcake',
    description: 'Mini rød fløyelskake med kremosttopping',
    price: 55,
    imageUrl: categoryCupcakes,
    category: 'cupcakes',
    minOrder: 10,
  },

  // ── Cookies (min. 10 stk) ──
  {
    id: 8,
    name: 'Chocolate Chip',
    description: 'Klassisk cookie med sjokoladebiter',
    price: 35,
    imageUrl: categoryCookies,
    category: 'cookies',
    minOrder: 10,
  },
  {
    id: 9,
    name: 'Double Chocolate',
    description: 'For de som elsker ekstra sjokolade',
    price: 40,
    imageUrl: categoryCookies,
    category: 'cookies',
    minOrder: 10,
  },
  {
    id: 10,
    name: 'Havrecookie',
    description: 'Hjemmelaget havrecookie med rosiner',
    price: 30,
    imageUrl: categoryCookies,
    category: 'cookies',
    minOrder: 10,
  },

  // ── Sabayad (min. 10 stk) ──
  {
    id: 13,
    name: 'Klassisk Sabayad',
    description: 'Tradisjonelt somalisk flatbrød',
    price: 35,
    imageUrl: categorySabayad,
    category: 'sabayad',
    minOrder: 10,
  },
  {
    id: 14,
    name: 'Honning Sabayad',
    description: 'Sabayad toppet med honning og smør',
    price: 45,
    imageUrl: categorySabayad,
    category: 'sabayad',
    minOrder: 10,
  },
];

/** Henter alle produkter i en gitt kategori */
export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((p) => p.category === category);
};

/** Henter et produkt basert på ID */
export const getProductById = (id: number): Product | undefined => {
  return products.find((p) => p.id === id);
};

/** Henter et utvalg av produkter for forsiden (ett fra hver kategori) */
export const getFeaturedProducts = (): Product[] => {
  return [products[0], products[4], products[7], products[10]].filter(Boolean);
};
