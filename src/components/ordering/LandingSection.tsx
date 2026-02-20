import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Occasion } from '@/lib/orderTypes';

interface LandingSectionProps {
  onStart: () => void;
  onSelectOccasion?: (occasion: Occasion) => void;
}

const heroSlides = [
  {
    image: '/images/hero/Gemini_Generated_Image_hdop7uhdop7uhdop.jpg',
    title: 'Cupcakes Med Kjærlighet',
    subtitle: 'Fargerike og dekorerte — perfekt til enhver feiring',
  },
  {
    image: '/images/hero/Gemini_Generated_Image_ho4r4iho4r4iho4r.jpg',
    title: 'Hjemmelagde Cookies',
    subtitle: 'Sprø, myke og uimotståelige smaker',
  },
  {
    image: '/images/hero/Gemini_Generated_Image_ig5ylfig5ylfig5y.jpg',
    title: 'Kaker For Enhver Smak',
    subtitle: 'Fra klassisk til kreativ — vi har noe for alle',
  },
  {
    image: '/images/hero/Gemini_Generated_Image_si9vuesi9vuesi9v.jpg',
    title: 'Feir Bursdagen!',
    subtitle: 'Skreddersydde bursdagskaker som gjør dagen magisk',
  },
  {
    image: '/images/hero/Gemini_Generated_Image_3xupkg3xupkg3xup.png',
    title: 'Premium Kvalitet',
    subtitle: 'Luksuriøse smaker med de fineste ingrediensene',
  },
  {
    image: '/images/hero/Gemini_Generated_Image_yfycl6yfycl6yfyc.jpg',
    title: 'Drømmekaken Til Bryllupet',
    subtitle: 'Elegante bryllupskaker med roser og gulldetaljer',
  },
];

const occasionTags: { label: string; value: Occasion }[] = [
  { label: 'Bryllup', value: 'bryllup' },
  { label: 'Bursdag', value: 'bursdag' },

  { label: 'Baby Shower', value: 'babyshower' },
];

export function LandingSection({ onStart, onSelectOccasion }: LandingSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = heroSlides[currentSlide];

  return (
    <div className="w-full">
      {/* ── Full-Bleed Hero Carousel ── */}
      <section className="relative w-screen -ml-[calc((100vw-100%)/2)] h-[70vh] md:h-[85vh] overflow-hidden">
        {/* Background images — all rendered, crossfade via opacity */}
        {heroSlides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === currentSlide ? 1 : 0 }}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          </div>
        ))}

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-lg md:text-2xl text-white/90 mb-8 drop-shadow-md max-w-2xl mx-auto">
                {slide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              size="lg"
              onClick={onStart}
              className="gap-2 rounded-full text-lg px-8 py-6 bg-white text-foreground hover:bg-white/90 shadow-elevated transition-all duration-300"
            >
              Bestill nå
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          aria-label="Forrige bilde"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Neste bilde"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Gå til bilde ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
            />
          ))}
        </div>
      </section>

      {/* ── Occasion Quick-Pick ── */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Hva feirer du?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Velg anledning og kom rett til bestillingen
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {occasionTags.map((tag, i) => (
              <motion.button
                key={tag.value}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onSelectOccasion?.(tag.value)}
                className="px-6 py-3 bg-card border border-border/50 rounded-full text-base font-medium text-foreground shadow-soft hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-elevated transition-all duration-300 cursor-pointer"
              >
                {tag.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
