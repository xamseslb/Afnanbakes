import { motion } from 'framer-motion';
import { ArrowRight, Heart, Cake, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingSectionProps {
  onStart: () => void;
}

export function LandingSection({ onStart }: LandingSectionProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        {/* Decorative icons */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <Cake className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Heart className="w-6 h-6 text-primary/70" />
          </motion.div>
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
        </div>

        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
          Afnan<span className="text-primary">Bakes</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4">
          Håndlaget med kjærlighet i Oslo
        </p>
        
        <p className="text-lg text-muted-foreground/80 mb-8 max-w-lg mx-auto leading-relaxed">
          Fra klassiske kaker til autentisk somalisk bakst. Hver smak er en opplevelse, 
          bakt med lidenskap og de fineste ingrediensene for dine spesielle øyeblikk.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {['Bryllup', 'Bursdag', 'Eid', 'Baby Shower'].map((occasion, i) => (
            <motion.span
              key={occasion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="px-4 py-2 bg-secondary/50 rounded-full text-sm text-muted-foreground"
            >
              {occasion}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            onClick={onStart}
            className="gap-2 rounded-full text-lg px-8 py-6 shadow-elevated hover:shadow-card transition-all duration-300"
          >
            Bestill nå
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
