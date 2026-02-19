import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProductType, productLabels } from '@/lib/orderTypes';
import categoryCakes from '@/assets/category-cakes.jpg';
import categoryCookies from '@/assets/category-cookies.jpg';
import categoryCupcakes from '@/assets/category-cupcakes.jpg';

import categorySabayad from '@/assets/category-sabayad.jpg';

interface ProductSectionProps {
  selected: ProductType | null;
  onSelect: (product: ProductType) => void;
}

const products: { id: ProductType; image: string }[] = [
  { id: 'kaker', image: categoryCakes },
  { id: 'cookies', image: categoryCookies },
  { id: 'cakepops', image: categoryCupcakes },
  { id: 'cupcakes', image: categoryCupcakes },

  { id: 'sabayad', image: categorySabayad },
];

export function ProductSection({ selected, onSelect }: ProductSectionProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
          Hva ønsker du å bestille?
        </h2>
        <p className="text-muted-foreground text-lg">
          Velg produkttype
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product, index) => (
          <motion.button
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(product.id)}
            className={cn(
              "group relative overflow-hidden rounded-2xl transition-all duration-300",
              "hover:shadow-elevated",
              selected === product.id
                ? "ring-4 ring-primary ring-offset-2 ring-offset-background shadow-elevated"
                : ""
            )}
          >
            <div className="aspect-square">
              <img
                src={product.image}
                alt={productLabels[product.id]}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={cn(
                "absolute inset-0 transition-all duration-300",
                selected === product.id
                  ? "bg-primary/30"
                  : "bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent"
              )} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className={cn(
                "font-semibold text-lg transition-colors duration-300",
                selected === product.id
                  ? "text-white"
                  : "text-white"
              )}>
                {productLabels[product.id]}
              </h3>
            </div>

            {selected === product.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
