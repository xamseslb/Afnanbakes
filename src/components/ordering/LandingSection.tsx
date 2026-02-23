/**
 * LandingSection — Hero-slideshow med kategori-navigering.
 * Knapper lenker nå direkte til kategori-sider istedenfor bestillingsflyt.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const heroSlides = [
  {
    image: '/images/hero/Gemini_Generated_Image_hdop7uhdop7uhdop.jpg',
    title: 'Cupcakes Med Kjærlighet',
    subtitle: 'Fargerike og dekorerte — perfekt til enhver feiring',
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
    image: '/images/hero/Gemini_Generated_Image_2h6wbk2h6wbk2h6w.jpg',
    title: 'Premium Kvalitet',
    subtitle: 'Luksuriøse smaker med de fineste ingrediensene',
  },
  {
    image: '/images/hero/Gemini_Generated_Image_yfycl6yfycl6yfyc.jpg',
    title: 'Drømmekaken Til Bryllupet',
    subtitle: 'Elegante bryllupskaker med roser og gulldetaljer',
  },
];

const categoryLinks = [
  { label: 'Kaker', to: '/cakes' },
  { label: 'Cupcakes', to: '/cupcakes' },
  { label: 'Custom', to: '/custom' },
];

export function LandingSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = heroSlides[currentSlide];

  return (
    <div className="w-full">
      {/* ── Full-Bleed Hero Carousel ── */}
      <section className="relative w-screen -ml-[calc((100vw-100%)/2)] h-[70vh] md:h-[85vh] overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          </div>
        ))}

        {/* Tekst over bildene */}
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
              <p className="text-lg md:text-2xl text-white/90 drop-shadow-md max-w-2xl mx-auto">
                {slide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Kategori-knapper over hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap gap-3 justify-center"
          >
            {categoryLinks.map((cat) => (
              <Link
                key={cat.to}
                to={cat.to}
                className="px-6 py-2.5 bg-white/90 backdrop-blur-sm text-foreground font-semibold rounded-full text-sm hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                {cat.label}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Navigasjonspiler */}
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

        {/* Bildeindikator-dots */}
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
    </div>
  );
}
