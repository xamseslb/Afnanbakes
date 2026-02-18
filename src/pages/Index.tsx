import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from '@/components/ordering/ProgressIndicator';
import { LandingSection } from '@/components/ordering/LandingSection';
import { OccasionSection } from '@/components/ordering/OccasionSection';
import { PackageSection, occasionPackages } from '@/components/ordering/PackageSection';
import { DetailsSection } from '@/components/ordering/DetailsSection';
import { SummarySection } from '@/components/ordering/SummarySection';
import { SuccessSection } from '@/components/ordering/SuccessSection';
import { OrderData, Occasion, PackageOption } from '@/lib/orderTypes';
import { submitOrder } from '@/lib/orderService';
import { useToast } from '@/hooks/use-toast';
import { HomeSections } from '@/components/ordering/HomeSections';

const TOTAL_STEPS = 6;

const initialOrderData: OrderData = {
  occasion: null,
  productType: null,
  selectedPackage: null,
  isCustomDesign: false,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-link: if coming from /priser with ?anledning=X&pakke=Y, pre-fill and skip ahead
  useEffect(() => {
    const anledning = searchParams.get('anledning') as Occasion | null;
    if (!anledning) return;

    const pakkeName = searchParams.get('pakke');
    const packages = occasionPackages[anledning]?.packages || [];
    const matchedPkg = pakkeName
      ? packages.find((p) => p.name === decodeURIComponent(pakkeName))
      : null;

    setOrderData((prev) => ({
      ...prev,
      occasion: anledning,
      selectedPackage: matchedPkg || null,
      isCustomDesign: false,
    }));

    // Jump to details (step 4) if a package was matched, else jump to package selection (step 3)
    setCurrentStep(matchedPkg ? 4 : 3);

    // Clean up URL params
    setSearchParams({}, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    setDirection('forward');
    // "Annet" has no packages — skip straight to details as custom design
    if (occasion === 'annet') {
      setOrderData((prev) => ({ ...prev, occasion, selectedPackage: null, isCustomDesign: true }));
      setTimeout(() => setCurrentStep(4), 300);
    } else {
      setOrderData((prev) => ({ ...prev, occasion, selectedPackage: null, isCustomDesign: false }));
      setTimeout(() => setCurrentStep(3), 300);
    }
  };

  const handlePackageSelect = (pkg: PackageOption) => {
    setOrderData((prev) => ({ ...prev, selectedPackage: pkg, isCustomDesign: false }));
    setTimeout(goNext, 400);
  };

  const handleCustomDesign = () => {
    setOrderData((prev) => ({ ...prev, selectedPackage: null, isCustomDesign: true }));
    setTimeout(goNext, 400);
  };

  const handleDetailsUpdate = (data: Partial<OrderData>) => {
    setOrderData((prev) => ({ ...prev, ...data }));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const result = await submitOrder(orderData);
    setIsSubmitting(false);

    if (result.success) {
      setOrderRef(result.orderRef || null);
      goNext();
    } else {
      toast({
        title: 'Noe gikk galt',
        description: 'Bestillingen kunne ikke sendes. Prøv igjen senere.',
        variant: 'destructive',
      });
    }
  };

  const handleNewOrder = () => {
    setOrderData(initialOrderData);
    setOrderRef(null);
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

      {/* Back button + Progress indicator (for ordering steps) */}
      {currentStep > 1 && currentStep < TOTAL_STEPS && (
        <div className="relative z-40 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-12">
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
            </div>
            <div className="pb-3">
              <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={currentStep === 1 ? '' : currentStep > 1 && currentStep < TOTAL_STEPS ? 'pt-4' : 'pt-8'}>
        <div className={currentStep === 1 ? 'min-h-[calc(100vh-5rem)]' : 'container mx-auto min-h-[calc(100vh-5rem)]'}>
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
                <LandingSection onStart={goNext} onSelectOccasion={handleOccasionSelect} />
              )}

              {currentStep === 2 && (
                <OccasionSection
                  selected={orderData.occasion}
                  onSelect={handleOccasionSelect}
                />
              )}

              {currentStep === 3 && (
                <PackageSection
                  occasion={orderData.occasion}
                  selectedPackage={orderData.selectedPackage}
                  isCustomDesign={orderData.isCustomDesign}
                  onSelectPackage={handlePackageSelect}
                  onSelectCustom={handleCustomDesign}
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
                  isSubmitting={isSubmitting}
                />
              )}

              {currentStep === 6 && (
                <SuccessSection orderRef={orderRef} onNewOrder={handleNewOrder} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Homepage content sections — only visible on landing step */}
      {currentStep === 1 && <HomeSections />}
    </div>
  );
}
