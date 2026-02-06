import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from '@/components/ordering/ProgressIndicator';
import { LandingSection } from '@/components/ordering/LandingSection';
import { OccasionSection } from '@/components/ordering/OccasionSection';
import { ProductSection } from '@/components/ordering/ProductSection';
import { DetailsSection } from '@/components/ordering/DetailsSection';
import { SummarySection } from '@/components/ordering/SummarySection';
import { SuccessSection } from '@/components/ordering/SuccessSection';
import { OrderData, Occasion, ProductType } from '@/lib/orderTypes';

const TOTAL_STEPS = 6;

const initialOrderData: OrderData = {
  occasion: null,
  productType: null,
  description: '',
  ideas: '',
  cakeName: '',
  cakeText: '',
  quantity: '',
  images: [],
};

export default function Index() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [orderData, setOrderData] = useState<OrderData>(initialOrderData);

  const goToStep = useCallback((step: number) => {
    setDirection(step > currentStep ? 'forward' : 'backward');
    setCurrentStep(step);
  }, [currentStep]);

  const goNext = useCallback(() => {
    setDirection('forward');
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setDirection('backward');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleOccasionSelect = (occasion: Occasion) => {
    setOrderData((prev) => ({ ...prev, occasion }));
    setTimeout(goNext, 300);
  };

  const handleProductSelect = (productType: ProductType) => {
    setOrderData((prev) => ({ ...prev, productType }));
    setTimeout(goNext, 300);
  };

  const handleDetailsUpdate = (data: Partial<OrderData>) => {
    setOrderData((prev) => ({ ...prev, ...data }));
  };

  const handleConfirm = () => {
    // Here you would send the order to your backend
    console.log('Order confirmed:', orderData);
    goNext();
  };

  const handleNewOrder = () => {
    setOrderData(initialOrderData);
    setDirection('backward');
    setCurrentStep(1);
  };

  const pageVariants = {
    enter: (dir: string) => ({
      x: dir === 'forward' ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: string) => ({
      x: dir === 'forward' ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Back button */}
            <div className="w-24">
              {currentStep > 1 && currentStep < TOTAL_STEPS && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBack}
                    className="gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Tilbake
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-xl font-bold text-foreground"
            >
              Afnan<span className="text-primary">Bakes</span>
            </motion.div>

            {/* Spacer */}
            <div className="w-24" />
          </div>
        </div>

        {/* Progress indicator */}
        {currentStep > 1 && currentStep < TOTAL_STEPS && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-4"
          >
            <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          </motion.div>
        )}
      </header>

      {/* Main content */}
      <main className={currentStep > 1 && currentStep < TOTAL_STEPS ? 'pt-32' : 'pt-24'}>
        <div className="container mx-auto min-h-[calc(100vh-5rem)]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {currentStep === 1 && (
                <LandingSection onStart={goNext} />
              )}

              {currentStep === 2 && (
                <OccasionSection
                  selected={orderData.occasion}
                  onSelect={handleOccasionSelect}
                />
              )}

              {currentStep === 3 && (
                <ProductSection
                  selected={orderData.productType}
                  onSelect={handleProductSelect}
                />
              )}

              {currentStep === 4 && (
                <DetailsSection
                  orderData={orderData}
                  onUpdate={handleDetailsUpdate}
                  onContinue={goNext}
                />
              )}

              {currentStep === 5 && (
                <SummarySection
                  orderData={orderData}
                  onEdit={() => goToStep(4)}
                  onConfirm={handleConfirm}
                />
              )}

              {currentStep === 6 && (
                <SuccessSection onNewOrder={handleNewOrder} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
