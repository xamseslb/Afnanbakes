import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { getProductsByCategory, categories } from '@/lib/products';
import { ProductCategory } from '@/lib/types';
import categoryCakes from '@/assets/category-cakes.jpg';
import categoryCupcakes from '@/assets/category-cupcakes.jpg';
import categoryCookies from '@/assets/category-cookies.jpg';

import categorySabayad from '@/assets/category-sabayad.jpg';

const categoryImages: Record<ProductCategory, string> = {
  cakes: categoryCakes,
  cupcakes: categoryCupcakes,
  cookies: categoryCookies,

  sabayad: categorySabayad,
};

export default function CategoryPage() {
  const location = useLocation();
  const category = location.pathname.slice(1) as ProductCategory;

  const categoryInfo = categories.find((c) => c.id === category);
  const categoryProducts = category ? getProductsByCategory(category) : [];

  if (!categoryInfo) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Kategori ikke funnet
        </h1>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={categoryImages[category] || categoryCakes}
            alt={categoryInfo.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center"
        >
          <h1 className="font-serif text-5xl font-bold text-card md:text-6xl">
            {categoryInfo.name}
          </h1>
          <p className="mt-4 text-lg text-card/80 max-w-xl mx-auto">
            {categoryInfo.description}
          </p>
        </motion.div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {categoryProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Ingen produkter i denne kategorien ennå.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
