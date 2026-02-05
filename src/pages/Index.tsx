import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { categories, getFeaturedProducts } from '@/lib/products';
import heroBakery from '@/assets/hero-bakery.jpg';

const featuredProducts = getFeaturedProducts();

const testimonials = [
  {
    name: 'Sara H.',
    text: 'Beste kakene i Oslo! Smaken er helt fantastisk, og servicen er alltid upåklagelig.',
    rating: 5,
  },
  {
    name: 'Ahmed M.',
    text: 'Sambosa som minner meg om hjemme. Autentisk smak og alltid ferskbakt.',
    rating: 5,
  },
  {
    name: 'Emma L.',
    text: 'Cupcakene deres er perfekte til enhver anledning. Anbefales på det varmeste!',
    rating: 5,
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroBakery}
            alt="AfnanBakes bakery"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm">
              Håndlaget i Oslo
            </span>
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-card md:text-6xl lg:text-7xl">
              Smak av{' '}
              <span className="text-gold-light">tradisjon</span>{' '}
              og kjærlighet
            </h1>
            <p className="mt-6 text-lg text-card/80 md:text-xl">
              Fra klassiske kaker til autentisk somalisk bakst. Hver smak er en
              opplevelse, bakt med lidenskap og de fineste ingrediensene.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="gap-2 rounded-full text-base">
                  Utforsk butikken
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/cakes">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-card/30 text-base text-card hover:bg-card/10 hover:text-card"
                >
                  Se kaker
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl font-bold text-foreground">
              Våre kategorier
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Oppdag vårt brede utvalg av håndlagde bakverk, fra klassiske vestlige
              favoritter til autentisk somalisk tradisjon.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 3).map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            {categories.slice(3).map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index + 3} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl font-bold text-foreground">
              Populære valg
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Kundenes favoritter, ferskbakt hver dag.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link to="/shop">
              <Button variant="outline" size="lg" className="gap-2 rounded-full">
                Se alle produkter
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About / Info Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-4xl font-bold text-foreground">
                Bakt med <span className="text-primary">lidenskap</span>
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                AfnanBakes ble startet med en enkel drøm: å dele smaken av hjemmelaget
                bakverk med Oslo. Vi kombinerer vestlige klassikere med autentiske
                somaliske oppskrifter som har gått i generasjoner.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Hver kake, cupcake og sambosa er laget for hånd med de beste
                ingrediensene. Ingen snarveier, bare ekte smak.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Lokalt</h4>
                    <p className="text-sm text-muted-foreground">Oslo, Norge</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Ferskbakt</h4>
                    <p className="text-sm text-muted-foreground">Hver dag</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img
                  src={heroBakery}
                  alt="Bakery interior"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden mt-8">
                <img
                  src={heroBakery}
                  alt="Fresh baked goods"
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl font-bold text-foreground">
              Hva kundene sier
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-card p-8 shadow-soft"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "{testimonial.text}"
                </p>
                <p className="mt-4 font-semibold text-foreground">
                  {testimonial.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl font-bold text-primary-foreground">
              Klar for noe søtt?
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
              Bestill nå og hent i butikken. Vi baker alt på bestilling for
              maksimal ferskhet.
            </p>
            <Link to="/shop" className="mt-8 inline-block">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 rounded-full text-base"
              >
                Start bestilling
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
