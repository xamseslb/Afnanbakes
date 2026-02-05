import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/lib/types';

interface CategoryCardProps {
  category: Category;
  index: number;
}

export function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/${category.id}`}
        className="group relative block overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:shadow-elevated"
      >
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-serif text-2xl font-bold text-card">
            {category.name}
          </h3>
          <p className="mt-1 text-sm text-card/80">{category.description}</p>
          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-primary-foreground">
            <span className="text-gold-light">Se utvalg</span>
            <ArrowRight className="h-4 w-4 text-gold-light transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
