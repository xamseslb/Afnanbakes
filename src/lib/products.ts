import { Product, Category } from './types';
import categoryCakes from '@/assets/category-cakes.jpg';
import categoryCupcakes from '@/assets/category-cupcakes.jpg';
import categoryCookies from '@/assets/category-cookies.jpg';
import categorySambosa from '@/assets/category-sambosa.jpg';
import categorySabayad from '@/assets/category-sabayad.jpg';

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
    id: 'sambosa',
    name: 'Sambosa',
    description: 'Autentisk somalisk smak',
    imageUrl: categorySambosa,
  },
  {
    id: 'sabayad',
    name: 'Sabayad',
    description: 'Tradisjonelt somalisk flatbrød',
    imageUrl: categorySabayad,
  },
];

export const products: Product[] = [
  // Cakes
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
  // Cupcakes
  {
    id: 5,
    name: 'Vanilje Cupcake',
    description: 'Luftig vaniljecupcake med smørfrosting',
    price: 45,
    imageUrl: categoryCupcakes,
    category: 'cupcakes',
  },
  {
    id: 6,
    name: 'Sjokolade Cupcake',
    description: 'Dekadent sjokoladecupcake med sjokoladefrosting',
    price: 50,
    imageUrl: categoryCupcakes,
    category: 'cupcakes',
  },
  {
    id: 7,
    name: 'Rød Fløyel Cupcake',
    description: 'Mini rød fløyelskake med kremosttopping',
    price: 55,
    imageUrl: categoryCupcakes,
    category: 'cupcakes',
  },
  // Cookies
  {
    id: 8,
    name: 'Chocolate Chip',
    description: 'Klassisk cookie med sjokoladebiter',
    price: 35,
    imageUrl: categoryCookies,
    category: 'cookies',
  },
  {
    id: 9,
    name: 'Double Chocolate',
    description: 'For de som elsker ekstra sjokolade',
    price: 40,
    imageUrl: categoryCookies,
    category: 'cookies',
  },
  {
    id: 10,
    name: 'Havrecookie',
    description: 'Hjemmelaget havrecookie med rosiner',
    price: 30,
    imageUrl: categoryCookies,
    category: 'cookies',
  },
  // Sambosa
  {
    id: 11,
    name: 'Kjøtt Sambosa',
    description: 'Sprø sambosa fylt med krydret kjøttdeig',
    price: 25,
    imageUrl: categorySambosa,
    category: 'sambosa',
  },
  {
    id: 12,
    name: 'Grønnsak Sambosa',
    description: 'Vegetarisk sambosa med krydrede grønnsaker',
    price: 22,
    imageUrl: categorySambosa,
    category: 'sambosa',
  },
  // Sabayad
  {
    id: 13,
    name: 'Klassisk Sabayad',
    description: 'Tradisjonelt somalisk flatbrød',
    price: 35,
    imageUrl: categorySabayad,
    category: 'sabayad',
  },
  {
    id: 14,
    name: 'Honning Sabayad',
    description: 'Sabayad toppet med honning og smør',
    price: 45,
    imageUrl: categorySabayad,
    category: 'sabayad',
  },
];

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((p) => p.category === category);
};

export const getProductById = (id: number): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getFeaturedProducts = (): Product[] => {
  return [products[0], products[1], products[5], products[8], products[10], products[13]];
};
