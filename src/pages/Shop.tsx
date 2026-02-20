/**
 * Shop — Butikksiden med kategorifilter og produktkort.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { products, categories } from '@/lib/products';
import { ProductCategory } from '@/lib/types';

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Header */}
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl">
              Butikk
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Utforsk vårt komplette utvalg av håndlagde bakverk.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setActiveCategory('all')}
            >
              Alle
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Ingen produkter funnet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
