/**
 * CategoryPage — Produktgrid i soulcake.no-inspirert stil.
 * Venstre-justert tittel, beskrivende tekst, 3-kolonne grid med grå plassholder-bilder.
 * Klikk på produkt → ProductDetailPage.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProductsByCategory, categories } from '@/lib/products';
import { ProductCategory } from '@/lib/types';
import { ImageIcon } from 'lucide-react';

const categoryDescriptions: Record<ProductCategory, { title: string; intro: string; info: string }> = {
  cakes: {
    title: 'KAKER',
    intro: 'Håndlagde kaker som gjør øyeblikket uforglemmelig.',
    info: 'Hver kake er skreddersydd akkurat for deg — fra størrelse og smak til farge og dekor. Vi baker med kjærlighet og de beste råvarene. Send bestilling minst 5 dager i forveien.',
  },
  cupcakes: {
    title: 'CUPCAKES',
    intro: 'Små mesterverk — store på smak og glede.',
    info: 'Perfekte til fester, gaver eller bare fordi du fortjener noe godt. Vi lager cupcakes i minimum 6 stk, nøye dekorert og klar til henting etter avtale.',
  },
  cookies: {
    title: 'COOKIES',
    intro: 'Hjemmelagde cookies — bakt med kjærlighet og de fineste ingrediensene.',
    info: 'Sprø utenpå, myke inni og fulle av smak. Bestilles i minimum 10 stk og bakes ferske til deg. Perfekte som gave, til kaffekosen eller bare for å unne seg noe godt.',
  },
  sabayad: {
    title: 'SABAYAD',
    intro: 'Tradisjonelt somalisk flatbrød — hjemmelagd med kjærlighet!',
    info: 'Sabayad bestilles i minimum 10 stk. Perfekt til frokost, lunsj eller middag.',
  },
};

export default function CategoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const category = location.pathname.slice(1) as ProductCategory;

  const categoryInfo = categories.find((c) => c.id === category);
  const categoryProducts = category ? getProductsByCategory(category) : [];
  const desc = categoryDescriptions[category];

  if (!categoryInfo || !desc) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">Kategori ikke funnet</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Side-header — AfnanBakes handskrift-stil ── */}
      <section className="pt-16 pb-10 container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Handskrift-tittel med dekorativ bue */}
          <div className="mb-6">
            <h1 className="font-handwritten text-4xl md:text-5xl font-bold text-foreground leading-none mb-1">
              {desc.title}
            </h1>
            {/* Dekorativ SVG-bue — AfnanBakes signatur i pink */}
            <svg
              viewBox="0 0 420 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-72 md:w-[420px] h-7 -mt-1"
            >
              <path
                d="M4 20 C60 6, 160 2, 260 12 C320 18, 370 22, 416 14"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M380 10 C395 10, 410 16, 416 14 C418 22, 412 26, 405 24"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Beskrivelse */}
          <div className="max-w-xl space-y-1.5">
            <p className="text-base font-medium text-foreground/90 italic">{desc.intro}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc.info}</p>
          </div>
        </motion.div>
      </section>

      {/* ── Produktgrid ── */}
      <section className="pb-16 container mx-auto px-4">
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {categoryProducts.map((product, i) => (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              onClick={() => navigate(`/${category}/${product.id}`)}
              className="group text-left w-full focus:outline-none"
            >
              {/* Bilde — grå plassholder med hover-effekt */}
              <div className="aspect-square w-full rounded-none overflow-hidden bg-muted flex items-center justify-center transition-all duration-300 group-hover:brightness-95">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Produktinfo — enkel og clean */}
              <div className="mt-3">
                <h3 className="font-medium text-foreground text-sm md:text-base group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  fra {product.price.toLocaleString('nb-NO')} kr
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {categoryProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Ingen produkter ennå — kom tilbake snart!</p>
          </div>
        )}
      </section>
    </div>
  );
}
