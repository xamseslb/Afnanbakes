export type ProductCategory = 'cakes' | 'cupcakes' | 'cookies' | 'sabayad';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  minOrder?: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Category {
  id: ProductCategory;
  name: string;
  description: string;
  imageUrl: string;
}
