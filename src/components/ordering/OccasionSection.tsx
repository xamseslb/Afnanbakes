import { motion } from 'framer-motion';
import { Cake, Heart, Baby, Moon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Occasion, occasionLabels } from '@/lib/orderTypes';

interface OccasionSectionProps {
  selected: Occasion | null;
  onSelect: (occasion: Occasion) => void;
}

const occasions: { id: Occasion; icon: React.ReactNode; description: string }[] = [
  { id: 'bursdag', icon: <Cake className="w-8 h-8" />, description: 'Feir en spesiell dag' },
  { id: 'bryllup', icon: <Heart className="w-8 h-8" />, description: 'Kjærlighet i hvert lag' },
  { id: 'babyshower', icon: <Baby className="w-8 h-8" />, description: 'Velkommen lille en' },
  { id: 'ramadan', icon: <Moon className="w-8 h-8" />, description: 'Ramadan Kareem' },
  { id: 'annet', icon: <Sparkles className="w-8 h-8" />, description: 'Bare fordi' },
];

export function OccasionSection({ selected, onSelect }: OccasionSectionProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
          Hva er anledningen?
        </h2>
        <p className="text-muted-foreground text-lg">
          Velg hva du vil feire
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {occasions.map((occasion, index) => (
          <motion.button
            key={occasion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(occasion.id)}
            className={cn(
              "group relative p-6 rounded-2xl border-2 transition-all duration-300",
              "hover:shadow-card hover:border-primary/50",
              "flex flex-col items-center text-center gap-3",
              selected === occasion.id
                ? "border-primary bg-primary/5 shadow-card"
                : "border-border bg-card"
            )}
          >
            <div className={cn(
              "p-4 rounded-full transition-colors duration-300",
              selected === occasion.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              {occasion.icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {occasionLabels[occasion.id]}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {occasion.description}
              </p>
            </div>

            {selected === occasion.id && (
              <motion.div
                layoutId="occasion-selected"
                className="absolute inset-0 border-2 border-primary rounded-2xl"
                initial={false}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
