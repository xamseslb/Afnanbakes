import { motion } from 'framer-motion';
import { Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} lagt til i handlekurven`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:shadow-elevated"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-secondary">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-card-foreground">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">
            {product.price} kr
          </span>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="gap-2 rounded-full"
          >
            <Plus className="h-4 w-4" />
            Legg til
          </Button>
        </div>
      </div>

      {/* Quick Add Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-foreground/5 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Button
          onClick={handleAddToCart}
          size="lg"
          className="gap-2 rounded-full shadow-elevated"
        >
          <ShoppingBag className="h-5 w-5" />
          Legg til i kurv
        </Button>
      </motion.div>
    </motion.div>
  );
}
