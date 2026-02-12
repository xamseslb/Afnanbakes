export type Occasion = 'bursdag' | 'bryllup' | 'babyshower' | 'ramadan' | 'annet';
export type ProductType = 'kaker' | 'cookies' | 'cakepops' | 'cupcakes' | 'sambosa' | 'sabayad';

export interface OrderData {
  occasion: Occasion | null;
  productType: ProductType | null;
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

export const occasionLabels: Record<Occasion, string> = {
  bursdag: 'Bursdag',
  bryllup: 'Bryllup',
  babyshower: 'Baby Shower',
  ramadan: 'Ramadan/Eid',
  annet: 'Annet',
};

export const productLabels: Record<ProductType, string> = {
  kaker: 'Kaker',
  cookies: 'Cookies',
  cakepops: 'Cake Pops',
  cupcakes: 'Cupcakes',
  sambosa: 'Sambosa',
  sabayad: 'Sabayad',
};
