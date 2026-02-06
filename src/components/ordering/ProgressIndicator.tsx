import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ['Start', 'Anledning', 'Produkt', 'Detaljer', 'Oppsummering', 'Ferdig'];

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted || isCurrent 
                      ? 'hsl(var(--primary))' 
                      : 'hsl(var(--muted))',
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted || isCurrent
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </motion.div>
                <span className={cn(
                  "text-xs mt-1 hidden sm:block",
                  isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {stepLabels[i]}
                </span>
              </div>
              
              {step < totalSteps && (
                <div className="flex-1 mx-2">
                  <div className="h-0.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{
                        width: isCompleted ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
